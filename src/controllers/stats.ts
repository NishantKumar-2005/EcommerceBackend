import { myCache } from "../app.js";
import { User } from "../models/User.js";
import { Order } from "../models/order.js";
import { Product } from "../models/products.js";
import { calculatePercentange } from "../utils/features.js";
import { TryCatch } from "../utils/utility.class.js";

export const getDashboardstats = TryCatch(async (req, res, next) => {
    let stats;
    if (myCache.get("admin-stats")) {
        stats = JSON.parse(myCache.get("admin-stats") as string);
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
            const monthDiff = today.getMonth() - creationDate.getMonth();

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

        const categoryCountPromise = categories.map((category) => Product.countDocuments({ category }));

        const categoriesCount = await Promise.all(categoryCountPromise);

        const categoryCount: Record<string, number>[] = [];

        categories.forEach((category, i) => {
            categoryCount.push({
                [category]: Math.round(categoriesCount[i] / productsCount * 100)
            })
        })

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

        myCache.set("admin-stats",JSON.stringify(stats));

    }
    return res.status(200).json({
        success: true,
        stats
    })
})

export const getPieChart = TryCatch(async () => { })
export const getBarChart = TryCatch(async () => { })
export const getLineChart = TryCatch(async () => { })