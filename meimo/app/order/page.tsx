"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";

// 1. TIPE DATA
interface MenuItem {
  _id?: string;
  nama: string;
  kategori: string;
  harga: number;
  deskripsi: string;
  gambar: string;
  ratingStars?: string;
  history?: string;
  ingredients?: string;
  tips?: string;
}

interface CartItem extends MenuItem {
  qty: number;
}

// 3. KOMPONEN UTAMA
export default function OrderPage() {
  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // State untuk menu dari database
  const [menuData, setMenuData] = useState<MenuItem[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [errorMenu, setErrorMenu] = useState<string>("");

  // ===============================================
  // ✨ FETCH MENU DARI DATABASE (DENGAN POLLING OTOMATIS)
  // ===============================================
  useEffect(() => {
    async function fetchMenuFromDB() {
      try {
        setLoadingMenu(true);
        const response = await fetch("http://localhost:5000/api/menus");

        if (!response.ok) {
          throw new Error("Gagal mengambil data menu dari server");
        }

        const data = await response.json();

        const normalizedData = data.map((item: any) => ({
          _id: item._id || item.id,
          nama: item.nama || item.name || 'Menu Tanpa Nama',
          kategori: item.kategori || item.category || 'Makanan Utama',
          harga: item.harga || item.price || 0,
          deskripsi: item.deskripsi || item.description || '',
          gambar: item.gambar || item.image || item.imgSrc || '/images/placeholder.jpg',
          ratingStars: item.ratingStars || item.rating || '★★★★☆',
          history: item.history || item.sejarah || '',
          ingredients: item.ingredients || item.bahan || '',
          tips: item.tips || ''
        }));

        setMenuData(normalizedData);
        setErrorMenu("");
      } catch (error) {
        console.error("Error fetching menu:", error);
        setErrorMenu("Gagal memuat menu. Silakan refresh halaman.");
        setMenuData([]);
      } finally {
        setLoadingMenu(false);
      }
    }

    fetchMenuFromDB();
    const intervalId = setInterval(fetchMenuFromDB, 5000);
    return () => clearInterval(intervalId);
  }, []);

  // Hitung Total
  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = cartItems.reduce((acc, item) => acc + (item.harga * item.qty), 0);

  // Filter Menu
  const filteredData = menuData.filter((item) => {
    const matchCategory = activeCategory === "Semua" || item.kategori === activeCategory;
    const matchSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Tambah ke Keranjang
  const handleAddToCart = (item: MenuItem) => {
    setCartItems((prev) => {
      const existing = prev.find((c) => c._id === item._id);
      if (existing) {
        return prev.map((c) =>
          c._id === item._id ? { ...c, qty: c.qty + 1 } : c
        );
      } else {
        return [...prev, { ...item, qty: 1 }];
      }
    });
  };

  // Kurangi dari Keranjang
  const handleDecreaseQty = (id: string) => {
    setCartItems((prev) => 
      prev.map((item) => {
        if (item._id === id) {
          return { ...item, qty: item.qty - 1 };
        }
        return item;
      }).filter((item) => item.qty > 0)
    );
  };

  // ===============================================
  // ✨ FUNGSI KIRIM PESANAN KE BACKEND
  // ===============================================
  const handleConfirmOrder = async () => {
    if (cartItems.length === 0) {
      alert("Keranjang kosong!");
      return;
    }

    setIsLoading(true);

    try {
      const orderData = {
        items: cartItems.map(item => ({
          menuId: item._id,
          name: item.nama,
          price: item.harga,
          qty: item.qty,
        })),
        total: totalPrice,
        status: "pending"
      };

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

      const savedOrder = await response.json();
      console.log("Pesanan berhasil disimpan:", savedOrder);
      alert("✅ Pesanan Anda berhasil dibuat! (Status: Menunggu Pembayaran)");
      
      setCartItems([]);
      setShowCartModal(false);

    } catch (error) {
      console.error("Error saat konfirmasi pesanan:", error);
      alert("❌ Maaf, terjadi kesalahan. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex bg-gradient min-vh-100">
      
      {/* ================= SIDEBAR ================= */}
      <aside
        className="sidebar d-none d-md-flex flex-column p-4"
      >
        <div className="mb-5">
           <Link href="/" className="text-decoration-none d-flex align-items-center gap-3">
              <div className="logo-circle">
                <span className="fw-bold fs-3">M</span>
              </div>
              <div>
                <h4 className="m-0 fw-bold text-dark logo-text">MeimoResto</h4>
                <small className="text-muted">Manado Authentic</small>
              </div>
           </Link>
        </div>

        <div className="mb-4">
          <h6 className="text-muted text-uppercase small fw-bold mb-3 ls-1">
            <span className="me-2">📋</span>Kategori Menu
          </h6>
          <nav className="nav flex-column gap-2">
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
        </div>

        <div className="mt-auto">
          <div className="cart-summary p-4 mb-3">
             <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center gap-2">
                  <span className="fs-4">🛒</span>
                  <strong className="text-dark">Keranjang</strong>
                </div>
                <span className="cart-badge">{totalItems}</span>
             </div>
             <div className="d-flex justify-content-between mb-3 text-muted small">
                <span>Total Items:</span>
                <span className="fw-bold text-dark">{totalItems} pcs</span>
             </div>
             <div className="divider mb-3"></div>
             <div className="d-flex justify-content-between mb-3">
                <span className="fw-bold">Total:</span>
                <span className="fw-bold text-primary fs-5">Rp {totalPrice.toLocaleString('id-ID')}</span>
             </div>
             <button 
               className="btn-cart w-100"
               onClick={() => setShowCartModal(true)}
             >
               <span className="me-2">👀</span>
               Lihat Pesanan
             </button>
          </div>
          
          <Link href="/" className="btn-back w-100">
            <span className="me-2">←</span> Kembali ke Home
          </Link>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-grow-1 p-4 main-content">
        <header className="header-section mb-5">
          <div className="container-fluid">
            <div className="row align-items-center">
              <div className="col-lg-6">
                <h1 className="header-title mb-2">
                  Mau makan apa hari ini? 🍽️
                </h1>
                <p className="header-subtitle">
                  Temukan cita rasa otentik Manado favoritmu dengan sentuhan rumahan
                </p>
              </div>
              <div className="col-lg-6">
                <div className="d-flex gap-3 align-items-center justify-content-lg-end">
                   <div className="search-container">
                      <span className="search-icon">🔍</span>
                      <input 
                        type="text" 
                        className="search-input" 
                        placeholder="Cari menu favorit..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                   </div>
                   <div className="user-avatar">
                     <span>U</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Loading State */}
        {loadingMenu ? (
          <div className="loading-container">
            <div className="spinner-border text-warning" role="status" style={{width: '3rem', height: '3rem'}}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-4 text-muted fw-medium">Memuat menu lezat untuk Anda...</p>
          </div>
        ) : errorMenu ? (
          <div className="alert alert-danger shadow-sm" role="alert">
            <strong>⚠️ Error:</strong> {errorMenu}
          </div>
        ) : (
          <div className="row g-4">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <div key={item._id} className="col-12 col-md-6 col-xl-4">
                  <div className="menu-card">
                    <div className="menu-image-container">
                      <Image 
                          src={item.gambar} 
                          alt={item.nama} 
                          fill
                          style={{objectFit: "cover"}}
                          className="menu-image"
                      />
                      <div className="menu-overlay"></div>
                      <span className="category-badge">
                        {getIcon(item.kategori)} {item.kategori}
                      </span>
                      {item.ratingStars && (
                        <div className="rating-badge">
                          {item.ratingStars}
                        </div>
                      )}
                    </div>
                    <div className="menu-content">
                      <h5 className="menu-title">{item.nama}</h5>
                      <p className="menu-description">
                        {item.deskripsi?.substring(0, 80) || "Hidangan lezat khas Manado"}...
                      </p>
                      <div className="menu-footer">
                        <div className="price-tag">
                          {item.harga && item.harga > 0 ? (
                            <>
                              <small className="text-muted d-block">Harga</small>
                              <span className="price">Rp {item.harga.toLocaleString('id-ID')}</span>
                            </>
                          ) : (
                            <span className="text-danger">Harga tidak tersedia</span>
                          )}
                        </div>
                        <button 
                          onClick={() => handleAddToCart(item)}
                          className="btn-order"
                          disabled={!item.harga || item.harga <= 0}
                        >
                          <span className="me-2">+</span>
                          Pesan
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12">
                <div className="empty-state">
                  <div className="empty-icon">🍽️</div>
                  <h4 className="empty-title">Menu tidak ditemukan</h4>
                  <p className="empty-text">Coba kata kunci lain atau pilih kategori berbeda</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ================= MODAL KERANJANG ================= */}
      {showCartModal && (
        <div className="modal fade show d-block modal-backdrop-custom" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
            <div className="modal-content modal-custom">
              <div className="modal-header-custom">
                <div>
                  <h5 className="modal-title-custom">
                    <span className="me-2">🛒</span>
                    Keranjang Belanja
                  </h5>
                  <small className="text-white-50">{totalItems} item dipilih</small>
                </div>
                <button type="button" className="btn-close-custom" onClick={() => setShowCartModal(false)}>
                  ✕
                </button>
              </div>
              <div className="modal-body p-4">
                {cartItems.length === 0 ? (
                  <div className="empty-cart">
                    <div className="empty-cart-icon">🛒</div>
                    <h4 className="empty-cart-title">Keranjang Masih Kosong</h4>
                    <p className="empty-cart-text">Yuk, pilih menu favoritmu sekarang!</p>
                    <button className="btn-explore" onClick={() => setShowCartModal(false)}>
                      Jelajahi Menu
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="cart-items">
                      {cartItems.map((item, index) => (
                        <div key={item._id} className="cart-item">
                          <div className="cart-item-image">
                             <Image src={item.gambar} alt={item.nama} fill style={{objectFit: 'cover'}} />
                          </div>
                          <div className="cart-item-details">
                            <h6 className="cart-item-name">{item.nama}</h6>
                            <p className="cart-item-price">Rp {(item.harga || 0).toLocaleString('id-ID')}</p>
                          </div>
                          <div className="cart-item-quantity">
                            <button 
                              className="qty-btn qty-btn-minus" 
                              onClick={() => handleDecreaseQty(item._id!)} 
                              disabled={isLoading}
                            >
                              −
                            </button>
                            <span className="qty-display">{item.qty}</span>
                            <button 
                              className="qty-btn qty-btn-plus" 
                              onClick={() => handleAddToCart(item)} 
                              disabled={isLoading}
                            >
                              +
                            </button>
                          </div>
                          <div className="cart-item-subtotal">
                            Rp {((item.harga || 0) * item.qty).toLocaleString('id-ID')}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="cart-summary-box">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Subtotal</span>
                        <span className="fw-medium">Rp {totalPrice.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Pajak (10%)</span>
                        <span className="fw-medium">Rp {(totalPrice * 0.1).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="divider my-3"></div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold fs-5">Total Pembayaran</span>
                        <span className="total-price">Rp {(totalPrice * 1.1).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {cartItems.length > 0 && (
                <div className="modal-footer-custom">
                  <button type="button" className="btn-secondary-custom" onClick={() => setShowCartModal(false)} disabled={isLoading}>
                    Lanjut Belanja
                  </button>
                  <button 
                    type="button" 
                    className="btn-confirm-custom" 
                    onClick={handleConfirmOrder} 
                    disabled={isLoading} 
                  >
                    {isLoading ? (
                       <>
                         <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                         Memproses...
                       </>
                    ) : (
                      <>
                        <span className="me-2">✓</span>
                        Konfirmasi Pesanan
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600;700&display=swap');

        * {
          font-family: 'Inter', sans-serif;
        }

        .bg-gradient {
          background: linear-gradient(135deg, #f5f7fa 0%, #e8f0f7 100%);
        }

        /* ========== SIDEBAR ========== */
        .sidebar {
          width: 300px;
          position: fixed;
          height: 100vh;
          background: white;
          box-shadow: 4px 0 24px rgba(0,0,0,0.06);
          z-index: 100;
          overflow-y: auto;
        }

        .logo-circle {
          width: 50px;
          height: 50px;
          border-radius: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .logo-text {
          font-family: 'Playfair Display', serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .nav {
          gap: 8px;
        }

        .category-btn {
          display: flex;
          align-items: center;
          width: 100%;
          border: none;
          padding: 14px 18px;
          border-radius: 12px;
          text-align: left;
          transition: all 0.3s ease;
          background: transparent;
          color: #6b7280;
          font-weight: 500;
          position: relative;
          overflow: hidden;
        }

        .category-btn::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 4px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          transform: scaleY(0);
          transition: transform 0.3s ease;
        }

        .category-btn:hover {
          background: #f3f4f6;
          transform: translateX(4px);
        }

        .category-btn.active {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          color: #667eea;
          font-weight: 600;
        }

        .category-btn.active::before {
          transform: scaleY(1);
        }

        .cart-summary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          color: white;
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
        }

        .cart-badge {
          background: white;
          color: #667eea;
          padding: 4px 12px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 14px;
        }

        .divider {
          height: 1px;
          background: rgba(255,255,255,0.2);
        }

        .btn-cart {
          background: white;
          color: #667eea;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .btn-cart:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.15);
        }

        .btn-back {
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          color: #6b7280;
          border: 2px solid #e5e7eb;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .btn-back:hover {
          border-color: #667eea;
          color: #667eea;
          background: rgba(102, 126, 234, 0.05);
        }

        /* ========== MAIN CONTENT ========== */
        .main-content {
          margin-left: 300px;
        }

        .header-section {
          background: white;
          padding: 32px;
          border-radius: 24px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.04);
        }

        .header-title {
          font-family: 'Playfair Display', serif;
          font-size: 2.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .header-subtitle {
          color: #6b7280;
          font-size: 1.1rem;
          margin: 0;
        }

        .search-container {
          position: relative;
          width: 100%;
          max-width: 400px;
        }

        .search-icon {
          position: absolute;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 18px;
          z-index: 1;
        }

        .search-input {
          width: 100%;
          padding: 14px 20px 14px 50px;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          font-size: 15px;
          transition: all 0.3s ease;
          background: white;
        }

        .search-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }

        .user-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 18px;
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
        }

        /* ========== LOADING ========== */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 100px 20px;
        }

        /* ========== MENU CARDS ========== */
        .menu-card {
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .menu-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.12);
        }

        .menu-image-container {
          position: relative;
          height: 240px;
          overflow: hidden;
        }

        .menu-image {
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .menu-card:hover .menu-image {
          transform: scale(1.1);
        }

        .menu-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .menu-card:hover .menu-overlay {
          opacity: 1;
        }

        .category-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          background: white;
          color: #1f2937;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          z-index: 2;
        }

        .rating-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(255,255,255,0.95);
          color: #fbbf24;
          padding: 6px 12px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          z-index: 2;
        }

        .menu-content {
          padding: 24px;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }

        .menu-title {
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 12px;
          font-size: 1.25rem;
        }

        .menu-description {
          color: #6b7280;
          font-size: 14px;
          line-height: 1.6;
          flex-grow: 1;
          margin-bottom: 20px;
        }

        .menu-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-top: auto;
        }

        .price-tag {
          flex: 1;
        }

        .price {
          font-weight: 700;
          color: #667eea;
          font-size: 1.35rem;
          display: block;
        }

        .btn-order {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: white;
          border: none;
          padding: 12px 28px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 15px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
        }

        .btn-order:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(251, 191, 36, 0.4);
        }

        .btn-order:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-order:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* ========== EMPTY STATE ========== */
        .empty-state {
          text-align: center;
          padding: 80px 20px;
          background: white;
          border-radius: 24px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.04);
        }

        .empty-icon {
          font-size: 80px;
          margin-bottom: 24px;
          opacity: 0.5;
        }

        .empty-title {
          color: #1f2937;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .empty-text {
          color: #6b7280;
          font-size: 16px;
        }

        /* ========== MODAL ========== */
        .modal-backdrop-custom {
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
        }

        .modal-custom {
          border: none;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }

        .modal-header-custom {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 24px 32px;
          border: none;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-title-custom {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
        }

        .btn-close-custom {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 20px;
        }

        .btn-close-custom:hover {
          background: rgba(255,255,255,0.3);
          transform: rotate(90deg);
        }

        /* ========== EMPTY CART ========== */
        .empty-cart {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-cart-icon {
          font-size: 100px;
          margin-bottom: 24px;
          opacity: 0.3;
        }

        .empty-cart-title {
          color: #1f2937;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .empty-cart-text {
          color: #6b7280;
          margin-bottom: 32px;
        }

        .btn-explore {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 14px 32px;
          border-radius: 14px;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .btn-explore:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }

        /* ========== CART ITEMS ========== */
        .cart-items {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }

        .cart-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 16px;
          transition: all 0.3s ease;
        }

        .cart-item:hover {
          background: #f3f4f6;
          transform: translateX(4px);
        }

        .cart-item-image {
          position: relative;
          width: 80px;
          height: 80px;
          border-radius: 12px;
          overflow: hidden;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .cart-item-details {
          flex-grow: 1;
          min-width: 0;
        }

        .cart-item-name {
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 4px;
          font-size: 1rem;
        }

        .cart-item-price {
          color: #6b7280;
          font-size: 14px;
          margin: 0;
        }

        .cart-item-quantity {
          display: flex;
          align-items: center;
          gap: 8px;
          background: white;
          padding: 6px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .qty-btn {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .qty-btn-minus {
          background: #fee2e2;
          color: #ef4444;
        }

        .qty-btn-minus:hover:not(:disabled) {
          background: #fecaca;
        }

        .qty-btn-plus {
          background: #dbeafe;
          color: #3b82f6;
        }

        .qty-btn-plus:hover:not(:disabled) {
          background: #bfdbfe;
        }

        .qty-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .qty-display {
          min-width: 30px;
          text-align: center;
          font-weight: 700;
          color: #1f2937;
        }

        .cart-item-subtotal {
          font-weight: 700;
          color: #667eea;
          font-size: 1.1rem;
          min-width: 140px;
          text-align: right;
        }

        /* ========== CART SUMMARY BOX ========== */
        .cart-summary-box {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
          padding: 24px;
          border-radius: 16px;
          border: 2px dashed #667eea;
        }

        .total-price {
          font-size: 1.75rem;
          font-weight: 700;
          color: #667eea;
        }

        /* ========== MODAL FOOTER ========== */
        .modal-footer-custom {
          padding: 20px 32px;
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .btn-secondary-custom {
          background: white;
          color: #6b7280;
          border: 2px solid #e5e7eb;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .btn-secondary-custom:hover:not(:disabled) {
          border-color: #667eea;
          color: #667eea;
        }

        .btn-confirm-custom {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          padding: 12px 32px;
          border-radius: 12px;
          font-weight: 700;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .btn-confirm-custom:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
        }

        .btn-confirm-custom:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* ========== RESPONSIVE ========== */
        @media (max-width: 768px) {
          .sidebar {
            display: none !important;
          }

          .main-content {
            margin-left: 0;
          }

          .header-title {
            font-size: 1.75rem;
          }

          .search-container {
            max-width: 100%;
          }

          .cart-item {
            flex-wrap: wrap;
          }

          .cart-item-subtotal {
            width: 100%;
            text-align: left;
            margin-top: 8px;
          }

          .modal-dialog {
            margin: 8px;
          }
        }

        /* ========== ANIMATIONS ========== */
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .menu-card {
          animation: slideInUp 0.4s ease-out;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .spinner-border {
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

// --- Helper Components & Functions ---
function getIcon(cat: string) {
  switch(cat) {
    case "Makanan Utama": return "🍲";
    case "Camilan": return "🥟";
    case "Minuman": return "🥤";
    case "Penutup": return "🍧";
    default: return "🍽️";
  }
}

function CategoryButton({ label, icon, active, onClick }: { label: string, icon: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`category-btn ${active ? 'active' : ''}`}
    >
      <span className="fs-5 me-3">{icon}</span>
      <span>{label}</span>
      {active && <span className="ms-auto">●</span>}
    </button>
  );
}
