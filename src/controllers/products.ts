import { SearchRequestQuery, baseQuery } from '../types/types.js';
import { NewProductRequestBody } from '../types/types.js';
import { NextFunction, Request, Response } from "express";
import ErrorHandling, { TryCatch } from "../utils/utility.class.js";
import { Product } from '../models/products.js';
import { rm } from 'fs';
import { myCache } from '../app.js';
import { invalidateCache } from '../utils/features.js';


export const getLatestProducts = TryCatch(async (req: Request<{}, {}, NewProductRequestBody>, res, next) => {
    let products = [];

    if (myCache.has("latest-products")) {
        products = JSON.parse(myCache.get("latest-products") as string);
    } else {
        products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
        myCache.set("latest-products", JSON.stringify(products));
    }

    return res.status(200).json({
        success: true,
        products,
    })
})


export const getAllCategories = TryCatch(async (req: Request<{}, {}, NewProductRequestBody>, res, next) => {
    let categories = [];
    if (myCache.has("categories")) {
        categories = JSON.parse(myCache.get("categories") as string);
    }
    else {
        categories = await Product.distinct("category");
        myCache.set("categories", JSON.stringify(categories));
    }

    return res.status(200).json({
        success: true,
        categories,
    })
})


export const getAdminProducts = TryCatch(async (req: Request<{}, {}, NewProductRequestBody>, res, next) => {
    let products = [];

    if (myCache.has("all-products")) {
        products = JSON.parse(myCache.get("all-products") as string);
    } else {
        products = await Product.find({});
        myCache.set("all-products", JSON.stringify(products));
    }

    return res.status(200).json({
        success: true,
        products,
    })
})


export const getSingleProduct = TryCatch(async (req, res, next) => {
    let product;
    const { id } = req.params;

    if (myCache.has(`product-${id}`)) {
        product = JSON.parse(myCache.get(`product-${id}`) as string);
    } else {

        product = await Product.findById(id);
        if (!product) {
            return next(new ErrorHandling("Product not found", 400));
        }
        myCache.set(`product-${id}`, JSON.stringify(product));
    }


    return res.status(200).json({
        success: true,
        product,
    })
})


export const newProduct = TryCatch(async (req: Request<{}, {}, NewProductRequestBody>, res, next) => {
    const { name, price, category, stock } = req.body;
    const photo = req.file;


    if (!photo) return next(new ErrorHandling("Please add photo", 400));

    if (!name || !price || !category || !stock) {
        rm(photo.path, () => {
            console.log("Photo deleted");
        })
        return next(new ErrorHandling("Please enter all fields", 400));
    }

    await Product.create({
        name,
        price,
        category: category.toLocaleLowerCase(),
        stock,
        photo: photo.path
    })

    await invalidateCache({products:true});

    return res.status(201).json({
        success: true,
        message: "Product created successfuly"
    })
})


export const updateProduct = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const { name, price, category, stock } = req.body;
    const photo = req.file;

    const product = await Product.findById(id);

    if (!product) {
        return next(new ErrorHandling("Product not found", 400));
    }

    if (photo) {
        rm(product.photo!, () => {
            console.log("old photo deleted");
        });
        product.photo = photo.path;
    }

    if (name) product.name = name;
    if (price) product.price = price;
    if (stock) product.stock = stock;
    if (category) product.category = category;

    await product.save();
    await invalidateCache({products:true});


    return res.status(200).json({
        success: true,
        message: "Product updated successfuly"
    })
})

export const deleteProduct = TryCatch(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new ErrorHandling("Product not found ", 400));
    rm(product.photo!, () => {
        console.log("Product photo deleted");
    });
    await Product.deleteOne({ _id: req.params.id });
    await invalidateCache({products:true});

    return res.status(200).json({
        success: true,
        message: "Product deleted successfuly"
    })
})



export const getAllProducts = TryCatch(async (req: Request<{}, {}, {}, SearchRequestQuery>, res, next) => {

    const { search, category, price, sort } = req.query;

    const page = Number(req.query.page) || 1;
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = (page - 1) * limit;

    const baseQuery: baseQuery = {

    }

    if (search) {
        baseQuery.name = {
            $regex: search,
            $options: "i"
        }
    }

    if (price) {
        baseQuery.price = {
            $lte: Number(price)
        }
    }

    if (category) baseQuery.category = category;

    const [products, filteredOnly] = await Promise.all([
        Product.find(baseQuery).sort(
            sort && { price: sort == "asc" ? 1 : -1 }
        ).limit(limit).skip(skip),

        Product.find(baseQuery)
    ])

    const totalPages = Math.ceil(filteredOnly.length / limit);

    return res.status(200).json({
        success: true,
        totalPages,
        products,
    })
})