"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";

interface MenuItem {
  _id?: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  description: string;
  imgSrc: string; // Ini adalah link (URL) ke gambar
  ratingStars: string;
  history: string;
  ingredients: string;
  tips: string;
}

interface Order {
  _id: string;
  items: {
    name: string;
    price: number;
    cost: number;
    qty: number;
  }[];
  total: number;
  profit: number;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"menu" | "orders">("menu");
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalProfit, setTotalProfit] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [menuRes, orderRes] = await Promise.all([
        fetch("http://localhost:5000/api/menu"),
        fetch("http://localhost:5000/api/orders"),
      ]);

      if (menuRes.ok) {
        const menuData = await menuRes.json();
        setMenus(menuData);
      }

      if (orderRes.ok) {
        const orderData = await orderRes.json();
        setOrders(orderData);
        const profit = orderData.reduce(
          (sum: number, order: Order) => sum + order.profit,
          0
        );
        setTotalProfit(profit);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ fungsi buat order baru + kurangi stock + update profit otomatis
  const handleCreateOrder = async (menuId: string, qty: number) => {
    try {
      const menu = menus.find((m) => m._id === menuId);
      if (!menu) return alert("Menu tidak ditemukan");

      if (qty > menu.stock) {
        return alert("Stock tidak mencukupi!");
      }

      const total = menu.price * qty;
      const profit = (menu.price - menu.cost) * qty;

      const orderData = {
        items: [
          {
            name: menu.name,
            price: menu.price,
            cost: menu.cost,
            qty: qty,
          },
        ],
        total,
        profit,
        status: "pending",
      };

      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) throw new Error("Gagal membuat order");

      // Kurangi stock
      await fetch(http://localhost:5000/api/menu/${menuId}, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...menu, stock: menu.stock - qty }),
      });

      fetchData();
      alert("Order berhasil dibuat!");
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  // Save / Update menu
  const handleSaveMenu = async (menu: MenuItem) => {
    try {
      const method = menu._id ? "PUT" : "POST";
      const url = menu._id
        ? http://localhost:5000/api/menu/${menu._id}
        : "http://localhost:5000/api/menu";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(menu),
      });

      if (res.ok) {
        fetchData();
        setShowModal(false);
        setEditingMenu(null);
      }
    } catch (error) {
      console.error("Error saving menu:", error);
    }
  };

  // Delete menu
  const handleDeleteMenu = async (id: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;

    try {
      const res = await fetch(http://localhost:5000/api/menu/${id}, {
        method: "DELETE",
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Error deleting menu:", error);
    }
  };

  // Complete Order
  const handleCompleteOrder = async (orderId: string) => {
    try {
      const res = await fetch(http://localhost:5000/api/orders/${orderId}, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });

      if (res.ok) fetchData();
    } catch (error) {
      console.error("Error completing order:", error);
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light" style={{ minHeight: "100vh", paddingTop: "80px" }}>
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="text-primary fw-bold">Admin Dashboard</h1>
          <button className="btn btn-outline-danger" onClick={() => router.push("/")}>
            Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card bg-primary text-white">
              <div className="card-body">
                <h5>Total Menus</h5>
                <h2>{menus.length}</h2>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card bg-success text-white">
              <div className="card-body">
                <h5>Total Orders</h5>
                <h2>{orders.length}</h2>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card bg-warning text-white">
              <div className="card-body">
                <h5>Total Customers</h5>
                <h2>{orders.length}</h2>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card bg-info text-white">
              <div className="card-body">
                <h5>Total Profit</h5>
                <h2>Rp {totalProfit.toLocaleString()}</h2>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={nav-link ${activeTab === "menu" ? "active" : ""}}
              onClick={() => setActiveTab("menu")}
            >
              Menu Management
            </button>
          </li>

          <li className="nav-item">
            <button
              className={nav-link ${activeTab === "orders" ? "active" : ""}}
              onClick={() => setActiveTab("orders")}
            >
              Order Management
            </button>
          </li>
        </ul>

        {/* Menu Tab */}
        {activeTab === "menu" && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3>Menu Items</h3>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setEditingMenu({
                    name: "",
                    price: 0,
                    cost: 0,
                    stock: 0,
                    description: "",
                    imgSrc: "",
                    ratingStars: "",
                    history: "",
                    ingredients: "",
                    tips: "",
                  });
                  setShowModal(true);
                }}
              >
                Add Menu
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Cost</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {menus.map((menu) => (
                    <tr key={menu._id}>
                      <td>{menu.name}</td>
                      <td>Rp {menu.price.toLocaleString()}</td>
                      <td>Rp {menu.cost.toLocaleString()}</td>
                      <td>{menu.stock}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => {
                            setEditingMenu(menu);
                            setShowModal(true);
                          }}
                        >
                          Edit
                        </button>

                        {/* ✅ tombol buat order dari admin */}
                        <button
                          className="btn btn-sm btn-outline-success me-2"
                          onClick={() => handleCreateOrder(menu._id!, 1)}
                        >
                          Order +1
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => menu._id && handleDeleteMenu(menu._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div>
            <h3>Orders</h3>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Profit</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td>{order._id.slice(-6)}</td>
                      <td>
                        {order.items.map((item, idx) => (
                          <div key={idx}>
                            {item.name} x{item.qty}
                          </div>
                        ))}
                      </td>
                      <td>Rp {order.total.toLocaleString()}</td>
                      <td>Rp {order.profit.toLocaleString()}</td>
                      <td>
                        <span
                          className={`badge ${
                            order.status === "completed"
                              ? "bg-success"
                              : "bg-warning"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>
                        {order.status === "pending" && (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleCompleteOrder(order._id)}
                          >
                            Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Add/Edit Menu */}
        {showModal && editingMenu && (
          <div
            className="modal show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingMenu._id ? "Edit Menu" : "Add Menu"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowModal(false);
                      setEditingMenu(null);
                    }}
                  ></button>
                </div>

                <div className="modal-body">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveMenu(editingMenu);
                    }}
                  >
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={editingMenu.name}
                          onChange={(e) =>
                            setEditingMenu({ ...editingMenu, name: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label">Price</label>
                        <input
                          type="number"
                          className="form-control"
                          value={editingMenu.price}
                          onChange={(e) =>
                            setEditingMenu({
                              ...editingMenu,
                              price: parseInt(e.target.value) || 0,
                            })
                          }
                          required
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label">Cost</label>
                        <input
                          type="number"
                          className="form-control"
                          value={editingMenu.cost}
                          onChange={(e) =>
                            setEditingMenu({
                              ...editingMenu,
                              cost: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label">Stock</label>
                        <input
                          type="number"
                          className="form-control"
                          value={editingMenu.stock}
                          onChange={(e) =>
                            setEditingMenu({
                              ...editingMenu,
                              stock: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>

                      <div className="col-12 mb-3">
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-control"
                          value={editingMenu.description}
                          onChange={(e) =>
                            setEditingMenu({
                              ...editingMenu,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>

                      {/* Ini adalah field untuk link foto */}
                      <div className="col-12 mb-3">
                        <label className="form-label">Image URL</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="/images/menu/namagambar.jpg  atau  https://..."
                          value={editingMenu.imgSrc}
                          onChange={(e) =>
                            setEditingMenu({ ...editingMenu, imgSrc: e.target.value })
                          }
                        />
                      </div>

                      {/* (Opsional) Menampilkan preview gambar jika URL diisi */}
                      {editingMenu.imgSrc && (
                        <div className="col-12 mb-3 text-center">
                          <label className="form-label">Image Preview</label>
                          <br />
                          <img
                            src={editingMenu.imgSrc}
                            alt="Preview"
                            style={{
                              width: "100%",
                              maxWidth: "200px",
                              height: "auto",
                              objectFit: "cover",
                              border: "1px solid #ddd",
                              borderRadius: "8px"
                            }}
                          />
                        </div>
                      )}


                      {/* Data lain yang ada di interface tapi tidak di form, bisa ditambahkan di sini */}
                      {/* Misalnya: ratingStars, history, ingredients, tips */}
                      
                      <div className="col-12 mb-3">
                        <label className="form-label">Rating (Contoh: ★★★★☆)</label>
                        <input
                          type="text"
                          className="form-control"
                          value={editingMenu.ratingStars}
                          onChange={(e) =>
                            setEditingMenu({ ... editingMenu, ratingStars: e.target.value })
                          }
                        />
                      </div>
                      
                      <div className="col-12 mb-3">
                        <label className="form-label">History</label>
                        <textarea
                          className="form-control"
                          value={editingMenu.history}
                          onChange={(e) =>
                            setEditingMenu({ ...editingMenu, history: e.target.value })
                          }
                        />
                      </div>

                       <div className="col-12 mb-3">
                        <label className="form-label">Ingredients</label>
                        <textarea
                          className="form-control"
                          value={editingMenu.ingredients}
                          onChange={(e) =>
                            setEditingMenu({ ...editingMenu, ingredients: e.target.value })
                          }
                        />
                      </div>

                       <div className="col-12 mb-3">
                        <label className="form-label">Tips</label>
                        <textarea
                          className="form-control"
                          value={editingMenu.tips}
                          onChange={(e) =>
                            setEditingMenu({ ...editingMenu, tips: e.target.value })
                          }
                        />
                      </div>

                    </div>

                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowModal(false);
                          setEditingMenu(null);
                        }}
                      >
                        Cancel
                      </button>

                      <button type="submit" className="btn btn-primary">
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}