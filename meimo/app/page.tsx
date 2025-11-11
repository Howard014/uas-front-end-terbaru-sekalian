"use client";

import Image from "next/image";
import { useState, useEffect, FormEvent } from "react";
// useRouter tidak lagi digunakan untuk tombol ini, tapi mungkin masih berguna untuk navigasi lain
import { useRouter } from "next/navigation"; 
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap
import { url } from "inspector";

// 🎨 Daftar gambar untuk slideshow header (tetap pakai file gambar lokal)
const backgroundImages = [
  "/images/background/meimo1.jpg",
  "/images/background/meimo2.jpg",
  "/images/background/meimo.jpg",
];

interface Comment {
  name: string;
  text: string;
  date: string;
  rating?: number;
}

interface MenuItem {
  id?: number;
  name: string;
  imgSrc: string;
  ratingStars: string;
  description: string;
  history: string;
  ingredients?: string;
  tips?: string;
  price?: number;
}

// 🍽 Data Menu - fallback lokal (TIDAK MENGHAPUS / MEMBUAT BARU)
const menuData: MenuItem[] = [
  {
    id: 1,
    name: "Babi Kecap",
    imgSrc: "/images/menu/babikecap.jpg",
    ratingStars: "★★★★☆",
    description:
      "Irisan daging babi dimasak dengan kecap khas Manado yang gurih dan manis. Perpaduan sempurna antara manis, asin, dan sedikit pedas.",
    history:
      "Masakan ini merupakan salah satu sajian tradisional yang sering hadir dalam acara keluarga Manado. Dipengaruhi oleh budaya Tionghoa yang berbaur dengan cita rasa lokal.",
    ingredients:
      "Daging babi, kecap manis, bawang bombay, cabai rawit, jahe, bawang putih",
    tips: "Gunakan daging babi bagian has dalam agar lebih empuk dan cepat matang.",
    price: 45000,
  },
  {
    id: 2,
    name: "Babi Panggang",
    imgSrc: "/images/menu/babipanggang.jpg",
    ratingStars: "★★★★☆",
    description:
      "Daging babi yang dipanggang dengan bumbu rempah khas, menghasilkan kulit yang renyah dan daging yang juicy.",
    history:
      "Sering disajikan dalam perayaan dan pesta adat sebagai hidangan utama. Teknik memanggang ini telah diwariskan turun-temurun.",
    ingredients: "Daging babi, bumbu rica, jeruk nipis, daun jeruk, serai",
    tips: "Marinasi minimal 2 jam agar bumbu meresap sempurna.",
    price: 50000,
  },
  {
    id: 3,
    name: "Tinoransak",
    imgSrc: "/images/menu/tinorangsak.jpg",
    ratingStars: "★★★★★",
    description:
      "Daging babi yang dimasak di dalam bambu dengan bumbu pedas khas Manado.",
    history:
      "Metode memasak di bambu adalah warisan kuliner kuno Minahasa yang masih dilestarikan hingga kini.",
    ingredients: "Daging babi, bumbu rica merah, daun bawang, tomat, bambu muda",
    tips: "Pilih bambu yang masih muda dan segar untuk hasil terbaik.",
    price: 55000,
  },
  {
    id: 4,
    name: "Cakalang Suwir",
    imgSrc: "/images/menu/cakalangsuir.jpg",
    ratingStars: "★★★★★",
    description:
      "Ikan cakalang asap yang disuwir dan dimasak dengan bumbu rica-rica yang pedas.",
    history:
      "Cakalang adalah ikan utama dalam kuliner Manado karena hasil laut yang melimpah.",
    ingredients: "Ikan cakalang asap, cabai merah keriting, tomat, daun kemangi",
    tips: "Cakalang asap yang bagus berwarna keemasan dan tidak terlalu kering.",
    price: 35000,
  },
  {
    id: 5,
    name: "Kangkung Bunga Pepaya",
    imgSrc: "/images/menu/kangkungpepaya.jpg",
    ratingStars: "★★★★☆",
    description:
      "Tumis kangkung dan bunga pepaya dengan cita rasa sedikit pahit namun nikmat.",
    history:
      "Sayuran pendamping yang wajib ada untuk menyeimbangkan rasa pedas masakan utama.",
    ingredients: "Kangkung, bunga pepaya muda, bawang putih, terasi, cabai rawit",
    tips: "Rendam bunga pepaya dalam air garam untuk mengurangi rasa pahit.",
    price: 20000,
  },
  {
    id: 6,
    name: "Goroho Manado",
    imgSrc: "/images/menu/gorohomanado.jpg",
    ratingStars: "★★★★☆",
    description:
      "Pisang goroho (pisang mengkal) yang digoreng tipis dan disajikan dengan sambal roa.",
    history:
      "Camilan khas yang menunjukkan kekayaan hasil bumi Manado. Pisang goroho hanya tumbuh di Sulawesi Utara.",
    ingredients: "Pisang goroho, minyak goreng, sambal roa, garam",
    tips: "Pilih pisang yang masih mengkal agar tidak terlalu manis saat digoreng.",
    price: 18000,
  },
  {
    id: 7,
    name: "Perkedel Jagung",
    imgSrc: "/images/menu/perkedeljagung.jpg",
    ratingStars: "★★★★☆",
    description:
      "Bakwan jagung khas Manado yang renyah di luar dan manis di dalam.",
    history:
      "Juga dikenal sebagai 'Nike', sering dimakan sebagai lauk atau camilan.",
    ingredients: "Jagung manis, tepung terigu, telur, daun bawang, bawang putih",
    tips: "Gunakan jagung manis yang masih segar untuk hasil paling manis.",
    price: 12000,
  },
];

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
  const [filteredMenu, setFilteredMenu] = useState<MenuItem[]>(menuData);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [loadingMenu, setLoadingMenu] = useState<boolean>(false);

  // Slideshow
  useEffect(() => {
    const timer = setInterval(
      () => setCurrentBgIndex((prev) => (prev + 1) % backgroundImages.length),
      5000
    );
    return () => clearInterval(timer);
  }, []);

  // Load comments dari localStorage
  useEffect(() => {
    const stored = localStorage.getItem("meimo_comments");
    if (stored) setComments(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (comments.length > 0)
      localStorage.setItem("meimo_comments", JSON.stringify(comments));
  }, [comments]);

  // Load menu dari backend jika tersedia; fallback ke menuData lokal
  useEffect(() => {
    let mounted = true;
    async function fetchMenu() {
      setLoadingMenu(true);
      try {
        const res = await fetch("http://localhost:5000/api/menu");
        if (!mounted) return;
        if (res.ok) {
          const data: MenuItem[] = await res.json();
          // jika backend mengembalikan array, gunakan itu; jika tidak, tetap fallback
          if (Array.isArray(data) && data.length > 0) {
            setFilteredMenu(data);
            setLoadingMenu(false);
            return;
          }
        }
        // fallback
        setFilteredMenu(menuData);
      } catch (err) {
        // network error atau endpoint tidak ada -> tetap gunakan lokal
        setFilteredMenu(menuData);
      } finally {
        setLoadingMenu(false);
      }
    }
    fetchMenu();
    return () => {
      mounted = false;
    };
  }, []);

  // Scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Search handler (client-side)
  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = searchQuery.trim().toLowerCase();
    if (q === "") {
      setFilteredMenu((prev) => (prev.length ? prev : menuData));
      return;
    }
    setFilteredMenu((prev) =>
      (prev.length ? prev : menuData).filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          (m.ingredients || "").toLowerCase().includes(q)
      )
    );
  };

  // Komentar submit -> saat nanti ingin dihubungkan ke backend, ubah POST ke /api/comments
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
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

    // simpan lokal
    setComments((prev) => [newComment, ...prev]);

    // coba kirim ke backend (opsional, jika endpoint ada)
    (async () => {
      try {
        await fetch("http://localhost:5000/api/comments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newComment),
        });
      } catch (err) {
        // ignore; tetap gunakan localStorage
      }
    })();

    form.reset();
    setRating(0);
  };

  // Modal show
  const handleShowModal = (menu: MenuItem) => {
    setSelectedMenu(menu);
    setShowModal(true);
    setRating(0);
  };

  // Keranjang: simpan di localStorage + POST ke /api/cart bila tersedia
  const addToCart = async (item: MenuItem, qty = 1) => {
    const key = "meimo_cart";
    const raw = localStorage.getItem(key);
    const cart: { id?: number; name: string; price?: number; qty: number }[] =
      raw ? JSON.parse(raw) : [];

    const exist = cart.find((c) => c.id === item.id && c.name === item.name);
    if (exist) {
      exist.qty += qty;
    } else {
      cart.push({ id: item.id, name: item.name, price: item.price, qty });
    }
    localStorage.setItem(key, JSON.stringify(cart));

    // coba sync ke backend cart
    try {
      await fetch("http://localhost:5000/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cart),
      });
    } catch (err) {
      // tidak fatal; tetap gunakan local cart
    }

    alert(`${item.name} ditambahkan ke keranjang.`);
  };

  // Fungsi goToOrderPage() dihapus karena tidak lagi digunakan oleh tombol navbar

  return (
    <div>
      {/* ========== NAVBAR ========== */}
      <nav
        className={`navbar navbar-expand-lg navbar-dark fixed-top px-4 ${
          isScrolled ? "scrolled" : ""
        }`}
      >
        <div className="container-fluid">
          {/* Tombol Dine In / Pesan (DIUBAH) */}
          <div className="d-flex align-items-center ms-auto gap-2">
            {/* Mengubah <button> menjadi <a> (link) ke WhatsApp */}
            <a
              href="https://wa.me/6281234567890?text=Halo%2C%20saya%20ingin%20memesan%20dari%20Meimo."
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-warning fw-bold px-4 py-2"
              style={{ borderRadius: "25px" }}
              role="button" // Menambahkan role button untuk aksesibilitas
            >
              🍽 Dine In / Pesan
            </a>
          </div>
        </div>
      </nav>

      {/* ========== HERO ========== */}
      <header className="hero-section">
        <div className="hero-slideshow">
          {backgroundImages.map((img, i) => (
            <div
              key={img}
              className="hero-slide"
              style={{
                backgroundImage: `url(${img})`,
                opacity: i === currentBgIndex ? 1 : 0,
              }}
            />
          ))}
        </div>

        <div className="hero-content">
          <span className="script-text">Rasa</span>
          <h1>MANADO</h1>
          <p className="lead fs-4">
            Jelajahi cita rasa khas Manado dan kisah di baliknya.
          </p>
        </div>
      </header>

      {/* ========== BRAND SECTION ========== */}
      <section id="brand" className="py-5 bg-light">
        <div className="container">
          <div className="card shadow-lg">
            <div className="card-body p-lg-5">
              <div className="row align-items-center">
                <div className="col-lg-6 mb-4 mb-lg-0">
                  <Image
                    src="/images/logo/meimobran.jpg"
                    alt="Suasana Meimo"
                    width={600}
                    height={400}
                    className="rounded img-fluid"
                    style={{
                      objectFit: "cover",
                      width: "100%",
                      height: "400px",
                    }}
                  />
                </div>
                <div className="col-lg-6">
                  <h2 className="display-4 text-primary">MEIMO</h2>
                  <p className="text-muted mb-3">Temukan Rasa Otentik Manado.</p>
                  <p>
                    Meimo adalah brand yang didedikasikan untuk membawa cita rasa
                    otentik masakan Manado ke panggung kuliner yang lebih luas.
                  </p>

                  {/* Search Bar */}
                  <form
                    onSubmit={handleSearch}
                    className="input-group mb-3 mt-4 shadow-sm"
                  >
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="Cari masakan favorit Anda..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                      className="btn btn-primary"
                      type="submit"
                      id="button-addon2"
                    >
                      🔍 Cari
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== MENU GALLERY ========== */}
      <section id="menu-gallery" className="py-5 bg-dark text-white">
        <div className="container text-center mb-5">
          <h2>Galeri Menu Spesial</h2>
          <p>Klik gambar untuk melihat detail, sejarah, dan resepnya.</p>
        </div>
        <div className="horizontal-scroll-wrapper">
          {(loadingMenu ? menuData : filteredMenu).map((menu) => (
            <div
              key={menu.name + (menu.id ?? menu.name)}
              className="scroll-card-item"
              onClick={() => handleShowModal(menu)}
            >
              <div className="card menu-card shadow">
                <Image
                  src={menu.imgSrc}
                  alt={menu.name}
                  width={400}
                  height={300}
                  className="card-img-top"
                />
                <div className="card-body">
                  <h5>{menu.name}</h5>
                  <div className="text-warning fs-5 mb-2">
                    {menu.ratingStars}
                  </div>
                  <p className="small text-muted">
                    {menu.description.substring(0, 70)}...
                  </p>
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <small className="text-muted">
                      Rp {menu.price ? menu.price.toLocaleString() : "-"}
                    </small>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-light"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(menu, -1); // jika -1 dan belum ada, tidak mengurangi di addToCart
                        }}
                      >
                        −
                      </button>
                      <button
                        className="btn btn-sm btn-success"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(menu, 1);
                        }}
                      >
                        + Tambah
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========== MODAL DETAIL MENU ========= */}
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
                    <Image
                      src={selectedMenu.imgSrc}
                      alt={selectedMenu.name}
                      width={500}
                      height={400}
                      className="img-fluid rounded shadow-sm mb-3"
                      style={{ width: "100%", height: "400px", objectFit: "cover" }}
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
                      <h4>📖 Deskripsi</h4>
                      <p>{selectedMenu.description}</p>
                    </div>

                    {selectedMenu.ingredients && (
                      <div className="mb-4">
                        <h4>🥘 Bahan-Bahan Utama</h4>
                        <p className="text-muted">{selectedMenu.ingredients}</p>
                      </div>
                    )}

                    <div className="mb-4">
                      <h4>📜 Sejarah & Budaya</h4>
                      <p>{selectedMenu.history}</p>
                    </div>

                    {selectedMenu.tips && (
                      <div className="mb-4">
                        <h4>💡 Tips Chef</h4>
                        <div className="alert alert-warning bg-warning-subtle border-warning">
                          {selectedMenu.tips}
                        </div>
                      </div>
                    )}

                    <hr className="my-4" />
                    <h4>💬 Bagikan Pengalaman Anda</h4>

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
                        📤 Kirim Komentar
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
            <h5 className="mb-3 text-center">📍 Lokasi Kami</h5>
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