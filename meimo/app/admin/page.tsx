"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";

interface MenuItem {
  _id?: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  description: string;
  imgSrc: string;
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

interface RawMenuItem {
  _id?: string;
  name?: string;
  category?: string;
  price?: string | number;
  cost?: string | number;
  stock?: string | number;
  description?: string;
  imgSrc?: string;
  ratingStars?: string;
  history?: string;
  ingredients?: string;
  tips?: string;
  nama?: string;
  kategori?: string;
  harga?: string | number;
  biaya?: string | number;
  stok?: string | number;
  deskripsi?: string;
  gambar?: string;
  rating?: string;
  sejarah?: string;
  bahan?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"menu" | "orders">("orders");
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
        fetch("http://localhost:5000/api/menus"),
        fetch("http://localhost:5000/api/orders"),
      ]);

      if (menuRes.ok) {
        const menuData = await menuRes.json();
        const parsedMenuData = menuData.map((menu: RawMenuItem, index: number) => ({
          _id: menu._id,
          name: menu.name || menu.nama,
          category: menu.category || menu.kategori,
          price: menu.price != null ? parseFloat(menu.price.toString()) : menu.harga != null ? parseFloat(menu.harga.toString()) : (25000 + index * 5000),
          cost: menu.cost != null ? parseFloat(menu.cost.toString()) : menu.biaya != null ? parseFloat(menu.biaya.toString()) : 0,
          stock: menu.stock != null ? parseInt(menu.stock.toString()) : menu.stok != null ? parseInt(menu.stok.toString()) : 100,
          description: menu.description || menu.deskripsi,
          imgSrc: menu.imgSrc || menu.gambar,
          ratingStars: menu.ratingStars || menu.rating,
          history: menu.history || menu.sejarah,
          ingredients: menu.ingredients || menu.bahan,
          tips: menu.tips,
        }));
        setMenus(parsedMenuData);
      }

      if (orderRes.ok) {
        const orderData = await orderRes.json();
        console.log("Orders fetched:", orderData);
        setOrders(orderData);
        const profit = orderData.reduce(
          (sum: number, order: Order) => sum + (isNaN(order.profit) ? 0 : order.profit),
          0
        );
        setTotalProfit(profit);
      } else {
        console.error("Failed to fetch orders:", orderRes.status);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

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

      await fetch(`http://localhost:5000/api/menus/${menuId}`, {
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

  const handleSaveMenu = async (menu: MenuItem) => {
    try {
      const method = menu._id ? "PUT" : "POST";
      const url = menu._id
        ? `http://localhost:5000/api/menus/${menu._id}`
        : "http://localhost:5000/api/menus";

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

  const handleDeleteMenu = async (id: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/menus/${id}`, {
        method: "DELETE",
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Error deleting menu:", error);
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
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
            <div className="card text-white bg-primary">
              <div className="card-body">
                <h5 className="card-title">Total Orders</h5>
                <h3>{orders.length}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-white bg-success">
              <div className="card-body">
                <h5 className="card-title">Total Profit</h5>
                <h3>Rp {totalProfit.toLocaleString('id-ID')}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-white bg-warning">
              <div className="card-body">
                <h5 className="card-title">Pending Orders</h5>
                <h3>{orders.filter(o => o.status === 'pending').length}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-white bg-info">
              <div className="card-body">
                <h5 className="card-title">Menu Items</h5>
                <h3>{menus.length}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "menu" ? "active" : ""}`}
              onClick={() => setActiveTab("menu")}
            >
              Menu Management
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "orders" ? "active" : ""}`}
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
                    category: "",
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
                    <th>Category</th>
                    <th>Description</th>
                    <th>Image</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {menus.map((menu) => (
                    <tr key={menu._id}>
                      <td>{menu.name}</td>
                      <td>{menu.category}</td>
                      <td>{menu.description}</td>
                      <td>
                        {menu.imgSrc && (
                          <img
                            src={menu.imgSrc}
                            alt={menu.name}
                            style={{
                              width: "50px",
                              height: "50px",
                              objectFit: "cover",
                              borderRadius: "4px"
                            }}
                          />
                        )}
                      </td>
                      <td>Rp {menu.price.toLocaleString()}</td>
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
            <h3>Order Management</h3>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td>{order._id}</td>
                      <td>
                        {order.items.map((item, index) => (
                          <div key={index}>
                            {item.name} (x{item.qty}) - Rp {item.price.toLocaleString('id-ID')}
                          </div>
                        ))}
                      </td>
                      <td>Rp {order.total.toLocaleString('id-ID')}</td>
                      <td>
                        <span className={`badge ${order.status === 'pending' ? 'bg-warning' : 'bg-success'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleString('id-ID')}</td>
                      <td>
                        {order.status === 'pending' && (
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
                        <label className="form-label">Category</label>
                        <select
                          className="form-control"
                          value={editingMenu.category}
                          onChange={(e) =>
                            setEditingMenu({ ...editingMenu, category: e.target.value })
                          }
                          required
                        >
                          <option value="">Select Category</option>
                          <option value="Sarapan">Sarapan</option>
                          <option value="Utama">Utama</option>
                          <option value="Lauk">Lauk</option>
                          <option value="Camilan">Camilan</option>
                        </select>
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

                      {editingMenu.imgSrc && (
                        <div className="col-12 mb-3 text-center">
                          <img
                            src={editingMenu.imgSrc}
                            alt="Preview"
                            style={{ maxWidth: "200px", maxHeight: "200px" }}
                          />
                        </div>
                      )}

                      <div className="col-12 mb-3">
                        <label className="form-label">Rating (Contoh: ★★★★☆)</label>
                        <input
                          type="text"
                          className="form-control"
                          value={editingMenu.ratingStars}
                          onChange={(e) =>
                            setEditingMenu({ ...editingMenu, ratingStars: e.target.value })
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
