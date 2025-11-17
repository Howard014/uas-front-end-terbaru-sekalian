"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";

interface MenuItem {
  _id?: string;
  nama: string;
  kategori: string;
  harga: number;
  biaya: number;
  stok: number;
  deskripsi: string;
  gambar: string;
  ratingStars: string;
  history: string;
  ingredients: string;
  tips: string;
}

interface Order {
  _id: string;
  items: {
    menuId: string;
    name: string;
    price: number;
    qty: number;
  }[];
  total: number;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"menu" | "orders">("menu");
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [menuRes, orderRes] = await Promise.all([
        fetch("http://localhost:5000/api/menus"),
        fetch("http://localhost:5000/api/orders"),
      ]);

      if (menuRes.ok) {
        const menuData = await menuRes.json();
        
        const normalizedMenuData = menuData.map((item: any) => {
          const priceValue = item.harga || item.price || item.Price || 0;
          const costValue = item.biaya || item.cost || item.Cost || 0;
          
          return {
            _id: item._id || item.id,
            nama: item.nama || item.name || item.Name || '',
            kategori: item.kategori || item.category || item.Category || 'Makanan Utama',
            harga: Number(priceValue) || 0,
            biaya: Number(costValue) || 0,
            stok: Number(item.stok || item.stock || item.Stock || 100),
            deskripsi: item.deskripsi || item.description || item.Description || '',
            gambar: item.gambar || item.image || item.imgSrc || item.Image || '',
            ratingStars: item.ratingStars || item.rating || item.Rating || '★★★★☆',
            history: item.history || item.sejarah || item.History || '',
            ingredients: item.ingredients || item.bahan || item.Ingredients || '',
            tips: item.tips || item.Tips || ''
          };
        });
        
        setMenus(normalizedMenuData);
      }

      if (orderRes.ok) {
        const orderData = await orderRes.json();
        setOrders(orderData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showMessage("danger", "Gagal memuat data dari server");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMenu = async () => {
    if (!editingMenu) return;

    if (!editingMenu.nama || !editingMenu.kategori || editingMenu.harga <= 0) {
      showMessage("warning", "Mohon lengkapi field yang wajib diisi!");
      return;
    }

    try {
      const method = editingMenu._id ? "PUT" : "POST";
      const url = editingMenu._id
        ? `http://localhost:5000/api/menus/${editingMenu._id}`
        : "http://localhost:5000/api/menus";

      const menuData = {
        nama: editingMenu.nama,
        kategori: editingMenu.kategori,
        harga: Number(editingMenu.harga),
        biaya: Number(editingMenu.biaya),
        stok: Number(editingMenu.stok),
        deskripsi: editingMenu.deskripsi,
        gambar: editingMenu.gambar,
        ratingStars: editingMenu.ratingStars,
        history: editingMenu.history,
        ingredients: editingMenu.ingredients,
        tips: editingMenu.tips
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(menuData),
      });

      if (res.ok) {
        showMessage("success", editingMenu._id ? "✅ Menu berhasil diupdate!" : "✅ Menu berhasil ditambahkan!");
        fetchData();
        setShowModal(false);
        setEditingMenu(null);
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal menyimpan menu");
      }
    } catch (error) {
      console.error("Error saving menu:", error);
      showMessage("danger", `❌ Gagal menyimpan menu: ${error}`);
    }
  };

  const handleDeleteMenu = async (id: string) => {
    if (!confirm("Yakin ingin menghapus menu ini?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/menus/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showMessage("success", "🗑 Menu berhasil dihapus!");
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting menu:", error);
      showMessage("danger", "❌ Gagal menghapus menu");
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });

      if (res.ok) {
        showMessage("success", "✅ Order berhasil diselesaikan!");
        fetchData();
      }
    } catch (error) {
      console.error("Error completing order:", error);
      showMessage("danger", "❌ Gagal menyelesaikan order");
    }
  };

