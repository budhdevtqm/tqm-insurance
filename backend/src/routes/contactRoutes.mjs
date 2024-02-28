import express from "express";
import authAgent from "../middlewares/authAgent.mjs";
import {
  updateContact,
  addContactValidations,
} from "../../utils/validations.mjs";
import {
  addNew,
  getAll,
  payment,
  getSingle,
  updateOne,
  checkToken,
  softDelete,
  assignPolicy,
  getContactPolicy,
  companiesAndPolices,
} from "../controllers/contactController.mjs";
import { pdf } from "../models/contactModal.mjs";

const router = express.Router();

router.patch("/pay/:uuid", payment);
router.get("/policy/pdf/:id", authAgent, pdf);
router.get("/get/user/policy/", [authAgent], getContactPolicy);
router.patch("/delete/contact/:id", authAgent, softDelete);
router.get("/get/companies/policies", authAgent, companiesAndPolices);
router.get("/verification/:uuid", checkToken);
router.get("/get-all", [authAgent], getAll);
router.get("/get/:id", [authAgent], getSingle);
router.post("/add", [authAgent, addContactValidations], addNew);
router.patch("/update/:id", [authAgent, updateContact], updateOne);
router.post("/assign/policy/:userId", [authAgent], assignPolicy);

export default router;
