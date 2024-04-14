import express from 'express';

// Import the UserRoutes from the routes/user.js file
import UserRoutes from './routes/user.js';
import { connectDB } from './utils/features.js';



const app = express();
const port = 8000;

app.use(express.json());

connectDB();

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.use('/api/v1/user', UserRoutes);


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});