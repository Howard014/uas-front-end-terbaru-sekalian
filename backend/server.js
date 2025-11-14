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

  // Schemas
  const BackgroundSchema = new mongoose.Schema({
    nama: String,
    url: String,
  });
  const Background = mongoose.model("Background", BackgroundSchema);

  const MenuSchema = new mongoose.Schema({
    nama: String,
    deskripsi: String,
    gambar: String,
    harga: Number,
    ingredients: String,
    history: String,
    tips: String,
  });
  const Menu = mongoose.model("Menu", MenuSchema);

  // API ROUTE
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

  // Seed data if database is empty
  async function seedData() {
    try {
      const bgCount = await Background.countDocuments();
      if (bgCount === 0) {
        console.log("Seeding backgrounds...");
        await Background.insertMany([
          {
            nama: "Manado Background 1",
            url: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=1200&h=600&fit=crop",
          },
          {
            nama: "Manado Background 2",
            url: "https://images.unsplash.com/photo-1504674900374-0f6a84f6e8ee?w=1200&h=600&fit=crop",
          },
          {
            nama: "Manado Background 3",
            url: "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=1200&h=600&fit=crop",
          },
        ]);
      }

      const menuCount = await Menu.countDocuments();
      if (menuCount === 0) {
        console.log("Seeding menus...");
        await Menu.insertMany([
          {
            nama: "Tinutuan",
            deskripsi:
              "Bubur daging khas Manado yang gurih dengan kuah yang kaya. Dibuat dari beras yang dimasak lama hingga lembut bersama daging sapi.",
            gambar:
              "https://images.unsplash.com/photo-1585521537145-0f1be63a47ba?w=400&h=300&fit=crop",
            harga: 45000,
            ingredients: "Beras, daging sapi, santan, telur, bumbu tradisional",
            history:
              "Tinutuan adalah hidangan sarapan tradisional dari Manado yang telah menjadi bagian dari identitas kuliner kota ini sejak berabad-abad lalu.",
            tips: "Sajikan dengan sambal tomat dan telur rebus untuk hasil maksimal.",
          },
          {
            nama: "Cakalang Fufu",
            deskripsi:
              "Daging babi asap yang empuk dengan tekstur lunak di dalam dan crispy di luar. Bumbu khas Manado membuat rasanya tak tertahankan.",
            gambar:
              "https://images.unsplash.com/photo-1555939594-58d7cb561ada?w=400&h=300&fit=crop",
            harga: 85000,
            ingredients: "Daging babi, bumbu rempah, garam, kunyit, jahe",
            history:
              "Cakalang fufu adalah pengembangan modern dari cakalang asap tradisional Manado yang dipopulerkan di era 1980-an.",
            tips: "Nikmati hangat-hangat dengan nasi putih atau sambal.",
          },
          {
            nama: "Woku Manado",
            deskripsi:
              "Tumisan khas Manado dengan bumbu rempah yang kaya dan aroma yang menggugah selera. Dapat menggunakan berbagai jenis daging atau ikan.",
            gambar:
              "https://images.unsplash.com/photo-1626082927389-6cd097cdc46e?w=400&h=300&fit=crop",
            harga: 65000,
            ingredients:
              "Daging/Ikan, bawang merah, bawang putih, cabe rawit, kunyit, jahe, kelapa",
            history:
              "Woku adalah teknik memasak asli Manado yang sudah ada sejak zaman pra-kolonial. Nama 'woku' berasal dari alat tradisional penggerus bumbu.",
            tips: "Gunakan wajan besar dan api tinggi untuk hasil yang sempurna.",
          },
          {
            nama: "Ikan Bakar Manado",
            deskripsi:
              "Ikan segar yang dipanggang dengan bumbu rempah khas Manado. Dagingnya juicy dan warna gosongnya sempurna.",
            gambar:
              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
            harga: 75000,
            ingredients: "Ikan snapper, bumbu rempah, minyak kelapa, jeruk limau",
            history:
              "Ikan bakar telah menjadi makanan pokok masyarakat Manado karena lokasi geografisnya yang dekat dengan laut.",
            tips: "Pilih ikan yang masih segar untuk hasil terbaik.",
          },
          {
            nama: "Tinutuan Manado Special",
            deskripsi:
              "Versi premium tinutuan dengan tambahan seafood pilihan seperti udang dan kepiting.",
            gambar:
              "https://images.unsplash.com/photo-1612528443702-f6741f271a04?w=400&h=300&fit=crop",
            harga: 95000,
            ingredients: "Beras, udang, kepiting, santan, telur, bumbu pilihan",
            history:
              "Inovasi dari tinutuan tradisional yang dikembangkan untuk memenuhi selera pelanggan modern.",
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
