import mongoose from "mongoose";
import { invalidateCacheType } from "../types/types.js";
import { orderItems } from "../types/types.js";
import { Product } from "../models/products.js";
import { myCache } from "../app.js";

export const connectDB = async (URI: string) => {
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

export const invalidateCache = ({ products, order, admin, user, orderId, productId }: invalidateCacheType) => {
    if (products) {

        if (products) {
            const productKeys: string[] = ["latest-products", "categories", "all-products", `product-${productId}`];
            if (typeof productId === "string") productKeys.push(`product-${productId}`);
            if (typeof productId === "object") productId.forEach((id) => productKeys.push(`product-${id}`));
            myCache.del(productKeys)
        }


        if (order) {
            const orderKeys: string[] = ["all-orders", `my-orders-${user}`, `order-${orderId}`];
            myCache.del(orderKeys);
        }

        if(admin){
            myCache.del([
                "admin-stats",
                "admin-pie-charts",
                "admin-bar-charts",
                "admin-line-charts"
            ])
        }

    }
}

export const reduce = async (orderItems: orderItems[]) => {
    for (let i = 0; i < orderItems.length; i++) {
        const order = orderItems[i];
        const product = await Product.findById(order.productId);
        if (!product) throw new Error("Product not found");
        product.stock = product.stock - order.quantity;
        await product.save();
    }
};


export const calculatePercentange = (thisMonth: number, lastMonth: number) => {
    if (lastMonth === 0) {
        return thisMonth * 100;
    }
    const percent = (thisMonth / lastMonth) * 100;
    return Number(percent.toFixed(0));
}

export const getCategories = async (categories: string[], productsCount: number) => {
    const categoryCountPromise = categories.map((category) => Product.countDocuments({ category }));

    const categoriesCount = await Promise.all(categoryCountPromise);

    const categoryCount: Record<string, number>[] = [];

    categories.forEach((category, i) => {
        categoryCount.push({
            [category]: Math.round(categoriesCount[i] / productsCount * 100)
        })
    })

    return categoryCount;

}

interface MyDocument {
    createdAt: Date;
    discount?: number;
    total?: number;
}

type FuncType = {
    length: number,
    docArr: MyDocument[],
    total?:number,
    property?:"discount" | "total";
}

export const getChartData = ({ length, docArr, property }: FuncType) => {
    const today = new Date();

    const data: number[] = new Array(length).fill(0);

    docArr.forEach((i) => {
        const creationDate = i.createdAt;
        const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;

        if (monthDiff < length) {
            data[length - monthDiff - 1] += property ? i[property]! : 1;
        }
    });


    return data;
}