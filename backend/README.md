# Meimo Backend

Backend API for Meimo app built with Node.js, Express, and MongoDB.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with your MongoDB URI:
   ```
   MONGO_URI=mongodb://localhost:27017/meimo
   PORT=5000
   ```

3. Start the server:
   ```bash
   npm start
   ```

   Or for development:
   ```bash
   npm run dev
   ```

## API Endpoints

### Menu
- `GET /api/menu` - Get all menus
- `POST /api/menu` - Create new menu
- `PUT /api/menu/:id` - Update menu
- `DELETE /api/menu/:id` - Delete menu

### Comments
- `GET /api/comments` - Get all comments
- `POST /api/comments` - Create new comment

### Cart
- `GET /api/cart` - Get all carts
- `POST /api/cart` - Create new cart

### Upload
- `POST /upload` - Upload image file

## Connecting to Frontend

The frontend (Next.js app in `meimo/` folder) can connect to this backend by updating the API URLs to point to `http://localhost:5000` instead of relative paths.
