
import { Request } from "express";
import { NewOrderRequestBody } from "../types/types.js";
import ErrorHandling, { TryCatch } from "../utils/utility.class.js";
import { Order } from "../models/order.js";
import { invalidateCache, reduce } from "../utils/features.js";
import { myCache } from "../app.js";



export const myOrders = TryCatch(async (req: Request, res,next) => {
    const {id : user}= req.query;
    const key =`my-orders-${user}`;

    let orders= [];

    if(myCache.has(key)){
        orders = JSON.parse(myCache.get(key) as string);
    }
    else {
        orders = await Order.find({ user: user as string });
        myCache.set(key,JSON.stringify(orders));
    }

    return res.status(200).json({
        success:true,
        orders
    })
});

export const allOrder = TryCatch(async (req: Request, res,next) => {
    const key = "all-orders";

    let orders = [];

    if(myCache.has(key)){
        orders = JSON.parse(myCache.get(key) as string);
    }
    else {
        orders = await Order.find().populate("user","name");
        myCache.set(key,JSON.stringify(orders));
    }

    return res.status(200).json({
        success:true,
        orders
    })
});

export const getSingleOrder = TryCatch(async (req: Request, res,next) => {
    const {id}= req.params;
    const key =`order-${id}`;

    let order;

    if(myCache.has(key)){
        order = JSON.parse(myCache.get(key) as string);
    }
    else {
        order = await Order.findById(id).populate("user","name email");
        if(!order){ return next(new ErrorHandling("Order not found",404));}
        myCache.set(key,JSON.stringify(order));
    }

    return res.status(200).json({
        success:true,
        order
    })
});


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
    
    await invalidateCache({products:true, order:true,admin : true , user : user, productId : orderItems.map((item)=>String(item.productId))});

    await reduce(orderItems);

    return res.status(201).json({
        success:true,
        message:"Order created successfully"
    })



});

export const processOrder = TryCatch(async (req, res,next) => {

    const {id} = req.query;

    const order = await Order.findById(id);
    if(!order){ return next(new ErrorHandling("Order not found",404));}

    switch (order.status) {
        case "Processing":
            order.status = "Shipped";
            break;


        case "Shipped":
            order.status = "Delivered";
            break;


        default:
            order.status = "Delivered"
            break;
    }

    await order.save();

    await invalidateCache({products:false, order:true,admin : true , user : order.user, orderId : String(order._id)});

    
    return res.status(200).json({
        success:true,
        message:"Order Process successfully"
    })



});

export const deleteOrder = TryCatch(async (req, res,next) => {

    const {id} = req.query;

    const order = await Order.findById(id);
    if(!order){ return next(new ErrorHandling("Order not found",404));}

    await order.deleteOne();

    await order.save();

    await invalidateCache({products:false, order:true,admin : true , user : order.user, orderId : String(order._id)});

    
    return res.status(200).json({
        success:true,
        message:"Order deleted successfully"
    })



});