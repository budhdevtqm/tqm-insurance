import express from "express";
const router = express.Router();
import authAdmin from "../middlewares/authAdmin.mjs";
import { uploadPolicy } from "../middlewares/upload.mjs";
import {
  add,
  getAll,
  getSingle,
  softDelete,
  updatePolicy,
  getCompanies,
  statusToggler,
} from "../controllers/policyController.mjs";

const uploadImage = uploadPolicy.single("image");

router.get("/get/companies", authAdmin, getCompanies);
router.post("/add", [authAdmin, uploadImage], add);
router.get("/get/:id", authAdmin, getSingle);
router.get("/get-all", authAdmin, getAll);
router.patch("/delete/:id", authAdmin, softDelete);
router.patch("/toggle-status/:id", authAdmin, statusToggler);
router.patch("/update/:id", [authAdmin, uploadImage], updatePolicy);

export default router;
