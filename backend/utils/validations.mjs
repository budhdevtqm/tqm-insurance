import { check } from "express-validator";

const registrationValidation = [
  check("email").isEmail().withMessage("Invalid email address"),
  check("first_name")
    .isLength({ min: 3 })
    .withMessage("first_name length must be of 3 chars!"),
  check("last_name")
    .isLength({ min: 3 })
    .withMessage("last_name length must be of 3 chars!"),
  check("address")
    .isLength({ min: 10 })
    .withMessage("address length must be of 10 chars!"),
  check("contact_number")
    .isLength({ min: 10 })
    .withMessage("contact_number length must be of 10 chars!"),
  check("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
];

const loginValidation = [
  check("email").isEmail().withMessage("Invalid email address"),
  check("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
];

const companyValidation = [
  check("insurance_company_name")
    .isLength({ min: 3 })
    .withMessage("Length must be of 3 chars!"),
];

const verifyValidation = [
  check("first_name")
    .isLength({ min: 3 })
    .withMessage("first_name length must be of 3 chars!"),
  check("last_name")
    .isLength({ min: 3 })
    .withMessage("last_name length must be of 3 chars!"),
  check("address")
    .isLength({ min: 10 })
    .withMessage("address length must be of 10 chars!"),
  check("contact_number")
    .isLength({ min: 10 })
    .withMessage("contact_number length must be of 10 chars!"),
  check("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
];

const addContactValidations = [
  check("name")
    .isLength({ min: 3 })
    .withMessage("first_name length must be of 3 chars!"),
  check("email").isEmail().withMessage("Invalid email address"),
  check("address")
    .isLength({ min: 10 })
    .withMessage("address length must be of 10 chars!"),
  check("contact_number")
    .isLength({ min: 10 })
    .withMessage("contact_number length must be of 10 chars!"),
];

const updateContact = [
  check("name")
    .isLength({ min: 3 })
    .withMessage("first_name length must be of 3 chars!"),
  check("address")
    .isLength({ min: 10 })
    .withMessage("address length must be of 10 chars!"),
  check("contact_number")
    .isLength({ min: 10 })
    .withMessage("contact_number length must be of 10 chars!"),
];

export {
  loginValidation,
  companyValidation,
  registrationValidation,
  verifyValidation,
  addContactValidations,
  updateContact,
};
