import jwt from "jsonwebtoken";
import pool from "../../utils/db.mjs";
import { hash, compare } from "bcrypt";
import { validationResult } from "express-validator";
import { mailTransporter } from "../../utils/variables.mjs";
import {
  currentIST,
  getFullName,
  modifiedErrors,
  registrationMail,
} from "../../utils/commonFns.mjs";

const signinAdmin = async (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        reject({
          ok: false,
          status: 400,
          error: modifiedErrors(errors.array()),
        });
      }

      const { email, password } = req.body;

      const [users] = await pool.query(
        "SELECT * FROM users WHERE email = ? AND role = 'admin'",
        [email]
      );

      if (users.length === 0) {
        reject({
          ok: false,
          status: 400,
          message: "Invalid Email and Password",
        });
      }

      let user = users[0];

      const { role, password: hashed } = user;
      const validPassword = await compare(password, hashed);

      if (!validPassword) {
        reject({
          ok: false,
          status: 400,
          message: "Invalid Email and Password",
        });
      }

      const token = jwt.sign(
        { userRole: role, userEmail: email },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "1h",
        }
      );

      resolve({
        role,
        token,
        ok: true,
        status: 200,
        message: "login successfully.",
      });
    } catch (error) {
      reject({ ok: false, message: "Something went wrong", status: 500 });
    }
  });
};

const registerUser = async (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        first_name,
        last_name,
        email,
        password,
        address,
        contact_number,
      } = req.body;

      const [isExisting] = await pool.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      if (isExisting.length > 0) {
        reject({
          ok: false,
          status: 400,
          message: "Please try with another email.",
        });
      }

      const hashed = await hash(password, 10);
      const [admins] = await pool.query(
        "SELECT * FROM users WHERE role = 'admin'"
      );

      const admin = admins[0];
      const agentName = getFullName(first_name, last_name);
      const adminName = getFullName(admin.first_name, admin.last_name);

      await mailTransporter.sendMail(
        registrationMail(adminName, admin.email, agentName, email, currentIST())
      );

      await pool.query(
        "INSERT INTO users (email, address, password, last_name, first_name, contact_number, role) VALUES (?,?,?,?,?,?,?)",
        [email, address, hashed, last_name, first_name, contact_number, "agent"]
      );

      resolve({
        ok: true,
        status: 200,
        message: "Registration succeeded",
      });
    } catch (er) {
      reject({ ok: false, message: "Something went wrong", status: 500 });
    }
  });
};

const logoutUser = async (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const token = req.headers["authorization"];

      if (!token) {
        reject({ status: 401, message: "Unauthorized" });
      }

      const { userRole, userEmail } = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET
      );
    } catch (error) {
      reject({ status: 401, message: "Unauthorized" });
    }
  });
};

const signinAgent = async (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        reject({
          ok: false,
          status: 400,
          error: modifiedErrors(errors.array()),
        });
      }

      const { email, password } = req.body;
      const [users] = await pool.query(
        "SELECT * FROM users WHERE email = ? AND role = 'agent' AND is_deleted = 0",
        [email]
      );

      if (users.length === 0) {
        reject({
          ok: false,
          status: 400,
          message: "Invalid Email and Password",
        });
      }

      let user = users[0];

      const { registration, role, password: hashed } = user;

      if (registration === "0") {
        reject({
          ok: false,
          status: 403,
          message: "Your profile is on hold",
        });
      }

      if (registration === "1") {
        reject({
          ok: false,
          status: 400,
          message: "Your profile is rejected",
        });
      }

      const validPassword = await compare(password, hashed);

      if (!validPassword) {
        reject({
          ok: false,
          status: 400,
          message: "Invalid Email and Password",
        });
      }

      const token = jwt.sign(
        { userRole: role, userEmail: email },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "1h",
        }
      );

      resolve({
        role,
        token,
        ok: true,
        status: 200,
        message: "login successfully.",
      });
    } catch (error) {
      reject({ ok: false, message: "Something went wrong", status: 500 });
    }
  });
};

const verifyLink = async (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      resolve({ status: 200 });
    } catch (er) {
      reject({ status: 401, message: "Invalid Token" });
    }
  });
};

const verify = async (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        reject({
          ok: false,
          status: 400,
          error: modifiedErrors(errors.array()),
        });
      }
      const {
        first_name,
        last_name,
        address,
        contact_number,
        password,
        userEmail,
      } = req.body;

      const [isAlreadyAgent] = await pool.query(
        "SELECT * FROM users WHERE email = ? AND role = 'agent'",
        [userEmail]
      );

      if (isAlreadyAgent.length > 0) {
        return reject({
          status: 400,
          message: "You are registered user Please Login",
        });
      }

      const hashed = await hash(password, 10);
      await pool.query(
        "INSERT INTO users (email, address, password, last_name, first_name, contact_number, role, registration, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ",
        [
          userEmail,
          address,
          hashed,
          last_name,
          first_name,
          contact_number,
          "agent",
          "2",
          "1",
        ]
      );

      await pool.query("DELETE FROM icm_invitations WHERE icm_email = ?", [
        userEmail,
      ]);
      resolve({
        status: 201,
        message: "Account verification is succeeded, Please login",
      });
    } catch (error) {
      reject({ status: 401, message: "Link expired" });
    }
  });
};

export {
  registerUser,
  signinAdmin,
  logoutUser,
  signinAgent,
  verify,
  verifyLink,
};
