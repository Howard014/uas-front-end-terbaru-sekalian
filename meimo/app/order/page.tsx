"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";

// 1. TIPE DATA
interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: "Makanan Utama" | "Camilan" | "Minuman" | "Penutup";
}
interface CartItem extends MenuItem {
  qty: number;
}

// 2. DATA MENU (Data lokal jika backend gagal)
const menuData: MenuItem[] = [
  {
    id: 1, 
    name: "Babi Kecap", 
    description: "Daging babi, bumbu rempah, garam, kunyit, jahe", 
    price: 45000, 
    image: "https://res.cloudinary.com/dgoxc9dmz/image/upload/v1763041886/babikecap_fn3l80.jpg", 
    category: "Makanan Utama", 
  },
  {
    id: 2, 
    name: "Babi Panggang", 
    description: "Beras, daging sapi, santan, telur, bumbu tradisional", 
    price: 50000, 
    image: "https://res.cloudinary.com/dgoxc9dmz/image/upload/v1763012472/babipanggang_vtnl5y.jpg", 
    category: "Makanan Utama", 
  },
  {
    id: 3, 
    name: "Tinoransak", 
    description: "Daging babi (bisa diganti ayam/ikan), cabai rawit (jumlah banyak), jahe, kunyit, sereh...", 
    price: 55000,
    image: "https://res.cloudinary.com/dgoxc9dmz/image/upload/v1763012472/tinoransak_esokba.jpg", 
    category: "Makanan Utama", 
  },
  {
    id: 4, 
    name: "Cakalang Suwir", 
    description: "Ikan cakalang asap suwir dimasak rica-rica pedas.", 
    price: 35000, 
    image: "https://res.cloudinary.com/dgoxc9dmz/image/upload/v1763012472/cakalangsuwir_m49e5s.jpg", 
    category: "Makanan Utama", 
  },
  {
    id: 5, 
    name: "Kangkung Bunga Pepaya", 
    description: "Kangkung, bunga pepaya, cabai rawit, bawang merah, jahe, daun jeruk...", 
    price: 20000, 
    image: "https://res.cloudinary.com/dgoxc9dmz/image/upload/v1763012472/kangkungbungapepaya_urqe1v.jpg", 
    category: "Makanan Utama", 
  },
  {
    id: 6, 
    name: "Goroho Manado", 
    description: "lagi tanya ownernya.", 
    price: 18000, 
    image: "https://res.cloudinary.com/dgoxc9dmz/image/upload/v1763012472/gorohomanado_hoypno.jpg", 
    category: "Camilan", 
  },
  {
    id: 7, 
    name: "Perkedel Jagung", 
    description: "Jagung manis (dipipil atau diiris kasar), bawang merah, bawang putih...", 
    price: 12000, 
    image: "https://res.cloudinary.com/dgoxc9dmz/image/upload/v1763012471/perkedeljagung_kmi9ys.jpg", 
    category: "Camilan", 
  },
];

