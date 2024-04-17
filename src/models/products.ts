import mongoose from "mongoose";

const schema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Name is required"],
    },
    photo:{
        type: String,
        required: [true, "Please Add photo"],
    },
    price:{
        type: Number,
        required: [true, "Please enter price"],
    },
    stock:{
        type: Number,
        required: [true, "Please enter quantity"],
    },
    category:{
        type: String,
        required: [true, "Please enter category"],
        trim:true,
    },
    
    }
,{
    timestamps: true
});

export const Product = mongoose.model("Product", schema);