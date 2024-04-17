import express from "express";
import { deleteUserById, getAllUsers, getUserById, newUser } from "../controllers/user.js";
import { adminAuth } from "../middlewares/auth.js";

const app=express.Router();

// to crate a new user
app.post("/new",newUser);

// to get all users
app.get("/all",adminAuth,getAllUsers);

//to get a user by id
app.route("/:id").get(getUserById).delete(adminAuth,deleteUserById);

export default app;