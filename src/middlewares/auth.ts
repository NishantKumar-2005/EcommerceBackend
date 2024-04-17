// admin authentication

import { User } from "../models/User.js";
import ErrorHandling, { TryCatch } from "../utils/utility.class.js";

export const adminAuth= TryCatch(async (req, res, next) => {
    const {id} = req.query;

    if(!id){
        return next(new ErrorHandling("Please provide an ID", 400));
    }
    const user = await User.findById(id);
    if(!user){
        return next(new ErrorHandling("No user found with that ID", 404));
    }
    if(user.role !== "admin"){
        return next(new ErrorHandling("You are not authorized to perform this action", 401));
    }
    next();

});