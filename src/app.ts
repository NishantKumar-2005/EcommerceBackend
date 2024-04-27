import express from 'express';
// Import the UserRoutes from the routes/user.js file
import UserRoutes from './routes/user.js';
import ProductRoutes from './routes/products.js';
import OrderRoutes from './routes/orders.js';
import PaymentRoutes from './routes/payment.js';
import DashboardRoutes from "./routes/stats.js";
import { connectDB } from './utils/features.js';
import { errorMiddelware } from './middlewares/error.js';
import { config } from 'dotenv';
import NodeCache from 'node-cache';
import morgan from 'morgan';
import Stripe from 'stripe';



const app = express();

config({
  path:"./.env",
});
const port = process.env.PORT || 8000;
const URI = process.env.MONGO_URI || "mongodb+srv://nishant114999:52UGspyZF7cyIg5N@cluster0.tnbnipx.mongodb.net/";
const stripeKey = process.env.STRIPE_KEY || "";

app.use(express.json());
app.use(morgan('dev'));

export const stripe = new Stripe(stripeKey);
export const myCache = new NodeCache();

connectDB(URI);

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.use('/api/v1/user', UserRoutes);
app.use('/api/v1/product', ProductRoutes);
app.use('/api/v1/order', OrderRoutes);
app.use('/api/v1/payment', PaymentRoutes);
app.use('/api/v1/dashboard', DashboardRoutes);

app.use("/uploads",express.static("uploads"));
app.use(errorMiddelware);


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});