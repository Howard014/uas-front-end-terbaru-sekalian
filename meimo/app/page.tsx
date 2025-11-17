"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";

interface Comment {
  name: string;
  text: string;
  date: string;
  rating?: number;
}

interface MenuItem {
  _id?: string;
  id?: number;
  name: string;
  nama?: string;
  imgSrc: string;
  gambar?: string;
  ratingStars?: string;
  description: string;
  deskripsi?: string;
  history?: string;
  kategori?: string;
  ingredients?: string;
  tips?: string;
  price?: number;
}

interface Background {
  _id: string;
  nama: string;
  url: string;
}

export default function Home() {
  const router = useRouter();

  // UI state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMenu, setFilteredMenu] = useState<MenuItem[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [loadingMenu, setLoadingMenu] = useState<boolean>(false);
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);

  //  Ambil gambar background & menu dari backend API
  useEffect(() => {
    async function fetchData() {
      try {
        const [bgRes, menuRes] = await Promise.all([
          fetch("http://localhost:5000/api/backgrounds"),
          fetch("http://localhost:5000/api/menus"),
        ]);

        if (!bgRes.ok || !menuRes.ok) throw new Error("API response not ok");

        const [bgData, menuData] = await Promise.all([
          bgRes.json(),
          menuRes.json(),
        ]);

        // Gunakan data dari API
        if (Array.isArray(bgData) && bgData.length > 0) {
          setBackgrounds(bgData);
        }

        if (Array.isArray(menuData) && menuData.length > 0) {
          setFilteredMenu(
            menuData.map((m: any) => ({
              ...m,
              name: m.nama || m.name,
              description: m.deskripsi || m.description || "",
              imgSrc: m.gambar || m.imgSrc || "",
              ratingStars: "★★★★☆",
              price: m.price || m.harga || 0,
            }))
          );
        }
      } catch (err) {
        console.error("❌ Error fetching API data:", err);
      } finally {
        setLoadingMenu(false);
      }
    }
    fetchData();
  }, []);

  // Slideshow background auto ganti tiap 5 detik
  useEffect(() => {
    if (backgrounds.length === 0) return;
    const timer = setInterval(
      () => setCurrentBgIndex((prev) => (prev + 1) % backgrounds.length),
      5000
    );
    return () => clearInterval(timer);
  }, [backgrounds]);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load & simpan komentar lokal
  useEffect(() => {
    const stored = localStorage.getItem("meimo_comments");
    if (stored) setComments(JSON.parse(stored));
  }, []);
  useEffect(() => {
    if (comments.length > 0)
      localStorage.setItem("meimo_comments", JSON.stringify(comments));
  }, [comments]);

  //  Pencarian menu
  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = searchQuery.trim().toLowerCase();
    if (q === "") return;
    setFilteredMenu((prev) =>
      prev.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          (m.ingredients || "").toLowerCase().includes(q)
      )
    );
  };

  //  Komentar
  const handleSubmit = (e: FormEvent<HTMLFormEvent>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name =
      form.querySelector<HTMLInputElement>("#nama-user")?.value || "Anonim";
    const text =
      form
        .querySelector<HTMLTextAreaElement>("#isi-komentar")
        ?.value.trim() || "";
    if (!text) return alert("Komentar tidak boleh kosong!");
    if (rating === 0) return alert("Silakan berikan rating terlebih dahulu!");
    const newComment: Comment = {
      name,
      text,
      date: new Date().toLocaleString("id-ID"),
      rating,
    };
    setComments((prev) => [newComment, ...prev]);
    form.reset();
    setRating(0);
  };

  //  Tambah ke keranjang
  const addToCart = async (item: MenuItem, qty = 1) => {
    const key = "meimo_cart";
    const raw = localStorage.getItem(key);
    const cart: { id?: number; name: string; price?: number; qty: number }[] =
      raw ? JSON.parse(raw) : [];

    const exist = cart.find((c) => c.id === item.id && c.name === item.name);
    if (exist) exist.qty += qty;
    else cart.push({ id: item.id, name: item.name, price: item.price, qty });

    localStorage.setItem(key, JSON.stringify(cart));
    alert(`${item.name} ditambahkan ke keranjang.`);
  };


  const bgUrl =
    backgrounds.length > 0
      ? backgrounds[currentBgIndex].url
      : "/images/background/default.jpg";

  return (
    <div>
      {/*  HERO  */}
      <header
        className="hero-section"
        style={{
          backgroundImage: `url(${bgUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="hero-overlay">
          <div className="hero-content text-center text-white">
            <span className="script-text">Rasa</span>
            <h1>MANADO</h1>
            <p className="lead fs-4">
              Jelajahi cita rasa khas Manado dan kisah di baliknya.
            </p>
          </div>
        </div>
      </header>

      {/*  MENU GALLERY */}
      <section id="menu-gallery" className="py-5 bg-dark text-white">
        <div className="container text-center mb-5">
          <h2>Galeri Menu Spesial</h2>
          <p>Klik gambar untuk melihat detail, sejarah, dan resepnya.</p>
        </div>
        <div className="horizontal-scroll-wrapper">
          {filteredMenu.map((menu) => (
            <div
              key={menu._id || menu.name}
              className="scroll-card-item"
              onClick={() => setSelectedMenu(menu)}
            >
              <div className="card menu-card shadow">
                <img
                  src={menu.imgSrc}
                  alt={menu.name}
                  style={{
                    width: "100%",
                    height: "300px",
                    objectFit: "cover",
                  }}
                  className="card-img-top"
                />
                <div className="card-body">
                  <h5>{menu.name}</h5>
                  <div className="text-warning fs-5 mb-2">
                    {menu.ratingStars || "★★★★☆"}
                  </div>
                  <p className="small text-muted">
                    {menu.description?.substring(0, 70)}...
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/*  MODAL DETAIL MENU */}
      {showModal && selectedMenu && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
          onClick={() => setShowModal(false)}
          tabIndex={-1}
        >
          <div
            className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">{selectedMenu.name}</h3>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                  aria-label="Close"
                ></button>
              </div>

              <div className="modal-body p-4 p-lg-5">
                <div className="row">
                  <div className="col-lg-5 mb-4 mb-lg-0">
                    <img
                      src={selectedMenu.imgSrc}
                      alt={selectedMenu.name}
                      style={{
                        width: "100%",
                        height: "400px",
                        objectFit: "cover",
                        borderRadius: "0.5rem",
                      }}
                      className="img-fluid rounded shadow-sm mb-3"
                    />
                    <div className="p-3 bg-light rounded text-center border">
                      <div className="text-warning fs-3 mb-2">
                        {selectedMenu.ratingStars}
                      </div>
                      <small className="text-muted">Rating Rata-Rata</small>
                    </div>
                  </div>

                  <div className="col-lg-7">
                    <div className="mb-4">
                      <h4> Deskripsi</h4>
                      <p>{selectedMenu.description}</p>
                    </div>

                    {selectedMenu.ingredients && (
                      <div className="mb-4">
                        <h4> Bahan-Bahan Utama</h4>
                        <p className="text-muted">{selectedMenu.ingredients}</p>
                      </div>
                    )}

                    <div className="mb-4">
                      <h4> Sejarah & Budaya</h4>
                      <p>{selectedMenu.history}</p>
                    </div>

                    {selectedMenu.tips && (
                      <div className="mb-4">
                        <h4> Tips Chef</h4>
                        <div className="alert alert-warning bg-warning-subtle border-warning">
                          {selectedMenu.tips}
                        </div>
                      </div>
                    )}

                    <hr className="my-4" />
                    <h4> Bagikan Pengalaman Anda</h4>

                    <div className="mb-3 p-3 bg-light rounded border rating-stars text-center">
                      <span className="fw-bold me-3 align-middle fs-5">
                        Beri Rating Anda:
                      </span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className={star <= (hoverRating || rating) ? "active" : ""}
                        >
                          ★
                        </span>
                      ))}
                      {rating > 0 && (
                        <span className="ms-3 text-success fw-bold fs-5 align-middle">
                          ({rating}/5)
                        </span>
                      )}
                    </div>

                    <form className="comment-form" onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label htmlFor="nama-user" className="form-label">
                          Nama Anda
                        </label>
                        <input
                          type="text"
                          id="nama-user"
                          className="form-control"
                          placeholder="Anonim"
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="isi-komentar" className="form-label">
                          Komentar *
                        </label>
                        <textarea
                          id="isi-komentar"
                          rows={4}
                          className="form-control"
                          placeholder="Ceritakan pengalaman Anda mencoba menu ini..."
                          required
                        ></textarea>
                      </div>
                      <button type="submit" className="btn btn-primary w-100 btn-lg">
                         Kirim Komentar
                      </button>
                    </form>

                    <div className="mt-5">
                      <h4 className="mb-3">
                        Komentar Pengguna ({comments.length})
                      </h4>
                      <div
                        style={{ maxHeight: "300px", overflowY: "auto" }}
                        className="p-2 border rounded"
                      >
                        {comments.length === 0 ? (
                          <div className="text-center p-4 bg-light rounded">
                            <p className="text-muted mb-0">
                              Belum ada komentar. Jadilah yang pertama! 🎉
                            </p>
                          </div>
                        ) : (
                          comments.map((c, i) => (
                            <div
                              key={i}
                              className="border-bottom p-3 mb-2 bg-light rounded"
                            >
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                  <strong className="text-primary">
                                    👤 {c.name}
                                  </strong>
                                  {c.rating && (
                                    <span className="ms-2 text-warning fw-bold">
                                      {"★".repeat(c.rating)}
                                      <span className="text-muted">
                                        {"☆".repeat(5 - c.rating)}
                                      </span>
                                    </span>
                                  )}
                                </div>
                                <span className="text-muted small">{c.date}</span>
                              </div>
                              <p className="mb-0">{c.text}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== FOOTER (MAP + INFO + TIDAK DIHAPUS) ========== */}
      <footer className="footer mt-5">
        <div className="container">
          <div className="mb-4">
            <h5 className="mb-3 text-center"> Lokasi Kami</h5>
            <div className="ratio ratio-21x9">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.712454356452!2d106.78726097499202!3d-6.174721693801916!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f70002bcd3f9%3A0xcf51c0e1b63aedf4!2sMeimo%20Masakan%20Manado%20Neo%20Soho!5e0!3m2!1sid!2sid!4v1730989000000!5m2!1sid!2sid"
                style={{ border: 0, borderRadius: "0.5rem" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi Meimo di Jakarta"
              ></iframe>
            </div>
          </div>

          <div className="row text-start mt-5">
            <div className="col-lg-4 mb-4 mb-lg-0">
              <h5 className="footer-brand-title">Meimo</h5>
              <p>
                Baik pelanggan setia maupun pengunjung baru, kami berharap dapat
                melayani Anda dan berbagi hasrat kami untuk masakan lezat.
              </p>
            </div>

            <div className="col-lg-4 mb-4 mb-lg-0">
              <h5>Jam Operasional</h5>
              <p>Setiap Hari: 10:00 - 22:00</p>

              <h5 className="mt-4">Alamat</h5>
              <p>
                Neo Soho Mall, Lantai 4
                <br />
                Jakarta Barat, Indonesia 11470
              </p>
            </div>

            <div className="col-lg-4">
              <h5>Hubungi Kami</h5>
              <p>
                <a href="tel:+6281234567890">+62 812 3456 7890</a> (Reservasi)
                <br />
                <a href="mailto:reservasi@meimo.com">reservasi@meimo.com</a>
              </p>

              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success d-inline-flex align-items-center gap-2 px-4 py-2 mt-3 shadow-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M13.6 2.3A7.8 7.8 0 0 0 8 0 7.9 7.9 0 0 0 .1 7.9a7.8 7.8 0 0 0 1 4L0 16l4.2-1.1a8 8 0 0 0 3.8 1h.1a8 8 0 0 0 5.5-13.6zM8 14.5a6.6 6.6 0 0 1-3.4-.9l-.2-.1-2.5.6.7-2.4-.2-.2a6.6 6.6 0 1 1 5.6 3z" />
                </svg>
                WhatsApp Kami
              </a>
            </div>
          </div>

          <hr className="mt-5 mb-4" style={{ borderColor: "rgba(255,255,255,0.2)" }} />
          <p className="text-muted small mb-0 text-center">
            © {new Date().getFullYear()} Meimo Neo Soho. Semua hak cipta dilindungi.
          </p>
        </div>
      </footer>

      {/* Scroll to Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`btn btn-primary rounded-circle scroll-to-top ${
          showScrollTop ? "show" : ""
        }`}
      >
        ↑
      </button>
    </div>
  );
}
