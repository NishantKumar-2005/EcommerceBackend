import { myCache } from "../app.js";
import { User } from "../models/User.js";
import { Order } from "../models/order.js";
import { Product } from "../models/products.js";
import { calculatePercentange, getCategories, getChartData } from "../utils/features.js";
import { TryCatch } from "../utils/utility.class.js";

export const getDashboardstats = TryCatch(async (req, res, next) => {
    let stats;
    const key = "admin-stats";
    if (myCache.has(key)) {
        stats = JSON.parse(myCache.get(key) as string);
    } else {
        const today = new Date();
        const sixthMonthAgo = new Date();
        sixthMonthAgo.setMonth(sixthMonthAgo.getMonth() - 6);

        const thisMonth = {
            start: new Date(today.getFullYear(), today.getMonth(), 1),
            end: today
        }
        const lastMonth = {
            start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
            end: new Date(today.getFullYear(), today.getMonth(), 0)
        }


        const thisMonthProductsPromise = Product.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        })

        const lastMonthProductsPromise = Product.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        })

        const thisMonthUsersPromise = User.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        })

        const lastMonthUsersPromise = User.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        })

        const thisMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        })

        const lastMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        })

        const lastSixMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: sixthMonthAgo,
                $lte: today
            }
        })


        const latestTransectionPromise = Order.find({}).select(["orderItems", "discount", "total", "status"]).limit(4);


        const [
            thisMonthUsers,
            thisMonthProducts,
            thisMonthOrders,
            lastMonthUsers,
            lastMonthProducts,
            lastMonthOrders,
            productsCount,
            usersCount,
            allOrders,
            lastSixMonthOrders,
            categories,
            femalesCount,
            latestTransection
        ] = await Promise.all([
            thisMonthUsersPromise,
            thisMonthProductsPromise,
            thisMonthOrdersPromise,
            lastMonthUsersPromise,
            lastMonthProductsPromise,
            lastMonthOrdersPromise,
            Product.countDocuments(),
            User.countDocuments(),
            Order.find({}).select("total"),
            lastSixMonthOrdersPromise,
            Product.distinct("category"),
            User.countDocuments({ gender: "female" }),
            latestTransectionPromise
        ])

        const thisMonthRevenue = thisMonthOrders.reduce((total, order) => total + (order.total || 0), 0);
        const lastMonthRevenue = lastMonthOrders.reduce((total, order) => total + (order.total || 0), 0);

        const revenue = allOrders.reduce((total, order) => total + (order.total || 0), 0);

        const ordersMonthCount = new Array(6).fill(0);
        const ordersMonthlyRevenue = new Array(6).fill(0);

        lastSixMonthOrders.forEach((order) => {
            const creationDate = order.createdAt;
            const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;

            if (monthDiff < 6) {
                ordersMonthCount[6 - monthDiff - 1] += 1;
                ordersMonthlyRevenue[6 - monthDiff - 1] += order.total;
            }
        });

        const counts = {
            users: usersCount,
            products: productsCount,
            orders: allOrders.length
        }

        const changePercent = {
            users: calculatePercentange(thisMonthUsers.length, lastMonthUsers.length),
            products: calculatePercentange(thisMonthProducts.length, lastMonthProducts.length),
            orders: calculatePercentange(thisMonthOrders.length, lastMonthOrders.length),
            revenue: calculatePercentange(thisMonthRevenue, lastMonthRevenue)
        }



        const userRatio = {
            male: usersCount - femalesCount,
            females: femalesCount
        }

        const modifiedTransection = latestTransection.map((i) => (
            {
                _id: i._id,
                discount: i.discount,
                amount: i.total,
                quantity: i.orderItems.length,
                status: i.status
            }
        ))

        const categoryCount = await getCategories(categories, productsCount);

        stats = {
            categoryCount,
            changePercent,
            counts,
            chart: {
                order: ordersMonthCount,
                revenue: ordersMonthlyRevenue
            },
            userRatio,
            latestTransection: modifiedTransection
        };

        myCache.set(key, JSON.stringify(stats));

    }
    return res.status(200).json({
        success: true,
        stats
    })
});

