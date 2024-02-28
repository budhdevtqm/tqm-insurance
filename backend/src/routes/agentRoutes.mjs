import express from "express";
import authAdmin from "../middlewares/authAdmin.mjs";
import { registrationValidation } from "../../utils/validations.mjs";
import {
  signup,
  getAll,
  toggle,
  invitation,
  getPending,
  deleteAgent,
  updateStatus,
} from "../controllers/agentController.mjs";

const router = express.Router();

router.post("/signup", registrationValidation, signup);
router.get("/get-all", authAdmin, getAll);
router.get("/get-all/pending", authAdmin, getPending);
router.patch("/update/status/:id", authAdmin, updateStatus);
router.patch("/toggle-status/:id", authAdmin, toggle);
router.delete("/delete/:id", authAdmin, deleteAgent);
router.post("/invitation", authAdmin, invitation);

export default router;
