"use client";

import Image from "next/image";
import { useState, useEffect, FormEvent } from "react";
// Impor style.css sudah dihapus, karena gayanya ada di globals.css
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap

// 🎨 Daftar gambar untuk slideshow header
const backgroundImages = [
  '/images/background/meimo1.jpg',
  '/images/background/meimo2.jpg',
  '/images/background/meimo.jpg',
];

interface Comment {
  name: string;
  text: string;
  date: string;
  rating?: number;
}

interface MenuItem {
  name: string;
  imgSrc: string;
  ratingStars: string;
  description: string;
  history: string;
  ingredients?: string;
  tips?: string;
}

// 🍽️ Data Menu yang Diperkaya
const menuData: MenuItem[] = [
  {
    name: "Babi Kecap",
    imgSrc: "/images/menu/babikecap.jpg",
    ratingStars: "★★★★☆",
    description: "Irisan daging babi dimasak dengan kecap khas Manado yang gurih dan manis. Perpaduan sempurna antara manis, asin, dan sedikit pedas.",
    history: "Masakan ini merupakan salahah satu sajian tradisional yang sering hadir dalam acara keluarga Manado. Dipengaruhi oleh budaya Tionghoa yang berbaur dengan cita rasa lokal.",
    ingredients: "Daging babi, kecap manis, bawang bombay, cabai rawit, jahe, bawang putih",
    tips: "Gunakan daging babi bagian has dalam agar lebih empuk dan cepat matang."
  },
  {
    name: "Babi Panggang",
    imgSrc: "/images/menu/babipanggang.jpg",
    ratingStars: "★★★★☆",
    description: "Daging babi yang dipanggang dengan bumbu rempah khas, menghasilkan kulit yang renyah dan daging yang juicy. Aromanya sangat menggugah selera!",
    history: "Sering disajikan dalam perayaan dan pesta adat sebagai hidangan utama. Teknik memanggang ini telah diwariskan turun-temurun.",
    ingredients: "Daging babi, bumbu rica, jeruk nipis, daun jeruk, serai",
    tips: "Marinasi minimal 2 jam agar bumbu meresap sempurna."
  },
  {
    name: "Tinoransak",
    imgSrc: "/images/menu/tinorangsak.jpg",
    ratingStars: "★★★★★",
    description: "Daging babi yang dimasak di dalam bambu dengan bumbu pedas khas Manado. Teknik memasak tradisional yang menghasilkan cita rasa unik dan autentik.",
    history: "Metode memasak di bambu adalah warisan kuliner kuno Minahasa yang masih dilestarikan hingga kini. Bambu memberikan aroma khas pada masakan.",
    ingredients: "Daging babi, bumbu rica merah, daun bawang, tomat, bambu muda",
    tips: "Pilih bambu yang masih muda dan segar untuk hasil terbaik."
  },
  {
    name: "Cakalang Suwir",
    imgSrc: "/images/menu/cakalangsuir.jpg",
    ratingStars: "★★★★★",
    description: "Ikan cakalang asap yang disuwir dan dimasak dengan bumbu rica-rica yang pedas. Tekstur ikan yang berserat dengan cita rasa pedas yang khas.",
    history: "Cakalang adalah ikan utama dalam kuliner Manado karena hasil laut yang melimpah. Teknik pengasapan membuat ikan tahan lama.",
    ingredients: "Ikan cakalang asap, cabai merah keriting, tomat, daun kemangi",
    tips: "Cakalang asap yang bagus berwarna keemasan dan tidak terlalu kering."
  },
  {
    name: "Kangkung Bunga Pepaya",
    imgSrc: "/images/menu/kangkungpepaya.jpg",
    ratingStars: "★★★★☆",
    description: "Tumis kangkung dan bunga pepaya dengan cita rasa sedikit pahit namun nikmat. Kombinasi unik yang menyegarkan.",
    history: "Sayuran pendamping yang wajib ada untuk menyeimbangkan rasa pedas masakan utama. Bunga pepaya kaya akan nutrisi.",
    ingredients: "Kangkung, bunga pepaya muda, bawang putih, terasi, cabai rawit",
    tips: "Rendam bunga pepaya dalam air garam untuk mengurangi rasa pahit."
  },
  {
    name: "Goroho Manado",
    imgSrc: "/images/menu/gorohomanado.jpg",
    ratingStars: "★★★★☆",
    description: "Pisang goroho (pisang mengkal) yang digoreng tipis dan disajikan dengan sambal roa. Gurih, renyah, dan pedas dalam satu gigitan!",
    history: "Camilan khas yang menunjukkan kekayaan hasil bumi Manado. Pisang goroho hanya tumbuh di Sulawesi Utara.",
    ingredients: "Pisang goroho, minyak goreng, sambal roa, garam",
    tips: "Pilih pisang yang masih mengkal agar tidak terlalu manis saat digoreng."
  },
  {
    name: "Perkedel Jagung",
    imgSrc: "/images/menu/perkedeljagung.jpg",
    ratingStars: "★★★★☆",
    description: "Bakwan jagung khas Manado yang renyah di luar dan manis di dalam. Cocok sebagai lauk atau camilan kapan saja.",
    history: "Juga dikenal sebagai 'Nike', sering dimakan sebagai lauk atau camilan. Jagung adalah komoditas utama di Minahasa.",
    ingredients: "Jagung manis, tepung terigu, telur, daun bawang, bawang putih",
    tips: "Gunakan jagung manis yang masih segar untuk hasil paling manis."
  },
];

