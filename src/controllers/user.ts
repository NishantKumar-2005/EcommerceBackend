import { NextFunction, Request, Response } from "express";
import { User } from "../models/User.js";
import { NewUserRequestBody } from "../types/types.js";
import ErrorHandling, { TryCatch } from "../utils/utility.class.js";

export const newUser = TryCatch(
    async (req: Request<{}, {}, NewUserRequestBody>, res: Response, next: NextFunction) => {
    
        const { name, email, dob, photo, gender, _id } = req.body;

        let user = await User.findById(_id);
        if(user){
            return res.status(201).json({
                status: "success",
                message: `Welcome back ${user.name}`,
            });
            }
        if(!_id || !name || !email || !dob || !photo){
            return next(new ErrorHandling("Please provide all the required fields", 400));
        }
         user = await User.create({
            name, email, photo, gender, _id ,dob: new Date(dob)
        });

        return res.status(201).json({
            status: "success",
            message: "User created successfully",
        });

})