// 3. KOMPONEN UTAMA
export default function OrderPage() {
  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // State loading

  // Hitung Total
  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);

  // Filter Menu
  const filteredData = menuData.filter((item) => {
    const matchCategory = activeCategory === "Semua" || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Tambah ke Keranjang
  const handleAddToCart = (item: MenuItem) => {
    setCartItems((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, qty: c.qty + 1 } : c
        );
      } else {
        return [...prev, { ...item, qty: 1 }];
      }
    });
  };

  // Kurangi dari Keranjang
  const handleDecreaseQty = (id: number) => {
    setCartItems((prev) => 
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, qty: item.qty - 1 };
        }
        return item;
      }).filter((item) => item.qty > 0) // Hapus jika qty jadi 0
    );
  };

  // ===============================================
  // ✨ FUNGSI KIRIM PESANAN KE BACKEND
  // ===============================================
  const handleConfirmOrder = async () => {
    if (cartItems.length === 0) {
      // Kita ganti alert dengan console.log agar tidak mengganggu
      console.warn("Keranjang kosong!");
      return;
    }

    setIsLoading(true); // Mulai loading

    try {
      // 1. Siapkan data untuk dikirim
      const orderData = {
        items: cartItems.map(item => ({
          name: item.name,
          price: item.price,
          qty: item.qty,
        })),
        total: totalPrice,
        status: "pending" // Status awal
      };

      // 2. Kirim ke backend
      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error("Gagal mengirim pesanan ke server");
      }

      // 3. Jika berhasil
      const savedOrder = await response.json();
      console.log("Pesanan berhasil disimpan:", savedOrder);

      // Ganti alert dengan konfirmasi console
      console.log("Pesanan Anda berhasil dibuat! (Status: Menunggu Pembayaran)");
      
      // 4. Kosongkan keranjang & tutup modal
      setCartItems([]);
      setShowCartModal(false);

    } catch (error) {
      console.error("Error saat konfirmasi pesanan:", error);
      // Ganti alert dengan console
      console.error("Maaf, terjadi kesalahan. Coba lagi.");
    } finally {
      setIsLoading(false); // Selesai loading
    }
  };

  return (
    <div className="d-flex bg-light min-vh-100 font-sans">
      
      {/* ================= SIDEBAR ================= */}
      <aside
        className="d-none d-md-flex flex-column p-4 bg-white shadow-sm"
        style={{ width: "280px", position: "fixed", height: "100%", zIndex: 100 }}
      >
        <div className="mb-5 d-flex align-items-center gap-2">
           <Link href="/" className="text-decoration-none d-flex align-items-center gap-2">
              <div className="rounded bg-primary text-white d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}>
                <span className="fw-bold fs-4">M</span>
              </div>
              <h4 className="m-0 fw-bold text-dark" style={{ fontFamily: 'Playfair Display, serif' }}>MeimoResto</h4>
           </Link>
        </div>
        <h6 className="text-muted text-uppercase small fw-bold mb-3 ls-1">Menu Kategori</h6>
        <nav className="nav flex-column gap-2 mb-auto">
          {["Semua", "Makanan Utama", "Camilan", "Minuman", "Penutup"].map(cat => (
             <CategoryButton 
                key={cat}
                label={cat === "Semua" ? "Semua Menu" : cat}
                icon={getIcon(cat)}
                active={activeCategory === cat} 
                onClick={() => setActiveCategory(cat)} 
             />
          ))}
        </nav>
        <div className="mt-4 p-3 bg-primary bg-opacity-10 rounded border border-primary">
           <div className="d-flex justify-content-between align-items-center mb-2">
              <strong className="text-primary">Keranjang Anda</strong>
              <span className="badge bg-primary rounded-pill">{totalItems} Item</span>
           </div>
           <button 
             className="btn btn-primary w-100 btn-sm"
             onClick={() => setShowCartModal(true)}
           >
             Lihat Pesanan
           </button>
        </div>
        <div className="mt-4 pt-3 border-top">
           <Link href="/" className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2">
            <span>🚪</span> Kembali ke Home
           </Link>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-grow-1 p-4" style={{ marginLeft: "280px" }}>
        <header className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h2 className="fw-bold text-dark m-0" style={{ fontFamily: 'Playfair Display, serif' }}>
              Mau makan apa hari ini?
            </h2>
            <p className="text-muted">Temukan cita rasa otentik Manado favoritmu.</p>
          </div>
          <div className="d-flex gap-3 align-items-center">
             <div className="input-group shadow-sm" style={{width: '300px'}}>
                <span className="input-group-text bg-white border-end-0 text-muted">🔍</span>
                <input 
                  type="text" 
                  className="form-control border-start-0 ps-0" 
                  placeholder="Cari menu..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
             <div className="rounded-circle bg-warning text-white d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{width: '45px', height:'45px'}}>U</div>
          </div>
        </header>

        <div className="row g-4">
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <div key={item.id} className="col-12 col-md-6 col-xl-4">
                <div className="card border-0 shadow-sm h-100 overflow-hidden hover-shadow transition-all" style={{borderRadius: '1rem'}}>
                  <div style={{ height: '200px', position: 'relative', overflow: 'hidden' }}>
                    <Image 
                        src={item.image} 
                        alt={item.name} 
                        fill
                        style={{objectFit: "cover"}}
                        className="card-img-top"
                    />
                    <span className="badge bg-white text-dark position-absolute top-0 start-0 m-3 px-3 py-2 shadow-sm rounded-pill fw-bold">
                      {item.category}
                    </span>
                  </div>
                  <div className="card-body d-flex flex-column p-4">
                    <h5 className="fw-bold text-dark mb-1">{item.name}</h5>
                    <p className="text-muted small flex-grow-1 mb-4">{item.description.substring(0, 80)}...</p>
                    <div className="d-flex justify-content-between align-items-center mt-auto">
                      <h5 className="fw-bold text-primary m-0">Rp {item.price.toLocaleString('id-ID')}</h5>
                      <button 
                        onClick={() => handleAddToCart(item)}
                        className="btn btn-warning text-dark fw-bold rounded-pill px-4 shadow-sm btn-hover-scale"
                      >
                        + Pesan
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center py-5">
                <div className="fs-1 mb-3">🍽</div>
                <h4 className="text-muted">Menu tidak ditemukan</h4>
            </div>
          )}
        </div>
      </main>

      {/* ================= MODAL KERANJANG (REVISI) ================= */}
      {showCartModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">🛒 Detail Pesanan Anda</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowCartModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                {cartItems.length === 0 ? (
                  <div className="text-center py-5">
                    <h3>😢</h3>
                    <p className="text-muted">Keranjang Anda masih kosong.</p>
                    <button className="btn btn-outline-primary btn-sm" onClick={() => setShowCartModal(false)}>Pilih Menu Dulu</button>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Menu</th>
                          <th className="text-center">Harga Satuan</th>
                          <th className="text-center">Qty</th>
                          <th className="text-end">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartItems.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <div className="d-flex align-items-center gap-3">
                                <div style={{width: '50px', height: '50px', position: 'relative', overflow: 'hidden', borderRadius: '8px'}}>
                                   <Image src={item.image} alt={item.name} fill style={{objectFit: 'cover'}} />
                                </div>
                                <span className="fw-bold">{item.name}</span>
                              </div>
                            </td>
                            <td className="text-center">Rp {item.price.toLocaleString('id-ID')}</td>
                            <td className="text-center">
                              <div className="btn-group btn-group-sm" role="group">
                                <button className="btn btn-outline-secondary" onClick={() => handleDecreaseQty(item.id)} disabled={isLoading}>-</button>
                                <button className="btn btn-light disabled text-dark fw-bold" style={{width: '40px'}}>{item.qty}</button>
                                <button className="btn btn-outline-primary" onClick={() => handleAddToCart(item)} disabled={isLoading}>+</button>
                              </div>
                            </td>
                            <td className="text-end fw-bold">Rp {(item.price * item.qty).toLocaleString('id-ID')}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="border-top-2">
                        <tr className="table-active">
                          <td colSpan={3} className="text-end fs-5"><strong>Total Pembayaran:</strong></td>
                          <td className="text-end fs-4 text-primary fw-bold">Rp {totalPrice.toLocaleString('id-ID')}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCartModal(false)} disabled={isLoading}>
                  Tutup
                </button>
                {cartItems.length > 0 && (
                   <button 
                     type="button" 
                     className="btn btn-success fw-bold px-4" 
                     onClick={handleConfirmOrder} 
                     disabled={isLoading} 
                   >
                     {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          <span> Mengirim...</span>
                        </>
                     ) : (
                       "✅ Konfirmasi Pesanan"
                     )}
                   </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .hover-shadow:hover { transform: translateY(-5px); box-shadow: 0 1rem 3rem rgba(0,0,0,.175)!important; }
        .transition-all { transition: all 0.3s ease; }
        .btn-hover-scale:active { transform: scale(0.95); }
      `}</style>
    </div>
  );
}

// --- Helper Components & Functions ---
function getIcon(cat: string) {
  switch(cat) {
    case "Makanan Utama": return "🍲";
    case "Camilan": return "🍌";
    case "Minuman": return "🥤";
    case "Penutup": return "🍧";
    default: return "🍽";
  }
}

function CategoryButton({ label, icon, active, onClick }: { label: string, icon: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`d-flex align-items-center w-100 border-0 p-3 rounded text-start transition-all ${
        active ? "bg-warning text-dark fw-bold shadow-sm" : "bg-transparent text-muted hover-bg-light"
      }`}
    >
      <span className="fs-5 me-3">{icon}</span>
      <span>{label}</span>
      {active && <span className="ms-auto">●</span>}
    </button>
  );
}