import express from "express";
import { adminAuth } from "../middlewares/auth.js";
import { allCoupons, applyDiscount, createPaymentIntent, deleteCoupon, newCoupon } from "../controllers/payment.js";

const app=express.Router();


app.get("/create",createPaymentIntent)

app.get("/discount",applyDiscount);

app.post("/coupon/new",adminAuth,newCoupon);


app.get("/coupons/all",adminAuth, allCoupons);

app.delete("/coupon/:_id",adminAuth,deleteCoupon);

export default app;