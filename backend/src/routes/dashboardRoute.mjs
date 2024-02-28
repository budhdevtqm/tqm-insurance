import express from "express";
import authAdmin from "../middlewares/authAdmin.mjs";
import authAgent from "../middlewares/authAgent.mjs";
import { adminIndex, agentIndex } from "../controllers/dashboardController.mjs";

const router = express.Router();

router.get("/", authAgent, agentIndex);
router.get("/admin/analytics", authAdmin, adminIndex);

export default router;
