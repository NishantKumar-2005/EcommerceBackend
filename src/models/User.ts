import mongoose from "mongoose";
import validator from "validator";

interface IUser extends Document{
    _id: string;
    name: string;
    email: string;
    photo: string;
    role: "user" | "admin";
    gender: "male" | "female";
    dob: Date;
    age: number;
    createdAt: Date;
    updatedAt: Date;
}

const schema = new mongoose.Schema({
    _id:{
        type: String,
        required: [true, "ID is required"],
        
    },
    name:{
        type: String,
        required: [true, "Name is required"],
    },
    email:{
        type: String,
        required: [true, "Email is required"],
        validate: validator.default.isEmail
    },
    photo:{
        type: String,
        required: [true, "Photo is required"],
    },
    role:{
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    gender:{
        type: String,
        enum:["male","female"],
        required:[true,"Enter gender"]
    },
    dob:{
        type: Date,
        required:[true,"Enter DOB"]
    },
    }
,{
    timestamps: true
});

schema.virtual("age").get(function(){
    const today = new Date();
    const dob = new Date(this.dob);
    let age = today.getFullYear() - dob.getFullYear();
    if(today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())){
        age--;
    }
    return age;
});

export const User = mongoose.model<IUser>("User", schema);