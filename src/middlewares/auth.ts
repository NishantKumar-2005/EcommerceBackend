import { User } from "../models/User.js";
import ErrorHandling, { TryCatch } from "../utils/utility.class.js";

export const adminOnly = TryCatch(async (req, res, next) => {
    const { id } = req.query;
    if (!id) {
        return next(new ErrorHandling("ID not found", 401));
    }
    const user = await User.findById(id);
    if (!user) {
        return next(new ErrorHandling("Admin user not found", 401));
    }
    if (user.role !== "admin") {
        return next(new ErrorHandling("Aukat nahin hai teri :)", 401));
    }
    next();
})