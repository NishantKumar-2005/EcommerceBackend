import express from "express";
import { allOrder, deleteOrder, getSingleOrder, myOrders, newOrder, processOrder } from "../controllers/orders.js";
import { adminAuth } from "../middlewares/auth.js";


const app=express.Router();

// to crate a new order
app.post("/new",newOrder);

// to get all orders of a user
app.get("/my", myOrders);

// to get all orders
app.get("/all", adminAuth,allOrder);

app.route("/:id").get(getSingleOrder).put(adminAuth,processOrder).delete(adminAuth,deleteOrder);



export default app;