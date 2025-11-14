import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();
app.use(cors());
app.use(express.json());

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
          // ... data background Anda ...
        ]);
      }

      const menuCount = await Menu.countDocuments();
      if (menuCount === 0) {
        console.log("Seeding menus...");
        await Menu.insertMany([
          // ... data menu Anda ...
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
  app.listen(PORT, () =>
    console.log(`Server berjalan di http://localhost:${PORT}`)
  );
}

start();