import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();
// Enable permissive CORS for development so Next dev server can fetch APIs
// (Change to restricted origins in production)
app.use(cors());
app.options("*", cors());
app.use(express.json());

// Simple request logger for debugging
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.url);
  next();
});

// Use MONGO_URI from .env, fallback to local
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/meimoDB";
const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("Mongo Error:", err);
    // Exit so developer notices; remove process.exit if you want the server
    // to continue running without a DB connection.
    process.exit(1);
  }

  // --- Schemas ---
  const BackgroundSchema = new mongoose.Schema({
    nama: String,
    url: String,
  });
  const Background = mongoose.model("Background", BackgroundSchema);

  const MenuSchema = new mongoose.Schema({
    name: String,
    category: String,
    price: Number,
    cost: Number,
    stock: Number,
    description: String,
    imgSrc: String,
    ratingStars: String,
    history: String,
    ingredients: String,
    tips: String,
  });
  const Menu = mongoose.model("Menu", MenuSchema);

  // ✅ OrderSchema DIPERBARUI (ditambah cost & profit)
  const OrderSchema = new mongoose.Schema({
    items: [
      {
        name: String,
        price: Number,
        cost: Number, // Ditambahkan agar cocok dengan frontend
        qty: Number,
      },
    ],
    total: Number,
    profit: Number, // Ditambahkan agar cocok dengan frontend
    status: { type: String, default: "pending" },
    createdAt: { type: Date, default: Date.now },
  });
  const Order = mongoose.model("Order", OrderSchema);


  // --- API ROUTES ---

  // Backgrounds - GET
  app.get("/api/backgrounds", async (req, res) => {
    try {
      const data = await Background.find();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch backgrounds" });
    }
  });

  // Backgrounds - POST
  app.post("/api/backgrounds", async (req, res) => {
    try {
      const bg = new Background(req.body);
      await bg.save();
      res.status(201).json(bg);
    } catch (err) {
      res.status(500).json({ error: "Failed to create background" });
    }
  });

  // Menus - GET
  app.get("/api/menus", async (req, res) => {
    try {
      const data = await Menu.find();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch menus" });
    }
  });

  // Menus - POST
  app.post("/api/menus", async (req, res) => {
    try {
      const menu = new Menu(req.body);
      await menu.save();
      res.status(201).json(menu);
    } catch (err) {
      res.status(500).json({ error: "Failed to create menu" });
    }
  });

  // ✅ HASIL MERGE (dari branch 'main')
  // Menus - PUT
  app.put("/api/menus/:id", async (req, res) => {
    try {
      const menu = await Menu.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!menu) return res.status(404).json({ error: "Menu not found" });
      res.json(menu);
    } catch (err) {
      res.status(500).json({ error: "Failed to update menu" });
    }
  });

  // ✅ HASIL MERGE (dari branch 'main')
  // Menus - DELETE
  app.delete("/api/menus/:id", async (req, res) => {
    try {
      const menu = await Menu.findByIdAndDelete(req.params.id);
      if (!menu) return res.status(404).json({ error: "Menu not found" });
      res.json({ message: "Menu deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete menu" });
    }
  });

  // ✅ HASIL MERGE (dari branch 'aldo')
  // Orders - POST (Create an order)
  app.post("/api/orders", async (req, res) => {
    try {
      console.log("Incoming order:", req.body);
      const order = new Order(req.body);
      await order.save();
      res.status(201).json(order);
    } catch (err) {
      console.error("Failed to save order:", err);
      res.status(500).json({ error: "Failed to save order" });
    }
  });

  // ✅ HASIL MERGE (dari branch 'aldo')
  // Orders - GET (Get all orders)
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await Order.find().sort({ createdAt: -1 });
      res.json(orders);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // ✅ TAMBAHAN (dibutuhkan oleh frontend)
  // Orders - PUT (Complete Order)
  app.put("/api/orders/:id", async (req, res) => {
    try {
      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        { new: true }
      );
      if (!order) return res.status(404).json({ error: "Order not found" });
      res.json(order);
    } catch (err) {
      res.status(500).json({ error: "Failed to update order" });
    }
  });


  // --- Seed data if database is empty ---
  async function seedData() {
    try {
      const bgCount = await Background.countDocuments();
      if (bgCount === 0) {
        console.log("Seeding backgrounds...");
        await Background.insertMany([
          { nama: "Manado Background 1", url: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=1200&h=600&fit=crop" },
          { nama: "Manado Background 2", url: "https://images.unsplash.com/photo-1504674900374-0f6a84f6e8ee?w=1200&h=600&fit=crop" },
          { nama: "Manado Background 3", url: "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=1200&h=600&fit=crop" },
        ]);
      }

      const menuCount = await Menu.countDocuments();
      if (menuCount === 0) {
        console.log("Seeding menus...");
        await Menu.insertMany([
          { name: "Babi Kecap", description: "Irisan daging babi dimasak dengan kecap khas Manado, gurih dan manis.", price: 45000, imgSrc: "/images/menu/babikecap.jpg", category: "Makanan Utama", ingredients: "Beras, daging sapi, santan, telur, bumbu tradisional" },
          { name: "Babi Panggang", description: "Daging babi panggang dengan bumbu rempah khas dan kulit renyah.", price: 50000, imgSrc: "/images/menu/babipanggang.jpg", category: "Makanan Utama" },
          { name: "Tinoransak", description: "Daging babi dimasak dalam bambu dengan bumbu pedas khas.", price: 55000, imgSrc: "/images/menu/tinorangsak.jpg", category: "Makanan Utama" },
          { name: "Cakalang Suwir", description: "Ikan cakalang asap suwir dimasak rica-rica pedas.", price: 35000, imgSrc: "/images/menu/cakalangsuir.jpg", category: "Makanan Utama" },
        ]);
      }
    } catch (err) {
      console.error("Error seeding data:", err);
    }
  }

  // Seed data on startup
  await seedData();

  // Testing
  app.get("/", (req, res) => {
    res.send("Backend Meimo Running...");
  });

  // RUN SERVER
  // Bind to all interfaces so localhost/127.0.0.1/::1 all work consistently
  const server = app.listen(PORT, "0.0.0.0", () => {
    try {
      const addr = server.address();
      console.log(`Server berjalan di http://localhost:${PORT}`);
      console.log("Bind address:", addr);
    } catch (e) {
      console.log(`Server berjalan di http://localhost:${PORT}`);
    }
  });
}

start();