"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";

// Tipe data untuk item di keranjang
interface CartItem {
  id?: number;
  name: string;
  price?: number;
  qty: number;
}

export default function OrderPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // useEffect untuk memuat data dari localStorage saat komponen di-mount
  useEffect(() => {
    // Pastikan kode ini hanya berjalan di client (browser)
    const rawCart = localStorage.getItem("meimo_cart");
    
    if (rawCart) {
      try {
        const parsedCart: CartItem[] = JSON.parse(rawCart);
        setCartItems(parsedCart);

        // Hitung total harga
        const cartTotal = parsedCart.reduce((sum, item) => {
          return sum + (item.price || 0) * (item.qty || 0);
        }, 0);
        setTotal(cartTotal);

      } catch (e) {
        console.error("Gagal memuat data keranjang:", e);
        // Jika data korup, hapus
        localStorage.removeItem("meimo_cart");
      }
    }
    setIsLoading(false); // Selesai loading
  }, []); // Array dependensi kosong agar hanya berjalan sekali

  // Fungsi untuk simulasi checkout
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Keranjang Anda kosong!");
      return;
    }

    // Simulasi proses pesanan
    alert(
      `Pesanan berhasil!\nTotal Pembayaran: Rp ${total.toLocaleString()}\n\nTerima kasih telah memesan di Meimo!`
    );

    // Kosongkan keranjang dan kembali ke halaman utama
    localStorage.removeItem("meimo_cart");
    setCartItems([]);
    setTotal(0);
    router.push("/"); // Arahkan kembali ke home
  };

  // Tampilan loading
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="ms-3 fs-4">Memuat Keranjang...</span>
      </div>
    );
  }

  // Tampilan utama halaman keranjang
  return (
    // Beri padding atas agar tidak tertutup navbar fixed
    <div className="bg-light" style={{ minHeight: "100vh", paddingTop: "100px" }}>
      <div className="container py-5">
        <div className="row">
          {/* Batasi lebar konten agar lebih rapi di layar besar */}
          <div className="col-lg-10 mx-auto">

            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="text-primary fw-bold">🛒 Keranjang Anda</h1>
              <Link href="/" className="btn btn-outline-secondary">
                &larr; Kembali ke Menu
              </Link>
            </div>

            {/* Kondisi jika keranjang kosong */}
            {cartItems.length === 0 ? (
              <div className="card shadow-sm border-0">
                <div className="card-body text-center p-5">
                  <h4 className="card-title">Keranjang Anda Kosong</h4>
                  <p className="text-muted">
                    Sepertinya Anda belum menambahkan menu apapun.
                  </p>
                  <Link href="/" className="btn btn-primary mt-3">
                    Lihat Menu
                  </Link>
                </div>
              </div>
            ) : (
              // Kondisi jika ada isi keranjang
              <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th scope="col" className="p-3 fs-5">Menu</th>
                          <th scope="col" className="p-3 fs-5">Harga</th>
                          <th scope="col" className="p-3 fs-5">Jumlah</th>
                          <th scope="col" className="p-3 fs-5 text-end">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartItems.map((item) => (
                          <tr key={item.id || item.name}>
                            <td className="p-3 fw-bold">{item.name}</td>
                            <td className="p-3">Rp {(item.price || 0).toLocaleString()}</td>
                            <td className="p-3">{item.qty}</td>
                            <td className="p-3 text-end">
                              Rp {((item.price || 0) * item.qty).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bagian Total dan Tombol Checkout */}
                <div className="card-footer bg-white p-4">
                  <div className="d-flex justify-content-end align-items-center mb-4">
                    <h4 className="mb-0 me-3 text-muted">Total:</h4>
                    <h2 className="mb-0 fw-bold text-success">
                      Rp {total.toLocaleString()}
                    </h2>
                  </div>
                  <div className="d-grid gap-2">
                    <button
                      onClick={handleCheckout}
                      className="btn btn-success btn-lg fw-bold"
                    >
                      Proses ke Pembayaran (Checkout)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}