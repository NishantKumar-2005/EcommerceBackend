import { NextFunction, Request, Response } from "express";
import ErrorHandling from "../utils/utility.class.js";

export const errorMiddelware = (err: ErrorHandling, req: Request, res: Response, next: NextFunction) => {
    err.message = err.message || "Internal Server Error";
    err.statusCode = err.statusCode || 500;
    return res.status(err.statusCode).json({
        status: "fail",
        message: err.message,
    });
}
