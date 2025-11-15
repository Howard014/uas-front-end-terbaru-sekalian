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
          {
            nama: "Manado Background 1",
            url: "/images/background/manado1.jpg",
          },
          {
            nama: "Manado Background 2",
            url: "/images/background/manado2.jpg",
          },
                    {
            nama: "Manado Background 3",
            url: "/images/background/manado2.jpg",
          },

        ]);
      }

      const menuCount = await Menu.countDocuments();
      if (menuCount === 0) {
        console.log("Seeding menus...");
        await Menu.insertMany([
          {
            name: "Tinutuan",
            category: "Sarapan",
            price: 45000,
            cost: 20000,
            stock: 10,
            description: "Bubur daging khas Manado yang gurih dengan kuah yang kaya. Dibuat dari beras yang dimasak lama hingga lembut bersama daging sapi.",
            imgSrc: "https://res.cloudinary.com/dgoxc9dmz/image/upload/v1763041886/babikecap_fn3l80.jpg",
            ratingStars: "★★★★☆",
            history: "Tinutuan adalah hidangan sarapan tradisional dari Manado yang telah menjadi bagian dari identitas kuliner kota ini sejak berabad-abad lalu.",
            ingredients: "Beras, daging sapi, santan, telur, bumbu tradisional",
            tips: "Sajikan dengan sambal tomat dan telur rebus untuk hasil maksimal.",
          },
          {
            name: "Cakalang Fufu",
            category: "Utama",
            price: 85000,
            cost: 40000,
            stock: 30,
            description: "Daging babi asap yang empuk dengan tekstur lunak di dalam dan crispy di luar. Bumbu khas Manado membuat rasanya tak tertahankan.",
            imgSrc: "https://images.unsplash.com/photo-1555939594-58d7cb561ada?w=400&h=300&fit=crop",
            ratingStars: "★★★★★",
            history: "Cakalang fufu adalah pengembangan modern dari cakalang asap tradisional Manado yang dipopulerkan di era 1980-an.",
            ingredients: "Daging babi, bumbu rempah, garam, kunyit, jahe",
            tips: "Nikmati hangat-hangat dengan nasi putih atau sambal.",
          },
          {
            name: "Woku Manado",
            category: "Utama",
            price: 65000,
            cost: 30000,
            stock: 40,
            description: "Tumisan khas Manado dengan bumbu rempah yang kaya dan aroma yang menggugah selera. Dapat menggunakan berbagai jenis daging atau ikan.",
            imgSrc: "https://images.unsplash.com/photo-1626082927389-6cd097cdc46e?w=400&h=300&fit=crop",
            ratingStars: "★★★★☆",
            history: "Woku adalah teknik memasak asli Manado yang sudah ada sejak zaman pra-kolonial. Nama 'woku' berasal dari alat tradisional penggerus bumbu.",
            ingredients: "Daging/Ikan, bawang merah, bawang putih, cabe rawit, kunyit, jahe, kelapa",
            tips: "Gunakan wajan besar dan api tinggi untuk hasil yang sempurna.",
          },
          {
            name: "Ikan Bakar Manado",
            category: "Utama",
            price: 75000,
            cost: 35000,
            stock: 35,
            description: "Ikan segar yang dipanggang dengan bumbu rempah khas Manado. Dagingnya juicy dan warna gosongnya sempurna.",
            imgSrc: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
            ratingStars: "★★★★☆",
            history: "Ikan bakar telah menjadi makanan pokok masyarakat Manado karena lokasi geografisnya yang dekat dengan laut.",
            ingredients: "Ikan snapper, bumbu rempah, minyak kelapa, jeruk limau",
            tips: "Pilih ikan yang masih segar untuk hasil terbaik.",
          },
          {
            name: "Tinutuan Manado Special",
            category: "Sarapan",
            price: 95000,
            cost: 50000,
            stock: 20,
            description: "Versi premium tinutuan dengan tambahan seafood pilihan seperti udang dan kepiting.",
            imgSrc: "https://images.unsplash.com/photo-1612528443702-f6741f271a04?w=400&h=300&fit=crop",
            ratingStars: "★★★★★",
            history: "Inovasi dari tinutuan tradisional yang dikembangkan untuk memenuhi selera pelanggan modern.",
            ingredients: "Beras, udang, kepiting, santan, telur, bumbu pilihan",
            tips: "Pastikan seafood dalam kondisi segar untuk rasa yang optimal.",
          },
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