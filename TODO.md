# Admin Dashboard Development Plan

## Backend Updates
- [x] Update menu schema: Add stock field
- [x] Create order schema: Include items, total, profit, status
- [ ] Add authentication middleware for admin routes (basic auth for simplicity)
- [x] Add CRUD routes for orders: GET /api/orders, POST /api/orders (mark completed, reduce stock, calculate profit)
- [x] Update menu routes to include stock management

## Frontend Updates
- [x] Create admin dashboard page: /admin
- [x] Implement menu CRUD with stock in admin dashboard
- [x] Add order management: View orders, mark as completed
- [ ] Display real-time orders and profits (using polling)
- [x] Update order page to send orders to backend instead of localStorage
- [ ] Add admin login/logout functionality

## Testing
- [ ] Test backend API endpoints
- [ ] Test frontend integration
- [ ] Verify stock reduction and profit calculation
