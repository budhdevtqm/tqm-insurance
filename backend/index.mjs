import express from "express";
import cors from "cors";
import "dotenv/config";
import path from "path";
import authRouter from "./src/routes/authRoute.mjs";
import companyRouter from "./src/routes/companyRoute.mjs";
import agentRouter from "./src/routes/agentRoutes.mjs";
import policyRouter from "./src/routes/policyRoute.mjs";
import contactRouter from "./src/routes/contactRoutes.mjs";
import dashboardRouter from "./src/routes/dashboardRoute.mjs";

const app = express();
const __dirname = path.resolve();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/auth", authRouter);
app.use("/agent", agentRouter);
app.use("/policy", policyRouter);
app.use("/contact", contactRouter);
app.use("/company", companyRouter);
app.use("/dashboard", dashboardRouter);

app.listen(process.env.PORT || 4000, () => console.log("server started"));