  const showMessage = (type: string, text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const formatCurrency = (value: number) => {
    if (value === undefined || value === null || isNaN(value)) {
      return "Rp 0";
    }
    return `Rp ${Number(value).toLocaleString('id-ID')}`;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      paddingTop: "80px",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    }}>
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4" style={{
          background: "rgba(255, 255, 255, 0.95)",
          padding: "1.5rem",
          borderRadius: "15px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)"
        }}>
          <div>
            <h1 className="mb-0" style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: "2rem",
              fontWeight: "800"
            }}>🍽 Admin Dashboard</h1>
            <p className="text-muted mb-0 small">Kelola menu dan pesanan restoran</p>
          </div>
          <div className="d-flex gap-2">
            <button 
              className="btn btn-light border-0"
              style={{
                borderRadius: "10px",
                padding: "0.6rem 1.2rem",
                fontWeight: "600",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
                transition: "all 0.3s"
              }}
              onClick={() => router.push("/order")}
            >
              👁 Lihat Halaman Order
            </button>
            <button 
              className="btn"
              style={{
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                color: "white",
                border: "none",
                borderRadius: "10px",
                padding: "0.6rem 1.2rem",
                fontWeight: "600",
                boxShadow: "0 4px 15px rgba(245, 87, 108, 0.3)",
                transition: "all 0.3s"
              }}
              onClick={() => router.push("/")}
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Alert Message */}
        {message.text && (
          <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
            {message.text}
            <button type="button" className="btn-close" onClick={() => setMessage({ type: "", text: "" })}></button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="row mb-4 g-3">
          <div className="col-md-3">
            <div className="card border-0" style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "15px",
              boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)",
              color: "white"
            }}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div style={{ fontSize: "2.5rem" }}>📋</div>
                  <div style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    padding: "0.3rem 0.8rem",
                    borderRadius: "20px",
                    fontSize: "0.8rem"
                  }}>Menu</div>
                </div>
                <h2 className="fw-bold mb-1" style={{ fontSize: "2.5rem" }}>{menus.length}</h2>
                <p className="mb-0 opacity-75">Total Menu</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0" style={{
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              borderRadius: "15px",
              boxShadow: "0 8px 32px rgba(240, 147, 251, 0.3)",
              color: "white"
            }}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div style={{ fontSize: "2.5rem" }}>🛒</div>
                  <div style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    padding: "0.3rem 0.8rem",
                    borderRadius: "20px",
                    fontSize: "0.8rem"
                  }}>Orders</div>
                </div>
                <h2 className="fw-bold mb-1" style={{ fontSize: "2.5rem" }}>{orders.length}</h2>
                <p className="mb-0 opacity-75">Total Pesanan</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0" style={{
              background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
              borderRadius: "15px",
              boxShadow: "0 8px 32px rgba(252, 182, 159, 0.3)",
              color: "#333"
            }}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div style={{ fontSize: "2.5rem" }}>⏳</div>
                  <div style={{
                    background: "rgba(0, 0, 0, 0.1)",
                    padding: "0.3rem 0.8rem",
                    borderRadius: "20px",
                    fontSize: "0.8rem"
                  }}>Pending</div>
                </div>
                <h2 className="fw-bold mb-1" style={{ fontSize: "2.5rem" }}>
                  {orders.filter(o => o.status === "pending").length}
                </h2>
                <p className="mb-0 opacity-75">Pesanan Pending</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0" style={{
              background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
              borderRadius: "15px",
              boxShadow: "0 8px 32px rgba(168, 237, 234, 0.3)",
              color: "#333"
            }}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div style={{ fontSize: "2.5rem" }}>💰</div>
                  <div style={{
                    background: "rgba(0, 0, 0, 0.1)",
                    padding: "0.3rem 0.8rem",
                    borderRadius: "20px",
                    fontSize: "0.8rem"
                  }}>Profit</div>
                </div>
                <h2 className="fw-bold mb-1" style={{ fontSize: "1.5rem" }}>
                  {formatCurrency(
                    orders
                      .filter(o => o.status === "completed")
                      .reduce((sum, order) => {
                        const orderProfit = order.items.reduce((itemSum, item) => {
                          const menuItem = menus.find(m => m._id === item.menuId || m.nama === item.name);
                          const cost = menuItem?.biaya || 0;
                          const profit = (item.price - cost) * item.qty;
                          return itemSum + profit;
                        }, 0);
                        return sum + orderProfit;
                      }, 0)
                  )}
                </h2>
                <p className="mb-0 opacity-75">Total Profit</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "15px",
          padding: "1rem",
          marginBottom: "1.5rem",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)"
        }}>
          <ul className="nav nav-tabs border-0">
            <li className="nav-item">
              <button
                className={`nav-link border-0 ${activeTab === "menu" ? "" : ""}`}
                style={{
                  background: activeTab === "menu" 
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
                    : "transparent",
                  color: activeTab === "menu" ? "white" : "#666",
                  borderRadius: "10px",
                  padding: "0.8rem 2rem",
                  fontWeight: "600",
                  transition: "all 0.3s",
                  marginRight: "0.5rem"
                }}
                onClick={() => setActiveTab("menu")}
              >
                📋 Menu Management
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link border-0 ${activeTab === "orders" ? "" : ""}`}
                style={{
                  background: activeTab === "orders" 
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
                    : "transparent",
                  color: activeTab === "orders" ? "white" : "#666",
                  borderRadius: "10px",
                  padding: "0.8rem 2rem",
                  fontWeight: "600",
                  transition: "all 0.3s"
                }}
                onClick={() => setActiveTab("orders")}
              >
                🛒 Order Management
              </button>
            </li>
          </ul>
        </div>

        {/* Menu Tab */}
        {activeTab === "menu" && (
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "15px",
            padding: "2rem",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)"
          }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h3 className="mb-1 fw-bold">Daftar Menu</h3>
                <p className="text-muted small mb-0">Kelola semua menu restoran</p>
              </div>
              <button
                className="btn border-0"
                style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  borderRadius: "10px",
                  padding: "0.8rem 1.5rem",
                  fontWeight: "600",
                  boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
                  transition: "all 0.3s"
                }}
                onClick={() => {
                  setEditingMenu({
                    nama: "",
                    kategori: "Makanan Utama",
                    harga: 0,
                    biaya: 0,
                    stok: 100,
                    deskripsi: "",
                    gambar: "",
                    ratingStars: "★★★★☆",
                    history: "",
                    ingredients: "",
                    tips: "",
                  });
                  setShowModal(true);
                }}
              >
                ➕ Tambah Menu
              </button>
            </div>

            <div className="table-responsive" style={{ borderRadius: "10px", overflow: "hidden" }}>
              <table className="table table-hover mb-0">
                <thead style={{ 
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white"
                }}>
                  <tr>
                    <th style={{ border: "none", padding: "1rem" }}>Gambar</th>
                    <th style={{ border: "none", padding: "1rem" }}>Nama</th>
                    <th style={{ border: "none", padding: "1rem" }}>Kategori</th>
                    <th style={{ border: "none", padding: "1rem" }}>Harga Jual</th>
                    <th style={{ border: "none", padding: "1rem" }}>Biaya</th>
                    <th style={{ border: "none", padding: "1rem" }}>Stok</th>
                    <th style={{ border: "none", padding: "1rem" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody style={{ background: "white" }}>
                  {menus.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-5 text-muted">
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🍽️</div>
                        <p className="mb-0">Belum ada menu. Silakan tambah menu baru.</p>
                      </td>
                    </tr>
                  ) : (
                    menus.map((menu) => (
                      <tr key={menu._id} style={{ 
                        transition: "all 0.3s",
                        cursor: "pointer"
                      }}>
                        <td style={{ padding: "1rem", verticalAlign: "middle" }}>
                          {menu.gambar && (
                            <img
                              src={menu.gambar}
                              alt={menu.nama}
                              style={{
                                width: "70px",
                                height: "70px",
                                objectFit: "cover",
                                borderRadius: "12px",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
                              }}
                              onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/70?text=No+Image';
                              }}
                            />
                          )}
                        </td>
                        <td className="fw-bold" style={{ padding: "1rem", verticalAlign: "middle" }}>{menu.nama}</td>
                        <td style={{ padding: "1rem", verticalAlign: "middle" }}>
                          <span style={{
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            color: "white",
                            padding: "0.3rem 0.8rem",
                            borderRadius: "20px",
                            fontSize: "0.85rem",
                            fontWeight: "600"
                          }}>{menu.kategori}</span>
                        </td>
                        <td className="fw-bold" style={{ 
                          padding: "1rem", 
                          verticalAlign: "middle",
                          color: "#667eea"
                        }}>
                          {formatCurrency(menu.harga)}
                        </td>
                        <td className="text-muted" style={{ padding: "1rem", verticalAlign: "middle" }}>
                          {formatCurrency(menu.biaya)}
                        </td>
                        <td style={{ padding: "1rem", verticalAlign: "middle" }}>
                          <span style={{
                            background: menu.stok > 50 ? "#d4edda" : "#fff3cd",
                            color: menu.stok > 50 ? "#155724" : "#856404",
                            padding: "0.3rem 0.8rem",
                            borderRadius: "20px",
                            fontSize: "0.85rem",
                            fontWeight: "600"
                          }}>{menu.stok || 0}</span>
                        </td>
                        <td style={{ padding: "1rem", verticalAlign: "middle" }}>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn border-0"
                              style={{
                                background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
                                color: "#333",
                                borderRadius: "8px 0 0 8px",
                                fontWeight: "600",
                                padding: "0.5rem 1rem"
                              }}
                              onClick={() => {
                                setEditingMenu(menu);
                                setShowModal(true);
                              }}
                            >
                              ✏ Edit
                            </button>
                            <button
                              className="btn border-0"
                              style={{
                                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                                color: "white",
                                borderRadius: "0 8px 8px 0",
                                fontWeight: "600",
                                padding: "0.5rem 1rem"
                              }}
                              onClick={() => menu._id && handleDeleteMenu(menu._id)}
                            >
                              🗑
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "15px",
            padding: "2rem",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)"
          }}>
            <div className="mb-4">
              <h3 className="mb-1 fw-bold">Daftar Pesanan</h3>
              <p className="text-muted small mb-0">Kelola dan lacak semua pesanan</p>
            </div>
            <div className="table-responsive" style={{ borderRadius: "10px", overflow: "hidden" }}>
              <table className="table table-hover mb-0">
                <thead style={{ 
                  background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  color: "white"
                }}>
                  <tr>
                    <th style={{ border: "none", padding: "1rem" }}>ID Order</th>
                    <th style={{ border: "none", padding: "1rem" }}>Items</th>
                    <th style={{ border: "none", padding: "1rem" }}>Total</th>
                    <th style={{ border: "none", padding: "1rem" }}>Status</th>
                    <th style={{ border: "none", padding: "1rem" }}>Tanggal</th>
                    <th style={{ border: "none", padding: "1rem" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody style={{ background: "white" }}>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-5 text-muted">
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📦</div>
                        <p className="mb-0">Belum ada pesanan.</p>
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order._id} style={{ transition: "all 0.3s" }}>
                        <td className="small text-muted" style={{ padding: "1rem", verticalAlign: "middle" }}>
                          <code style={{
                            background: "#f8f9fa",
                            padding: "0.3rem 0.6rem",
                            borderRadius: "6px",
                            fontSize: "0.8rem"
                          }}>{order._id.substring(0, 8)}...</code>
                        </td>
                        <td style={{ padding: "1rem", verticalAlign: "middle" }}>
                          {order.items.map((item, idx) => (
                            <div key={idx} className="small mb-1">
                              <span className="fw-bold">{item.name}</span> 
                              <span style={{
                                background: "#e9ecef",
                                padding: "0.1rem 0.5rem",
                                borderRadius: "10px",
                                marginLeft: "0.5rem",
                                fontSize: "0.8rem"
                              }}>x{item.qty}</span>
                            </div>
                          ))}
                        </td>
                        <td className="fw-bold" style={{ 
                          padding: "1rem", 
                          verticalAlign: "middle",
                          color: "#f5576c"
                        }}>
                          {formatCurrency(order.total)}
                        </td>
                        <td style={{ padding: "1rem", verticalAlign: "middle" }}>
                          <span style={{
                            background: order.status === "completed" 
                              ? "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" 
                              : "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
                            color: "#333",
                            padding: "0.4rem 1rem",
                            borderRadius: "20px",
                            fontSize: "0.85rem",
                            fontWeight: "600",
                            textTransform: "capitalize"
                          }}>
                            {order.status === "completed" ? "✅ Selesai" : "⏳ Pending"}
                          </span>
                        </td>
                        <td className="small" style={{ padding: "1rem", verticalAlign: "middle" }}>
                          {new Date(order.createdAt).toLocaleString('id-ID')}
                        </td>
                        <td style={{ padding: "1rem", verticalAlign: "middle" }}>
                          {order.status === "pending" && (
                            <button
                              className="btn border-0"
                              style={{
                                background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
                                color: "#333",
                                borderRadius: "8px",
                                fontWeight: "600",
                                padding: "0.5rem 1rem"
                              }}
                              onClick={() => handleCompleteOrder(order._id)}
                            >
                              ✅ Complete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Add/Edit Menu */}
        {showModal && editingMenu && (
          <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
              <div className="modal-content" style={{
                borderRadius: "20px",
                border: "none",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)"
              }}>
                <div className="modal-header" style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  borderRadius: "20px 20px 0 0",
                  padding: "1.5rem"
                }}>
                  <h5 className="modal-title fw-bold">
                    {editingMenu._id ? "✏ Edit Menu" : "➕ Tambah Menu Baru"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => {
                      setShowModal(false);
                      setEditingMenu(null);
                    }}
                  ></button>
                </div>

                <div className="modal-body" style={{ padding: "2rem" }}>
                  <div className="row g-4">
                    <div className="col-md-6">
                      <label className="form-label fw-bold text-dark">Nama Menu *</label>
                      <input
                        type="text"
                        className="form-control"
                        style={{
                          borderRadius: "10px",
                          border: "2px solid #e9ecef",
                          padding: "0.8rem",
                          transition: "all 0.3s"
                        }}
                        value={editingMenu.nama}
                        onChange={(e) => setEditingMenu({ ...editingMenu, nama: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold text-dark">Kategori *</label>
                      <select
                        className="form-select"
                        style={{
                          borderRadius: "10px",
                          border: "2px solid #e9ecef",
                          padding: "0.8rem",
                          transition: "all 0.3s"
                        }}
                        value={editingMenu.kategori}
                        onChange={(e) => setEditingMenu({ ...editingMenu, kategori: e.target.value })}
                      >
                        <option value="Makanan Utama">Makanan Utama</option>
                        <option value="Camilan">Camilan</option>
                        <option value="Minuman">Minuman</option>
                        <option value="Penutup">Penutup</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold text-dark">Harga Jual (Rp) *</label>
                      <input
                        type="number"
                        className="form-control"
                        style={{
                          borderRadius: "10px",
                          border: "2px solid #e9ecef",
                          padding: "0.8rem",
                          transition: "all 0.3s"
                        }}
                        value={editingMenu.harga}
                        onChange={(e) => setEditingMenu({ ...editingMenu, harga: Number(e.target.value) || 0 })}
                        min="0"
                        step="1000"
                      />
                      <small style={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontWeight: "600"
                      }}>Preview: {formatCurrency(editingMenu.harga)}</small>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold text-dark">Biaya Produksi (Rp)</label>
                      <input
                        type="number"
                        className="form-control"
                        style={{
                          borderRadius: "10px",
                          border: "2px solid #e9ecef",
                          padding: "0.8rem",
                          transition: "all 0.3s"
                        }}
                        value={editingMenu.biaya}
                        onChange={(e) => setEditingMenu({ ...editingMenu, biaya: Number(e.target.value) || 0 })}
                        min="0"
                        step="1000"
                      />
                      <small className="text-success fw-bold">
                        💰 Profit/item: {formatCurrency(editingMenu.harga - editingMenu.biaya)}
                      </small>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold text-dark">Stok</label>
                      <input
                        type="number"
                        className="form-control"
                        style={{
                          borderRadius: "10px",
                          border: "2px solid #e9ecef",
                          padding: "0.8rem",
                          transition: "all 0.3s"
                        }}
                        value={editingMenu.stok}
                        onChange={(e) => setEditingMenu({ ...editingMenu, stok: Number(e.target.value) || 0 })}
                        min="0"
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-bold text-dark">URL Gambar *</label>
                      <input
                        type="text"
                        className="form-control"
                        style={{
                          borderRadius: "10px",
                          border: "2px solid #e9ecef",
                          padding: "0.8rem",
                          transition: "all 0.3s"
                        }}
                        placeholder="/images/menu/namafile.jpg"
                        value={editingMenu.gambar}
                        onChange={(e) => setEditingMenu({ ...editingMenu, gambar: e.target.value })}
                      />
                    </div>

                    {editingMenu.gambar && (
                      <div className="col-12 text-center">
                        <div style={{
                          background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
                          borderRadius: "15px",
                          padding: "1.5rem",
                          display: "inline-block"
                        }}>
                          <img
                            src={editingMenu.gambar}
                            alt="Preview"
                            style={{ 
                              maxWidth: "250px", 
                              maxHeight: "250px", 
                              objectFit: "cover", 
                              borderRadius: "12px",
                              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)"
                            }}
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/250?text=Invalid+Image';
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="col-12">
                      <label className="form-label fw-bold text-dark">Deskripsi *</label>
                      <textarea
                        className="form-control"
                        style={{
                          borderRadius: "10px",
                          border: "2px solid #e9ecef",
                          padding: "0.8rem",
                          transition: "all 0.3s"
                        }}
                        rows={3}
                        value={editingMenu.deskripsi}
                        onChange={(e) => setEditingMenu({ ...editingMenu, deskripsi: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-bold text-dark">Bahan-Bahan</label>
                      <textarea
                        className="form-control"
                        style={{
                          borderRadius: "10px",
                          border: "2px solid #e9ecef",
                          padding: "0.8rem",
                          transition: "all 0.3s"
                        }}
                        rows={2}
                        value={editingMenu.ingredients}
                        onChange={(e) => setEditingMenu({ ...editingMenu, ingredients: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-bold text-dark">Sejarah & Budaya</label>
                      <textarea
                        className="form-control"
                        style={{
                          borderRadius: "10px",
                          border: "2px solid #e9ecef",
                          padding: "0.8rem",
                          transition: "all 0.3s"
                        }}
                        rows={3}
                        value={editingMenu.history}
                        onChange={(e) => setEditingMenu({ ...editingMenu, history: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-bold text-dark">Tips Chef</label>
                      <textarea
                        className="form-control"
                        style={{
                          borderRadius: "10px",
                          border: "2px solid #e9ecef",
                          padding: "0.8rem",
                          transition: "all 0.3s"
                        }}
                        rows={2}
                        value={editingMenu.tips}
                        onChange={(e) => setEditingMenu({ ...editingMenu, tips: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer" style={{
                  borderTop: "2px solid #e9ecef",
                  padding: "1.5rem"
                }}>
                  <button
                    type="button"
                    className="btn"
                    style={{
                      background: "#e9ecef",
                      color: "#666",
                      border: "none",
                      borderRadius: "10px",
                      padding: "0.8rem 1.5rem",
                      fontWeight: "600"
                    }}
                    onClick={() => {
                      setShowModal(false);
                      setEditingMenu(null);
                    }}
                  >
                    Batal
                  </button>
                  <button 
                    type="button" 
                    className="btn"
                    style={{
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      padding: "0.8rem 1.5rem",
                      fontWeight: "600",
                      boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)"
                    }}
                    onClick={handleSaveMenu}
                  >
                    💾 Simpan
                  </button>
                </div>
              </div>
            </div>
          </div>  
        )}
      </div>
    </div>
  );
}
