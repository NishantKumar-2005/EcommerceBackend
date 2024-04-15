import { NextFunction, Request, Response } from "express";
import { ControllerType } from "../types/types.js";

class ErrorHandling extends Error {
  constructor(public message: string,public statusCode: number) {
    super();
    this.message = message;
    this.statusCode = statusCode;
  }
}
export default ErrorHandling;

export const TryCatch =(func: ControllerType)=>(req: Request,res: Response, next: NextFunction)=>{
    return Promise.resolve(func(req,res,next)).catch((error:ErrorHandling)=>next(error));
};