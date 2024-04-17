import { adminOnly } from '../middlewares/auth.js';
import express from "express";
import { getUsers, newUser } from "../controllers/user.js";

const app=express.Router();

app.post("/new",newUser);
app.get("/getAll",adminOnly,getUsers)

export default app;