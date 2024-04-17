import { singleUpload } from '../middlewares/multer.js';
import { deleteProduct, getAdminProducts, getAllCategories, getAllProducts, getLatestProducts, getSingleProduct, newProduct, updateProduct } from '../controllers/products.js';
import { adminAuth } from '../middlewares/auth.js';
import express from "express";

const app = express.Router();


app.post("/new", adminAuth, singleUpload, newProduct);
app.get("/latest", getLatestProducts);
app.get("/categories", getAllCategories);
app.get("/admin-products",adminAuth, getAdminProducts);

app.get("/all",getAllProducts)

app.route("/:id").get(getSingleProduct).put(adminAuth,singleUpload,updateProduct).delete(adminAuth,deleteProduct);

export default app;