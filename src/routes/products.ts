import { singleUpload } from '../middlewares/multer.js';
import { deleteProduct, getAdminProducts, getAllCategories, getAllProducts, getLatestProducts, getSingleProduct, newProduct, updateProduct } from '../controllers/products.js';
import { adminOnly } from '../middlewares/auth.js';
import express from "express";

const app = express.Router();


app.post("/new", adminOnly, singleUpload, newProduct);
app.get("/latest", getLatestProducts);
app.get("/categories", getAllCategories);
app.get("/admin-products",adminOnly, getAdminProducts);

app.get("/all",getAllProducts)

app.route("/:id").get(getSingleProduct).put(adminOnly,singleUpload,updateProduct).delete(adminOnly,deleteProduct);

export default app;