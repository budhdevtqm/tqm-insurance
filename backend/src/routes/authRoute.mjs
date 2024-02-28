import express from "express";
import {
  loginValidation,
  registrationValidation,
  verifyValidation,
} from "../../utils/validations.mjs";
import {
  loginAdmin,
  register,
  loginAgent,
  verifyAccount,
  linkVerification,
} from "../controllers/authController.mjs";
import verifyToken from "../middlewares/checkToken.mjs";

const router = express.Router();

router.post("/login/admin", loginValidation, loginAdmin);
router.post("/login", loginValidation, loginAgent);
router.post("/register", registrationValidation, register);
router.get("/verify/link/:token", verifyToken, linkVerification);
router.post(
  "/verify-account/:token",
  [verifyToken, verifyValidation],
  verifyAccount
);

export default router;
