import { hash } from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../../utils/db.mjs";
import { validationResult } from "express-validator";
import { mailTransporter } from "../../utils/variables.mjs";
import { pagination } from "../../utils/variables.mjs";
import {
  acceptAgent,
  getFullName,
  invitationEmail,
  rejectAgent,
  userStatus,
} from "../../utils/commonFns.mjs";

const register = async (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        reject({
          status: 400,
          error: modifiedErrors(errors.array()),
        });
      }

      const {
        email,
        address,
        password,
        last_name,
        first_name,
        contact_number,
      } = req.body;

      const [isAlreadyAgent] = await pool.query(
        "SELECT * FROM agents WHERE email=?",
        [email]
      );

      const [isAlreadyAdmin] = await pool.query(
        "SELECT * FROM users WHERE email=?",
        [email]
      );

      if (isAlreadyAgent.length > 0) {
        reject({
          status: 400,
          error: { message: "This email is already in use!" },
        });
      }

      if (isAlreadyAdmin.length > 0) {
        reject({
          status: 400,
          error: { message: "This email is already in use!" },
        });
      }

      const hashed = await hash(password, 10);
      await pool.query(
        "INSERT INTO agents (email, address, password, last_name, first_name, contact_number, status, role) VALUES (?,?,?,?,?,?,?,?)",
        [
          email,
          address,
          hashed,
          last_name,
          first_name,
          contact_number,
          0,
          "agent",
        ]
      );

      resolve({
        ok: true,
        status: 201,
        message: "Sign Up successfully",
      });
    } catch (error) {
      reject({ ok: false, message: "Something went wrong", status: 500 });
    }
  });
};

const allAgents = async (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { name, status, currentPage, column, order } = req.query;
      const statusValue = userStatus(status);
      const { startIndex } = pagination(currentPage);

      let query = "";
      let totalRecordsQuery = "";

      if (name) {
        query = `SELECT * FROM users WHERE (first_name LIKE '%${name}%' OR last_name LIKE '%${name}%') AND is_deleted = 0 AND registration = '${statusValue}' AND role = 'agent' LIMIT 10 OFFSET ${startIndex}`;
        totalRecordsQuery = `SELECT COUNT(*) AS totalRecords FROM users WHERE (first_name LIKE '%${name}%' OR last_name LIKE '%${name}%') AND is_deleted = 0 AND registration = '${statusValue}' AND role = 'agent' LIMIT 10 OFFSET ${startIndex}`;
      } else if (column && order) {
        query = `SELECT * FROM users WHERE is_deleted = 0 AND registration = '${statusValue}' AND role = 'agent' ORDER BY ${column} ${order} LIMIT 10 OFFSET ${startIndex}`;
        totalRecordsQuery = `SELECT COUNT(*) AS totalRecords FROM users WHERE is_deleted = 0 AND status = '${statusValue}' AND role = 'agent'`;
      } else {
        query = `SELECT * FROM users WHERE is_deleted = 0 AND registration = '${statusValue}' AND role = 'agent' ORDER BY id DESC LIMIT 10 OFFSET ${startIndex}`;
        totalRecordsQuery = `SELECT COUNT(*) AS totalRecords FROM users WHERE is_deleted = 0 AND status = '${statusValue}' AND role = 'agent'`;
      }

      const [agents] = await pool.query(query);
      const [recordsLength] = await pool.query(totalRecordsQuery);
      const totalRecords = recordsLength[0].totalRecords;

      resolve({
        status: 200,
        totalRecords,
        data: agents.map((a) => ({ ...a, password: "" })),
      });
    } catch (error) {
      reject({ message: "Something went wrong", status: 500 });
    }
  });
};

const status = async (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const agentId = req.params.id;
      const type = req.body.type;
      let query = "";

      const [agents] = await pool.query(
        `SELECT * FROM users WHERE registration = ? AND id=? `,
        ["0", agentId]
      );

      const { first_name, last_name, email } = agents[0];
      const fullName = getFullName(first_name, last_name);

      if (type === "rejected") {
        await mailTransporter.sendMail(rejectAgent(fullName, email));
        query = `UPDATE users SET registration = '${1}' WHERE id = ${agentId}`;
      }

      if (type === "accepted") {
        await mailTransporter.sendMail(acceptAgent(fullName, email));
        query = `UPDATE users SET registration = '${2}', status = '1' WHERE id = ${agentId}`;
      }

      await pool.query(query);
      resolve({ status: 200, message: "Status Updated" });
    } catch (error) {
      reject({ message: "Something went wrong", status: 500 });
    }
  });
};

const deleteOne = async (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const agentId = req.params.id;
      const result = await pool.query(
        "UPDATE users SET is_deleted = 1 WHERE id =?",
        [agentId]
      );
      resolve({ ok: true, status: 200, message: "Agent deleted" });
    } catch (error) {
      reject({ ok: false, message: "Something went wrong", status: 500 });
    }
  });
};

const allPending = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const [pendingAgents] = await pool.query(
        "SELECT * FROM users WHERE role = 'agent' AND is_deleted = 0 AND registration_status = 'pending'"
      );

      resolve({
        ok: true,
        status: 200,
        data: pendingAgents.map((a) => ({ ...a, password: "" })).reverse(),
      });
    } catch (er) {
      reject({ ok: false, message: "Something went wrong", status: 500 });
    }
  });
};

const invite = async (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { email } = req.body;

      const [isAlreadyAgent] = await pool.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      if (isAlreadyAgent.length > 0) {
        return reject({ status: 400, message: "This email is already in use" });
      }

      const [invitations] = await pool.query(
        "SELECT * FROM icm_invitations WHERE icm_email = ?",
        [email]
      );

      const token = jwt.sign(
        { userEmail: email },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "1h",
        }
      );

      const currentTime = new Date().getTime();
      const expiresIn = currentTime + 3600000;

      if (invitations.length === 0) {
        await pool.query(
          "INSERT INTO icm_invitations (icm_email, icm_token, icm_expire_in) VALUES (?,?,?)",
          [email, token, expiresIn]
        );
      }

      if (invitations.length > 0) {
        await pool.query(
          "UPDATE icm_invitations SET icm_token = ?, icm_expire_in = ? WHERE icm_email = ?",
          [token, expiresIn, email]
        );
      }

      const link = `http://localhost:3000/verify-account/${token}`;
      await mailTransporter.sendMail(invitationEmail(email, link));

      resolve({ status: 201, message: "Invitation successed" });
    } catch (error) {
      reject({ ok: false, message: "Something went wrong", status: 500 });
    }
  });
};

const toggler = async (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const agentId = req.params.id;
      const [agents] = await pool.query(
        "SELECT * FROM users WHERE id =? AND role = 'agent'",
        [agentId]
      );

      const { status } = agents[0];
      const toggleStatus = status === "1" ? "0" : "1";

      await pool.query("UPDATE users SET status = ? WHERE id = ?", [
        toggleStatus,
        agentId,
      ]);
      resolve({ status: 200, message: "Status updated" });
    } catch (error) {
      return { ok: false, message: "Something went wrong", status: 500 };
    }
  });
};

export { register, allAgents, status, deleteOne, allPending, invite, toggler };