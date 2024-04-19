import mongoose from "mongoose";

const schema = new mongoose.Schema({
   shippingInfo:{
    address :{
        type: String,
        required: [true, "Please enter address"],
    },
    city :{
        type: String,
        required: [true, "Please enter address"],
    },
    state :{
        type: String,
        required: [true, "Please enter address"],
    },
    pincode :{
        type: Number,
        required: [true, "Please enter address"],
    },
   },
    user:{
        type: String,
        ref: "User",
        required: [true, "Please enter user"],
    },

    subtotal:{
        type: Number,
        required: [true, "Please enter subtotal"],
    },
    shippingCharges:{
        type: Number,
        required: [true, "Please enter subtotal"],
        default: 0,
    },
    tax:{
        type: Number,
        required: [true, "Please enter subtotal"],
    },
    discount:{
        type: Number,
        required: [true, "Please enter subtotal"],
        default: 0,
    },
    total:{
        type: Number,
        required: [true, "Please enter subtotal"],
    },
    status:{
        type: String,
        enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
        default: "Processing",

    },
    orderItems:[{
        name:String,
        photo:String,
        price:Number,
        quantity:Number,
        productId:{
            type:mongoose.Types.ObjectId,
            ref:"Product",


        },
        

    }]
   
    
    }
,{
    timestamps: true
});

export const Order = mongoose.model("Order", schema);