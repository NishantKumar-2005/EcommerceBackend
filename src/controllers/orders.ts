
import { Request } from "express";
import { NewOrderRequestBody } from "../types/types.js";
import ErrorHandling, { TryCatch } from "../utils/utility.class.js";
import { Order } from "../models/order.js";
import { reduce } from "../utils/features.js";

export const newOrder = TryCatch(async (req: Request<{},{},NewOrderRequestBody>, res,next) => {

    const {shippingInfo,user,subtotal,shippingCharges,tax,total,discount,orderItems}=req.body;


    if(!shippingInfo || !user || !subtotal || !tax || !total || !orderItems){
        return next(new ErrorHandling("Please provide all the required fields",400));
    }

    
    await Order.create({
        shippingInfo,
        user,
        subtotal,
        shippingCharges,
        tax,
        total,
        discount,
        orderItems
    });
    

    await reduce(orderItems);

    return res.status(201).json({
        success:true,
        message:"Order created successfully"
    })



});