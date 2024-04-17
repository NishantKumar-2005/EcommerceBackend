import express from 'express';

// Import the UserRoutes from the routes/user.js file
import UserRoutes from './routes/user.js';
import ProductRoutes from './routes/products.js';
import { connectDB } from './utils/features.js';
import { errorMiddelware } from './middlewares/error.js';
import { config } from 'dotenv';



const app = express();

config();
app.use(express.json());
const port = process.env.PORT || 8000;


connectDB();

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.use('/api/v1/user', UserRoutes);
app.use('/api/v1/product', ProductRoutes);

app.use("/uploads",express.static("uploads"));
app.use(errorMiddelware);


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});