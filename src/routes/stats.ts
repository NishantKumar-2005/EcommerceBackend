import express from "express";
import { adminAuth } from "../middlewares/auth.js";
import { getBarChart, getDashboardstats, getLineChart, getPieChart } from "../controllers/stats.js";

const app=express.Router();

app.get("/stats",adminAuth,getDashboardstats);

app.get("/pie",adminAuth,getPieChart);
app.get("/bar",adminAuth,getBarChart);
app.get("/line",adminAuth,getLineChart);

export default app;