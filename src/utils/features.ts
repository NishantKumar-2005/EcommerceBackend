import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect("mongodb+srv://nishant114999:52UGspyZF7cyIg5N@cluster0.tnbnipx.mongodb.net/", {
            dbName:"ecommerce24",
        });
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error`);
        process.exit(1);
    }
};