export default function Home() {
  // 🎯 State Management
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

  // 🎬 Slideshow Effect untuk Background
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBgIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // 💾 Load Comments dari LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("meimo_comments");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setTimeout(() => setComments(parsed), 0);
        } catch (err) {
          console.error("Gagal parse komentar:", err);
        }
      }
    }
  }, []);

  // 💾 Save Comments ke LocalStorage
  useEffect(() => {
    // Hanya simpan jika 'comments' bukan array kosong di awal load
    if (comments.length > 0) {
      localStorage.setItem("meimo_comments", JSON.stringify(comments));
    }
  }, [comments]);

  // 🔍 Filter Menu berdasarkan Search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFilteredMenu(menuData);
    } else {
      const filtered = menuData.filter(menu =>
        menu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        menu.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        menu.ingredients?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMenu(filtered);
    }
  }, [searchQuery]);

  // 📜 Scroll Effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50); // Navbar berubah lebih cepat
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 📝 Handle Submit Komentar
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const nameInput = form.querySelector<HTMLInputElement>("#nama-user");
    const textArea = form.querySelector<HTMLTextAreaElement>("#isi-komentar");
    const name = nameInput?.value || "Anonim";
    const text = textArea?.value.trim() || "";
    
    if (!text) {
      alert("Komentar tidak boleh kosong!");
      return;
    }
    if (rating === 0) {
      alert("Silakan berikan rating terlebih dahulu!");
      return;
    }

    const newComment: Comment = {
      name,
      text,
      date: new Date().toLocaleString("id-ID"),
      rating
    };

    setComments((prev) => [newComment, ...prev]);
    form.reset();
    setRating(0);
    
    // Tampilkan notifikasi sukses Bootstrap
    const notification = document.createElement('div');
    notification.className = 'alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3 shadow-lg';
    notification.style.zIndex = '9999';
    notification.textContent = '✓ Komentar berhasil ditambahkan!';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  // 🎯 Handle Modal (dengan Overflow logic)
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [showModal]);

  const handleShowModal = (menu: MenuItem) => {
    setSelectedMenu(menu);
    setShowModal(true);
    setRating(0);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMenu(null);
  };

  // 🔼 Scroll to Top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 🔍 Handle Search
  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Search sudah otomatis dengan useEffect
    // Fokuskan ke galeri menu
    const menuSection = document.getElementById('menu-gallery');
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div>
      {/* 🎬 HERO SECTION dengan Slideshow & Navbar Bootstrap */}
      <header className="hero-section">
        {/* Navbar Bootstrap */}
        <nav className={`navbar navbar-expand-lg navbar-dark fixed-top px-4 ${isScrolled ? 'scrolled' : ''}`}>
          <div className="container-fluid">
            <a className="navbar-brand" href="#">Meimo</a>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <a className="nav-link" href="#brand">Tentang Rasa</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#menu-gallery">Galeri Kuliner</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#footer">Kontak</a>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Slideshow Background */}
        <div className="hero-slideshow">
          {backgroundImages.map((imgSrc, index) => (
            <div
              key={imgSrc}
              className="hero-slide"
              style={{
                backgroundImage: `url(${imgSrc})`,
                opacity: index === currentBgIndex ? 1 : 0,
                zIndex: index === currentBgIndex ? 1 : 0,
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="hero-content">
          <span className="script-text">Rasa</span>
          <h1>MANADO</h1>
          <p className="lead fs-4">
            Jelajahi cita rasamu di Manado dan temukan sejarah di balik setiap rasa.
          </p>
          <a href="#menu-gallery" className="btn btn-primary btn-lg mt-3">
            Lihat Menu Kami
          </a>
        </div>
      </header>

      {/* 📖 INTRO SECTION */}
      <section className="text-center py-5 intro-section">
        <div className="container">
          <h2 className="display-5 mb-3">
            Kenal Lebih Dekat mengenai <span>Meimo!</span>
          </h2>
        </div>
      </section>

      {/* 🏢 BRAND SECTION */}
      <section id="brand" className="py-5 bg-light">
        <div className="container">
          <div className="card shadow-lg">
            <div className="card-body p-lg-5">
              <div className="row align-items-center">
                {/* Gambar */}
                <div className="col-lg-6 mb-4 mb-lg-0">
                  <Image
                    src="/images/logo/meimobran.jpg"
                    alt="Suasana Meimo"
                    width={600}
                    height={400}
                    className="rounded img-fluid"
                    style={{ objectFit: 'cover', width: '100%', height: '400px' }}
                  />
                </div>
                {/* Teks & Search */}
                <div className="col-lg-6">
                  <h2 className="display-4 text-primary">MEIMO</h2>
                  <p className="text-muted mb-3">Temukan Rasa Otentik Manado.</p>
                  <p>
                    Meimo adalah brand yang didedikasikan untuk membawa cita rasa otentik
                    masakan Manado ke panggung kuliner yang lebih luas. Kami percaya pada
                    resep warisan dan bahan-bahan segar dari Sulawesi Utara.
                  </p>

                  {/* Search Bar */}
                  <form onSubmit={handleSearch} className="input-group mb-3 mt-4 shadow-sm">
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="Cari masakan favorit Anda..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="btn btn-primary" type="submit" id="button-addon2">
                      🔍 Cari
                    </button>
                  </form>

                  {/* Quick Stats */}
                  <div className="row mt-4 text-center">
                    <div className="col-4">
                      <div className="p-3 bg-white rounded shadow-sm border">
                        <h4 className="mb-0 text-primary">{menuData.length}</h4>
                        <small className="text-muted">Menu</small>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="p-3 bg-white rounded shadow-sm border">
                        <h4 className="mb-0 text-danger">{comments.length}</h4>
                        <small className="text-muted">Review</small>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="p-3 bg-white rounded shadow-sm border">
                        <h4 className="mb-0 text-warning">4.8</h4>
                        <small className="text-muted">Rating</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🍽️ GALERI MENU */}
      <section id="menu-gallery">
        {/* Wrapper untuk 'container' agar judul tetap di dalam batas */}
        <div className="container">
          <div className="text-center text-white mb-5">
            <h2 className="display-4">Galeri Menu Spesial</h2>
            <p className="lead">Klik pada gambar untuk melihat detail, sejarah, dan resepnya.</p>
          </div>

          {/* Search Result Info */}
          {searchQuery && (
            <div className="text-center mb-4">
              <p className="text-white fs-5">
                Ditemukan <strong>{filteredMenu.length}</strong> menu untuk &ldquo;{searchQuery}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Menu Cards (Horizontal Scroll) */}
        {filteredMenu.length > 0 ? (
          <div className="horizontal-scroll-wrapper">
            {filteredMenu.map((menu) => (
              <div key={menu.name} className="scroll-card-item"> 
                <div
                  className="card shadow menu-card" 
                  style={{ cursor: "pointer" }}
                  onClick={() => handleShowModal(menu)}
                >
                  <Image
                    src={menu.imgSrc}
                    className="card-img-top"
                    alt={menu.name}
                    width={400}
                    height={300} // Ini untuk aspect ratio, biarkan saja
                    style={{ objectFit: 'cover', height: '220px' }} /* Tinggi gambar dikecilkan */
                  />
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title fs-5">{menu.name}</h5> {/* Font size dikecilkan */}
                    <div className="text-warning fs-5 mb-2">{menu.ratingStars}</div> {/* Font size dikecilkan */}
                    <p className="card-text text-muted small">
                      {menu.description.substring(0, 70)}... {/* Teks dipersingkat */}
                    </p>
                    <button className="btn btn-sm btn-outline-primary mt-3 align-self-start">
                      Lihat Detail →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Ini adalah pesan jika tidak ada menu yang ditemukan
          <div className="container"> 
            <div className="col-12 text-center text-white mt-5">
              <h3 className="display-5">😢</h3>
              <h3>Tidak ada menu yang ditemukan</h3>
              <p className="lead">Coba kata kunci lain atau lihat semua menu kami.</p>
              <button
                className="btn btn-light mt-3"
                onClick={() => setSearchQuery("")}
              >
                Lihat Semua Menu
              </button>
            </div>
          </div>
        )}
      </section>

      {/* <footer> (BARU) */}
      <footer id="footer" className="footer">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 col-md-6 mb-4 mb-lg-0">
              <h5 className="mb-3">Meimo</h5>
              <p className="text-muted">Membawa cita rasa otentik Manado ke meja Anda. Resep warisan, bumbu segar, dan cinta pada kuliner.</p>
            </div>
            <div className="col-lg-2 col-md-6 mb-4 mb-lg-0">
              <h5 className="mb-3">Navigasi</h5>
              <ul className="list-unstyled">
                <li className="mb-2"><a href="#brand">Tentang</a></li>
                <li className="mb-2"><a href="#menu-gallery">Menu</a></li>
                <li className="mb-2"><a href="#">Privasi</a></li>
              </ul>
            </div>
            <div className="col-lg-3 col-md-6 mb-4 mb-md-0">
              <h5 className="mb-3">Sosial Media</h5>
              <ul className="list-unstyled">
                <li className="mb-2"><a href="#">🎥 Youtube</a></li>
                <li className="mb-2"><a href="#">📱 Instagram</a></li>
                <li className="mb-2"><a href="#">📘 Facebook</a></li>
              </ul>
            </div>
            <div className="col-lg-3 col-md-6">
              <h5 className="mb-3">Kontak</h5>
              <p className="text-muted mb-1">Jalan Kuliner No. 1</p>
              <p className="text-muted mb-1">Manado, Sulawesi Utara</p>
              <p className="text-muted mb-1">info@meimo.com</p>
            </div>
          </div>
          <hr className="my-4 border-secondary" />
          <div className="text-center text-muted">
            <small>&copy; {new Date().getFullYear()} Meimo. Dibuat untuk Proyek Akhir Frontend.</small>
          </div>
        </div>
      </footer>

      {/* 🔼 Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`btn btn-primary rounded-circle shadow-lg scroll-to-top ${showScrollTop ? 'show' : ''}`}
      >
        ↑
      </button>

      {/* 🎭 MODAL DETAIL MENU */}
      {showModal && selectedMenu && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
          onClick={handleCloseModal}
          tabIndex={-1}
        >
          <div
            className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              {/* Header */}
              <div className="modal-header">
                <h3 className="modal-title">{selectedMenu.name}</h3>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                  aria-label="Close"
                ></button>
              </div>

              {/* Body */}
              <div className="modal-body p-4 p-lg-5">
                <div className="row">
                  {/* Gambar & Rating Statis */}
                  <div className="col-lg-5 mb-4 mb-lg-0">
                    <Image
                      src={selectedMenu.imgSrc}
                      alt={selectedMenu.name}
                      width={500}
                      height={400}
                      className="img-fluid rounded shadow-sm mb-3"
                      style={{ width: '100%', height: '400px', objectFit: 'cover' }}
                    />
                    <div className="p-3 bg-light rounded text-center border">
                      <div className="text-warning fs-3 mb-2">
                        {selectedMenu.ratingStars}
                      </div>
                      <small className="text-muted">Rating Rata-Rata</small>
                    </div>
                  </div>

                  {/* Detail & Komentar */}
                  <div className="col-lg-7">
                    
                    {/* Deskripsi */}
                    <div className="mb-4">
                      <h4>📖 Deskripsi</h4>
                      <p>{selectedMenu.description}</p>
                    </div>

                    {/* Bahan-bahan */}
                    {selectedMenu.ingredients && (
                      <div className="mb-4">
                        <h4>🥘 Bahan-Bahan Utama</h4>
                        <p className="text-muted">{selectedMenu.ingredients}</p>
                      </div>
                    )}

                    {/* ==================================
                         ✨ PERBAIKAN ERROR DI SINI ✨
                      ==================================
                    */}
                    <div className="mb-4">
                      <h4>📜 Sejarah & Budaya</h4>
                      {/* Mengganti 'selectedMen' menjadi 'selectedMenu' */}
                      <p>{selectedMenu.history}</p>
                    </div>

                    {/* Tips */}
                    {selectedMenu.tips && (
                      <div className="mb-4">
                        <h4>💡 Tips Chef</h4>
                        <div className="alert alert-warning bg-warning-subtle border-warning">
                          {selectedMenu.tips}
                        </div>
                      </div>
                    )}

                    <hr className="my-4" />

                    {/* Form Komentar & Rating Input */}
                    <h4>💬 Bagikan Pengalaman Anda</h4>
                    
                    {/* Rating Input */}
                    <div className="mb-3 p-3 bg-light rounded border rating-stars text-center">
                      <span className="fw-bold me-3 align-middle fs-5">Beri Rating Anda:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className={star <= (hoverRating || rating) ? 'active' : ''}
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

                    {/* Form Komentar */}
                    <form className="comment-form" onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label htmlFor="nama-user" className="form-label">Nama Anda</label>
                        <input
                          type="text"
                          id="nama-user"
                          className="form-control"
                          placeholder="Anonim"
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="isi-komentar" className="form-label">Komentar *</label>
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

                    {/* List Komentar */}
                    <div className="mt-5">
                      <h4 className="mb-3">
                        Komentar Pengguna ({comments.length})
                      </h4>
                      <div style={{ maxHeight: '300px', overflowY: 'auto' }} className="p-2 border rounded">
                        {comments.length === 0 ? (
                          <div className="text-center p-4 bg-light rounded">
                            <p className="text-muted mb-0">
                              Belum ada komentar. Jadilah yang pertama! 🎉
                            </p>
                          </div>
                        ) : (
                          comments.map((c, i) => (
                            <div key={i} className="border-bottom p-3 mb-2 bg-light rounded">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                  <strong className="text-primary">
                                    👤 {c.name}
                                  </strong>
                                  {c.rating && (
                                    <span className="ms-2 text-warning fw-bold">
                                      {"★".repeat(c.rating)}
                                      <span className="text-muted">{"☆".repeat(5 - c.rating)}</span>
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
    </div>
  );
}