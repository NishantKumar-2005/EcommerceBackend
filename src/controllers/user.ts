import { NextFunction, Request, Response } from "express";
import { User } from "../models/User.js";
import { NewUserRequestBody } from "../types/types.js";

export const newUser = async (req: Request<{}, {}, NewUserRequestBody>, res: Response, next: NextFunction) => {
    try {
        const { name, email, dob, photo, gender, role, _id } = req.body;

        const user = await User.create({
            name, email, photo, gender, _id ,dob: new Date(dob)
        });

        return res.status(201).json({
            status: "success",
            message: "User created successfully",
        });

    } catch (error) {
        res.status(400).json({
            status: "fail",
        });
    }
};