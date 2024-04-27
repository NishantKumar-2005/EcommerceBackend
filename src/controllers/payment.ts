import { stripe } from "../app.js";
import { Coupon } from "../models/coupon.js";
import ErrorHandling, { TryCatch } from "../utils/utility.class.js";


export const createPaymentIntent = TryCatch(async (req, res, next) => {
    const { amount } = req.body;
    if (!amount) {
        return next(new ErrorHandling("Please Enter the amount", 400));
    }

    const paymentIntent = await stripe.paymentIntents.create({
        amount: Number(amount) * 100,
        currency: "inr"
    })

    res.status(201).json({
        success: true,
        clientSecret : paymentIntent.client_secret
    });
})

export const newCoupon = TryCatch(async (req, res, next) => {
    const { coupon, amount } = req.body;
    if (!coupon || !amount) {
        return res.status(400).json({ message: "All fields are required" });
    }
    const duplicate = await Coupon.findOne({ coupon });

    if (duplicate) {
        return res.status(400).json({ message: "Coupon already exists" });
    }
    Coupon.create({ coupon, amount });

    res.status(201).json({
        success: true,
        message: `Coupon ${coupon} created successfully`
    });
});

export const applyDiscount = TryCatch(async (req, res, next) => {
    const { coupon } = req.query;
    const discount = await Coupon.findOne({ Coupon: coupon });
    if (!discount) {
        return res.status(400).json({ message: "Invalid coupon" });
    }
    res.status(200).json({
        success: true,
        discount: discount.amount
    });
});

export const allCoupons = TryCatch(async (req, res, next) => {
    const coupons = await Coupon.find({});
    if (!coupons) return next(new ErrorHandling("No coupons found", 404));
    res.status(200).json({
        success: true,
        coupons
    });
});

export const deleteCoupon = TryCatch(async (req, res, next) => {

    const { _id } = req.params;
    const coupon = await Coupon.findByIdAndDelete({ _id });
    if (!coupon) return next(new ErrorHandling("Coupon not found", 404));
    res.status(200).json({
        success: true,
        message: `Coupon ${coupon} deleted successfully`
    });
});