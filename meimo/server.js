const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose"); // <-- Kita pakai Mongoose

const app = express();
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json()); // Agar bisa membaca JSON

// --- KONEKSI DATABASE MONGODB ---

// INI ADALAH STRING KONEKSI BARU DARI CLUSTER BARU ANDA (SUDAH DIPERBAIKI)
const MONGO_URI = "mongodb+srv://klokidwo:1234@cluster0.nzwvhdx.mongodb.net/UAS_fe?appName=Cluster0";
// 1. Nama variabel 'uri' diganti jadi 'MONGO_URI'
// 2. Password '<1234>' diganti jadi '1234'
// 3. Nama DB 'UAS_fe' ditambahkan sebelum '?'

// 3. COBA KONEKSIKAN (Menggunakan Mongoose)
mongoose.connect(MONGO_URI) // <-- Sekarang variabel ini sudah benar
  .then(() => {
    // Jika berhasil
    console.log("BERHASIL terkoneksi ke MongoDB Atlas (Database: UAS_fe)!");
  })
  .catch((err) => {
    // Jika gagal
    console.error("GAGAL terkoneksi ke MongoDB:", err);
  });
// ---------------------------------

// --- 1. MEMBUAT MODEL DATA (SCHEMA) ---
const MenuSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: true 
  },
  harga: {
    type: Number,
    required: true
  },
  deskripsi: {
    type: String
  }
});

// "Menu" adalah nama model, "fkugd" adalah nama collection di MongoDB
const Menu = mongoose.model("Menu", MenuSchema, "fkugd");
// ---------------------------------


// --- 2. API UNTUK MELIHAT SEMUA MENU (Read) ---
app.get("/api/menu", async (req, res) => {
  try {
    const allMenus = await Menu.find(); 
    res.status(200).json(allMenus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- 3. API UNTUK MENAMBAH MENU BARU (Create) ---
app.post("/api/menu", async (req, res) => {
  const { nama, harga, deskripsi } = req.body;
  const menuBaru = new Menu({
    nama: nama,
    harga: harga,
    deskripsi: deskripsi
  });

  try {
    const savedMenu = await menuBaru.save();
    res.status(201).json(savedMenu);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- 4. API UNTUK MENGUPDATE MENU (Update) ---
app.patch("/api/menu/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, harga, deskripsi } = req.body;

    const updatedMenu = await Menu.findByIdAndUpdate(
      id, 
      { nama, harga, deskripsi },
      { new: true } 
    );

    if (!updatedMenu) {
      return res.status(404).json({ message: "Menu tidak ditemukan" });
    }
    res.status(200).json(updatedMenu);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
// ---------------------------------


// --- API UPLOAD GAMBAR (Kode Anda yang lama) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  res.json({
    message: "Upload success",
    filePath: "/uploads/" + req.file.filename
  });
});
// ---------------------------------


// Ini yang menjalankan server Anda
app.listen(3000, () => {
  console.log("Server Running on port 3000");
});