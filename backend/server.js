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

  // Menus - PUT
  app.put("/api/menus/:id", async (req, res) => {
    try {
      const menu = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!menu) return res.status(404).json({ error: "Menu not found" });
      res.json(menu);
    } catch (err) {
      res.status(500).json({ error: "Failed to update menu" });
    }
  });

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
            name: "Tinutuan",
            category: "Sarapan",
            price: 45000,
            cost: 25000,
            stock: 50,
            description:
              "Bubur daging khas Manado yang gurih dengan kuah yang kaya. Dibuat dari beras yang dimasak lama hingga lembut bersama daging sapi.",
            imgSrc:
              "https://images.unsplash.com/photo-1585521537145-0f1be63a47ba?w=400&h=300&fit=crop",
            ratingStars: "★★★★★",
            ingredients: "Beras, daging sapi, santan, telur, bumbu tradisional",
            history:
              "Tinutuan adalah hidangan sarapan tradisional dari Manado yang telah menjadi bagian dari identitas kuliner kota ini sejak berabad-abad lalu.",
            tips: "Sajikan dengan sambal tomat dan telur rebus untuk hasil maksimal.",
          },
          {
            name: "Cakalang Fufu",
            category: "Utama",
            price: 85000,
            cost: 50000,
            stock: 30,
            description:
              "Ikan cakalang asap yang empuk dengan tekstur lunak di dalam dan crispy di luar. Bumbu khas Manado membuat rasanya tak tertahankan.",
            imgSrc:
              "https://images.unsplash.com/photo-1555939594-58d7cb561ada?w=400&h=300&fit=crop",
            ratingStars: "★★★★☆",
            ingredients: "Ikan cakalang, bumbu rempah, garam, kunyit, jahe",
            history:
              "Cakalang fufu adalah pengembangan modern dari cakalang asap tradisional Manado yang dipopulerkan di era 1980-an.",
            tips: "Nikmati hangat-hangat dengan nasi putih atau sambal.",
          },
          {
            name: "Woku Manado",
            category: "Utama",
            price: 65000,
            cost: 35000,
            stock: 40,
            description:
              "Tumisan khas Manado dengan bumbu rempah yang kaya dan aroma yang menggugah selera. Dapat menggunakan berbagai jenis daging atau ikan.",
            imgSrc:
              "https://images.unsplash.com/photo-1626082927389-6cd097cdc46e?w=400&h=300&fit=crop",
            ratingStars: "★★★★★",
            ingredients:
              "Daging/Ikan, bawang merah, bawang putih, cabe rawit, kunyit, jahe, kelapa",
            history:
              "Woku adalah teknik memasak asli Manado yang sudah ada sejak zaman pra-kolonial. Nama 'woku' berasal dari alat tradisional penggerus bumbu.",
            tips: "Gunakan wajan besar dan api tinggi untuk hasil yang sempurna.",
          },
          {
            name: "Ikan Bakar Manado",
            category: "Utama",
            price: 75000,
            cost: 40000,
            stock: 25,
            description:
              "Ikan segar yang dipanggang dengan bumbu rempah khas Manado. Dagingnya juicy dan warna gosongnya sempurna.",
            imgSrc:
              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
            ratingStars: "★★★★☆",
            ingredients: "Ikan snapper, bumbu rempah, minyak kelapa, jeruk limau",
            history:
              "Ikan bakar telah menjadi makanan pokok masyarakat Manado karena lokasi geografisnya yang dekat dengan laut.",
            tips: "Pilih ikan yang masih segar untuk hasil terbaik.",
          },
          {
            name: "Tinutuan Manado Special",
            category: "Sarapan",
            price: 95000,
            cost: 55000,
            stock: 20,
            description:
              "Versi premium tinutuan dengan tambahan seafood pilihan seperti udang dan kepiting.",
            imgSrc:
              "https://images.unsplash.com/photo-1612528443702-f6741f271a04?w=400&h=300&fit=crop",
            ratingStars: "★★★★★",
            ingredients: "Beras, udang, kepiting, santan, telur, bumbu pilihan",
            history:
              "Inovasi dari tinutuan tradisional yang dikembangkan untuk memenuhi selera pelanggan modern.",
            tips: "Pastikan seafood dalam kondisi segar untuk rasa yang optimal.",
          },
          {
            name: "Ayam Rica-Rica",
            category: "Utama",
            price: 55000,
            cost: 30000,
            stock: 35,
            description:
              "Ayam pedas khas Manado dengan bumbu rica-rica yang menggugah selera. Kombinasi pedas dan gurih yang sempurna.",
            imgSrc:
              "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop",
            ratingStars: "★★★★☆",
            ingredients: "Ayam, cabe rawit, bawang merah, bawang putih, jahe, kunyit",
            history:
              "Rica-rica adalah bumbu khas dari Sulawesi Utara yang telah menjadi ciri khas masakan Manado sejak lama.",
            tips: "Gunakan ayam kampung untuk hasil yang lebih gurih.",
          },
          {
            name: "Sayur Tinombo",
            category: "Lauk",
            price: 35000,
            cost: 15000,
            stock: 60,
            description:
              "Sayuran segar dengan kuah santan yang gurih, khas Manado. Cocok sebagai pendamping hidangan utama.",
            imgSrc:
              "https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&h=300&fit=crop",
            ratingStars: "★★★☆☆",
            ingredients: "Kangkung, labu siam, santan, bumbu rempah",
            history:
              "Sayur tinombo adalah hidangan sayur tradisional Manado yang sering disajikan dalam acara keluarga.",
            tips: "Gunakan santan kelapa asli untuk rasa yang lebih autentik.",
          },
          {
            name: "Pisang Goreng Manado",
            category: "Camilan",
            price: 25000,
            cost: 10000,
            stock: 80,
            description:
              "Pisang goreng dengan tekstur renyah di luar dan lembut di dalam. Disajikan dengan taburan gula dan coklat.",
            imgSrc:
              "https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?w=400&h=300&fit=crop",
            ratingStars: "★★★★☆",
            ingredients: "Pisang raja, tepung terigu, gula, coklat",
            history:
              "Pisang goreng telah menjadi camilan favorit di Manado sejak zaman kolonial Belanda.",
            tips: "Gunakan pisang yang sudah matang sempurna untuk hasil terbaik.",
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
