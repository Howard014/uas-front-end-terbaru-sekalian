const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/meimo';
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schemas
const menuSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
  imgSrc: String,
  ratingStars: String,
  history: String,
  ingredients: String,
  tips: String
});

const commentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  text: { type: String, required: true },
  date: { type: String, required: true },
  rating: Number,
  menuId: mongoose.Schema.Types.ObjectId
});

const cartSchema = new mongoose.Schema({
  items: [{
    name: String,
    price: Number,
    qty: Number
  }],
  total: Number,
  createdAt: { type: Date, default: Date.now }
});

// Models
const Menu = mongoose.model('Menu', menuSchema);
const Comment = mongoose.model('Comment', commentSchema);
const Cart = mongoose.model('Cart', cartSchema);

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// API Routes

// Menu routes
app.get('/api/menu', async (req, res) => {
  try {
    const menus = await Menu.find();
    res.json(menus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/menu', async (req, res) => {
  const menu = new Menu(req.body);
  try {
    const savedMenu = await menu.save();
    res.status(201).json(savedMenu);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/menu/:id', async (req, res) => {
  try {
    const updatedMenu = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedMenu) return res.status(404).json({ message: 'Menu not found' });
    res.json(updatedMenu);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/menu/:id', async (req, res) => {
  try {
    const deletedMenu = await Menu.findByIdAndDelete(req.params.id);
    if (!deletedMenu) return res.status(404).json({ message: 'Menu not found' });
    res.json({ message: 'Menu deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Comment routes
app.get('/api/comments', async (req, res) => {
  try {
    const comments = await Comment.find().sort({ date: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/comments', async (req, res) => {
  const comment = new Comment(req.body);
  try {
    const savedComment = await comment.save();
    res.status(201).json(savedComment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Cart routes
app.post('/api/cart', async (req, res) => {
  const cart = new Cart(req.body);
  try {
    const savedCart = await cart.save();
    res.status(201).json(savedCart);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/api/cart', async (req, res) => {
  try {
    const carts = await Cart.find().sort({ createdAt: -1 });
    res.json(carts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upload route
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({
    message: 'Upload success',
    filePath: '/uploads/' + req.file.filename
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
