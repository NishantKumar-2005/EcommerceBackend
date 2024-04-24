import express from "express";
import { adminAuth } from "../middlewares/auth.js";
import { getBarChart, getDashboardstats, getLineChart, getPieChart } from "../controllers/stats.js";

const app=express.Router();

app.get("/stats",adminAuth,getDashboardstats);

app.get("/pie",getPieChart);
app.get("/bar",getBarChart);
app.get("/line",getLineChart);

export default app;