export const getPieChart = TryCatch(async (req, res, next) => {
    let charts;
    const key = "admin-pie-charts";
    if (myCache.has(key)) {
        charts = JSON.parse(myCache.get(key) as string);
    }
    else {
        const [processingPromise, shippedPromise, deliveredPromise, categories, productsCount, outOfStock, allOrders, allUsers, adminUsers, customerUsers] = await Promise.all([
            Order.countDocuments({ status: "Processing" }),
            Order.countDocuments({ status: "Shipped" }),
            Order.countDocuments({ status: "Delivered" }),
            Product.distinct("category"),
            Product.countDocuments(),
            Product.countDocuments({ stock: 0 }),
            Order.find({}).select(["total", "discount", "subtotal", "tax", "shippingCharges"]),
            User.find({}).select(["dob"]),
            User.find({}).countDocuments({ role: "admin" }),
            User.find({}).countDocuments({ role: "user" }),
        ]);

        const orderFulfilment = {
            processing: processingPromise,
            shipped: shippedPromise,
            delivered: deliveredPromise
        };

        const productCategories = await getCategories(categories, productsCount);

        const stockAvailability = {
            instock: productsCount - outOfStock,
            outOfStock
        }

        const grossIncome = allOrders.reduce((prev, order) => prev + (order.total || 0), 0);
        const discount = allOrders.reduce((prev, order) => prev + (order.discount || 0), 0);
        const productionCost = allOrders.reduce((prev, order) => prev + (order.shippingCharges || 0), 0);
        const burnt = allOrders.reduce((prev, order) => prev + (order.tax || 0), 0);

        const marketingCost = Math.round(grossIncome * (30 / 100));
        const netMargin = grossIncome - discount - productionCost - burnt - marketingCost;

        const revenueDistribution = {
            netMargin,
            discount,
            productionCost,
            burnt,
            marketingCost
        }

        const usersAgeGroup = {
            teen: allUsers.filter((i) => i.age < 20).length,
            adult: allUsers.filter((i) => i.age >= 20 && i.age < 40).length,
            old: allUsers.filter((i) => i.age >= 40).length
        }

        const adminCustomer = {
            admin: adminUsers,
            customer: customerUsers
        }


        charts = {
            orderFulfilment,
            productCategories,
            stockAvailability,
            revenueDistribution,
            usersAgeGroup,
            adminCustomer
        };

        myCache.set(key, JSON.stringify(charts));
    }
    return res.status(200).json({
        success: true,
        charts
    })
});

export const getBarChart = TryCatch(async (req, res, next) => {
    let charts;
    const key = "admin-bar-charts";
    if (myCache.has(key)) {
        charts = JSON.parse(myCache.get(key) as string);
    }
    else {
        const today = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);


        const sixMonthProductPromise = Product.find({
            createdAt: {
                $gte: sixMonthsAgo,
                $lte: today,
            },
        }).select("createdAt");

        const sixMonthUsersPromise = User.find({
            createdAt: {
                $gte: sixMonthsAgo,
                $lte: today,
            },
        }).select("createdAt");

        const twelveMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: twelveMonthsAgo,
                $lte: today,
            },
        }).select("createdAt");


        const [products, users, orders] = await Promise.all([
            sixMonthProductPromise,
            sixMonthUsersPromise,
            twelveMonthOrdersPromise,
        ]);

        const productCounts = getChartData({ length: 6, docArr: products });
        const usersCounts = getChartData({ length: 6, docArr: users });
        const ordersCounts = getChartData({ length: 12, docArr: orders });


        charts = {
            users: usersCounts,
            products: productCounts,
            orders: ordersCounts,
        }

        myCache.set(key, JSON.stringify(charts));
    }
    return res.status(200).json({
        success: true,
        charts
    })
})

export const getLineChart = TryCatch(async (req, res, next) => {
    let charts;
    const key = "admin-line-charts";
    if (myCache.has(key)) {
        charts = JSON.parse(myCache.get(key) as string);
    }
    else {
        const today = new Date();

        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const baseQuery = {
            createdAt: {
                $gte: twelveMonthsAgo,
                $lte: today,
            }
        }

        const [products, users, orders] = await Promise.all([
            Product.find(baseQuery).select(["createdAt"]),
            User.find(baseQuery).select(["createdAt"]),
            Order.find(baseQuery).select(["createdAt", "total", "discount"])
        ]);

        const productCounts = getChartData({ length: 12, docArr: products });
        const usersCounts = getChartData({ length: 12, docArr: users });
        const discount = getChartData({ length: 12, docArr: orders, property: "discount" });
        const revenue = getChartData({ length: 12, docArr: orders, property: "total" });


        charts = {
            users: usersCounts,
            products: productCounts,
            discount,
            revenue
        }

        myCache.set(key, JSON.stringify(charts));
    }
    return res.status(200).json({
        success: true,
        charts
    })
})