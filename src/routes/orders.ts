import express from "express";
import { newOrder } from "../controllers/orders.js";


const app=express.Router();

// to crate a new order
app.post("/new",newOrder);


export default app;