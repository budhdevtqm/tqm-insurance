import express from "express";
import authAdmin from "../middlewares/authAdmin.mjs";
import { companyValidation } from "../../utils/validations.mjs";
import {
  addCompany,
  getCompany,
  getCompanies,
  updateCompany,
  deleteCompany,
  toggleStatus,
} from "../controllers/companyController.mjs";

const router = express.Router();

router.get("/get-all", authAdmin, getCompanies);
router.get("/get/:id", authAdmin, getCompany);
router.delete("/delete/:id", [authAdmin], deleteCompany);
router.post("/add", [authAdmin, companyValidation], addCompany);
router.patch("/update/:id", [authAdmin, companyValidation], updateCompany);
router.patch("/toggle-status/:id", authAdmin, toggleStatus);

export default router;
