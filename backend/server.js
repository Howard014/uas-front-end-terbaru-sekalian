// Meimo API Server 


const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;


// Middleware

app.use(cors());
app.use(express.json());
app.set('json spaces', 2);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// MongoDB Connection

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error(" Error: MONGO_URI is not defined in .env file");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log(" Connected to MongoDB Atlas successfully"))
  .catch((err) => {
    console.error(" MongoDB connection error:", err.message);
    console.error(" Tips: Periksa IP whitelist dan credential user di Atlas.");
    process.exit(1);
  });

// Schemas & Models

//  Menus (struktur data di MongoDB Atlas)
const menuSchema = new mongoose.Schema({
  nama: { type: String, required: true },
  kategori: { type: String, required: true },
  deskripsi: { type: String },
  gambar: { type: String },
});

const Menu = mongoose.model("menus", menuSchema); //  pakai koleksi "menus"

//  Comments
const commentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  text: { type: String, required: true },
  date: { type: String, required: true },
  rating: Number,
  menuId: mongoose.Schema.Types.ObjectId,
});

const Comment = mongoose.model("comments", commentSchema);

// 
// File Upload Setup
// 
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// 
// Routes
// 
// Root route
app.get("/", (req, res) => {
  res.send(" Meimo API is running!");
});

//  MENUS ROUTES 
app.get("/api/menus", async (req, res) => {
  try {
    const menus = await Menu.find();
    res.json(menus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/menus", async (req, res) => {
  try {
    const newMenu = new Menu(req.body);
    const saved = await newMenu.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put("/api/menus/:id", async (req, res) => {
  try {
    const updated = await Menu.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Menu not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete("/api/menus/:id", async (req, res) => {
  try {
    const deleted = await Menu.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Menu not found" });
    res.json({ message: "Menu deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//  COMMENTS ROUTES 
app.get("/api/comments", async (req, res) => {
  try {
    const comments = await Comment.find().sort({ date: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/comments", async (req, res) => {
  try {
    const saved = await new Comment(req.body).save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//  UPLOAD ROUTE 
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  res.json({
    message: " Upload success",
    filePath: "/uploads/" + req.file.filename,
  });
});


// Start Server

app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
