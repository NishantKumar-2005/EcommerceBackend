import mongoose from "mongoose";
import { invalidateCacheType } from "../types/types.js";
import { orderItems } from "../types/types.js";
import { Product } from "../models/products.js";
import { myCache } from "../app.js";

export const connectDB = async (URI : string) => {
    try {
        
        const uri = URI;
        const conn = await mongoose.connect(uri, {
            dbName: "ecommerce24",
        });
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error`);
        process.exit(1);
    }
};

export const invalidateCache = async({products}:invalidateCacheType)=>{
    if(products){

        const productKeys :string[] = ["latest-products","categories","all-products"];

        const productIDs = await Product.find({}).select("_id");
        
        productIDs.forEach(element => {
            productKeys.push(`product-${element._id}`);
        });

        myCache.del(productKeys)

    }
}

export const reduce = async(orderItems : orderItems[]) =>{
    for (let i = 0; i < orderItems.length; i++) {
        const order = orderItems[i];
        const product = await Product.findById(order.productId);
        if (!product) throw new Error("Product not found");
        product.stock = product.stock - order.quantity;
        await product.save();
    }
};