import Stripe from "stripe";
import PDFDocument from "pdfkit";
import { v4 as uuid } from "uuid";
const stripe = new Stripe(stripeKey);
import pool from "../../utils/db.mjs";
import { validationResult } from "express-validator";
import {
  mailTransporter,
  pagination,
  stripeKey,
} from "../../utils/variables.mjs";

import {
  makePaymentEmail,
  modifyPaymentStatus,
  policyPurchaseEmail,
  addMonthsToCurrentDate,
} from "../../utils/commonFns.mjs";

const add = async (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return reject({
          status: 400,
          error: modifiedErrors(errors.array()),
        });
      }
      const { userId, name, email, contact_number, address } = req.body;

      const [isAlready] = await pool.query(
        "SELECT * FROM users WHERE email=?",
        [email]
      );

      if (isAlready.length > 0) {
        return reject({ status: 400, message: "This email is already in use" });
      }

      await pool.query(
        "INSERT INTO users (created_by, email, address, password, last_name, first_name, contact_number, role, registration, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [userId, email, address, "", "", name, contact_number, "user", "2", "1"]
      );

      resolve({ message: "Contact added", status: 201 });
    } catch (error) {
      reject({ message: "Something went wrong", status: 500 });
    }
  });
};

const all = async (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { name, currentPage, sortBy, sortOrder } = req.query;
      const { startIndex } = pagination(currentPage);
      const { userId } = req.body;

      let query = "";
      let totalRecordsQuery = "";
      const baseQuery = `SELECT first_name AS name, email, address, contact_number, created_at, updated_at, status, id FROM users WHERE created_by = ${userId} AND is_deleted = 0 AND registration = "2"`;
      const baseTotalRecordsQuery = `SELECT COUNT(*) as totalRecords FROM users WHERE created_by = ${userId} AND is_deleted = 0 AND registration = "2"`;

      if (name) {
        const nameCondition = `first_name LIKE '%${name}%'`;
        query = `${baseQuery} AND ${nameCondition} LIMIT 10 OFFSET ${startIndex}`;
        totalRecordsQuery = `${baseTotalRecordsQuery} AND ${nameCondition}`;
      } else if (sortBy && sortOrder) {
        query = `${baseQuery} ORDER BY ${sortBy} ${sortOrder} LIMIT 10 OFFSET ${startIndex}`;
        totalRecordsQuery = `${baseTotalRecordsQuery} ORDER BY ${sortBy} ${sortOrder}`;
      } else {
        query = `${baseQuery} ORDER BY id DESC LIMIT 10 OFFSET ${startIndex}`;
        totalRecordsQuery = baseTotalRecordsQuery;
      }

      const [contacts] = await pool.query(query);
      const [recordsLength] = await pool.query(totalRecordsQuery);
      const totalRecords = recordsLength[0].totalRecords;
      resolve({ status: 200, totalRecords, data: contacts });
    } catch (error) {
      reject({ message: "Something went wrong", status: 500 });
    }
  });
};

const single = async (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { userId } = req.body;
      const contactId = req.params.id;
      const [users] = await pool.query(
        "SELECT first_name AS name, email, address, contact_number,status,created_at,id FROM users WHERE created_by = ? AND id = ?",
        [userId, contactId]
      );
      resolve({
        status: 200,
        data: { user: users[0] },
      });
    } catch (error) {
      reject({ message: "Something went wrong", status: 500 });
    }
  });
};

const update = async (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return reject({
          status: 400,
          error: modifiedErrors(errors.array()),
        });
      }

      const contactId = req.params.id;
      const { name, address, contact_number } = req.body;

      await pool.query(
        `UPDATE users SET first_name = ?, address = ?, contact_number = ? WHERE id = ?`,
        [name, address, contact_number, contactId]
      );

      resolve({ message: "Contact Updated", status: 200 });
    } catch (er) {
      reject({ message: "Something went wrong", status: 500 });
    }
  });
};

const allCompanyAndPolicy = async (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const [companies] = await pool.query(
        "SELECT insurance_company_name as label, id as value FROM companies WHERE status = 1"
      );

      const [policies] = await pool.query(
        "SELECT name , id as value, provider, premium, term from policies WHERE status = 1"
      );

      resolve({ status: 200, data: { companies, policies } });
    } catch (error) {
      reject({ message: "Something went wrong", status: 500 });
    }
  });
};

const assign = async (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const token = uuid();
      const { userId } = req.params;
      const { policyId, companyId, premium, term, userId: agent_id } = req.body;

      await pool.query(
        "INSERT INTO icm_orders (uuid,user_id, company_id, policy_id, payment_id, agent_id, premium, term) VALUES (?,?, ?, ?, ?, ?, ?, ?)",
        [token, userId, companyId, policyId, 0, agent_id, premium, term]
      );

      const [contacts] = await pool.query(
        "SELECT * FROM users WHERE id=? AND role = 'user'",
        [userId]
      );

      const { first_name, email } = contacts[0];
      const link = `http://localhost:3000/policy-payment/${token}`;

      await mailTransporter.sendMail(
        makePaymentEmail(email, first_name, `# ${policyId}`, premium, link)
      );

      resolve({ status: 201, message: "Policy Assigned" });
    } catch (error) {
      reject({ message: "Something went wrong", status: 500 });
    }
  });
};

const deleteContact = async (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const contactId = req.params.id;
      await pool.query("UPDATE users SET is_deleted = 1 WHERE id = ?", [
        contactId,
      ]);
      resolve({ status: 200, message: "Successfully deleted" });
    } catch (error) {
      reject({ message: "Something went wrong", status: 500 });
    }
  });
};

const tokenCheck = async (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { uuid } = req.params;
      const [orders] = await pool.query(
        "SELECT * FROM icm_orders WHERE uuid = ?",
        [uuid]
      );

      if (orders.length === 0) {
        return reject({ status: 400, message: "Invalid Link" });
      }

      const { status, premium } = orders[0];

      if (status === "1" || status === "0") {
        return reject({ status: 202, data: { amount: premium } });
      }

      resolve({ status: 200, data: { amount: 0 } });
    } catch (er) {
      reject({ message: "Something went wrong", status: 500 });
    }
  });
};

const policyPurchase = async (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const uuid = req.params.uuid;
      const queryForEmailData = `SELECT  o.expire_date, c.insurance_company_name AS provider, p.name as policy_name, u.first_name as user_name, u.email as user_email, o.agent_id FROM icm_orders o JOIN companies c ON c.id = o.company_id JOIN policies p ON p.id = o.policy_id JOIN users u ON o.user_id = u.id WHERE o.uuid = '${uuid}'`;

      const findIdAndPremiumQuery = `SELECT premium, term FROM icm_orders WHERE uuid = '${uuid}'`;
      const addPaymentQuery =
        "INSERT INTO icm_payments (stripe_id, amount) VALUES (?,?)";

      const agentDetailsQuery =
        "SELECT first_name, last_name, email, contact_number FROM users WHERE id = ?";

      const [orderResult] = await pool.query(findIdAndPremiumQuery);
      const { term, premium } = orderResult[0];

      const { id: paymentId, amount } = await stripe.paymentIntents.create({
        amount: premium,
        currency: "inr",
        automatic_payment_methods: {
          enabled: true,
        },
      });

      const paymentResult = await pool.query(addPaymentQuery, [
        paymentId,
        amount,
      ]);

      const insertId = paymentResult[0].insertId;
      const expiryDate = addMonthsToCurrentDate(Number(term));

      await pool.query(
        `UPDATE icm_orders SET payment_id = ${insertId}, expire_date = '${expiryDate}', status = '2' WHERE uuid ='${uuid}'`
      );

      const [orders] = await pool.query(queryForEmailData);

      const {
        provider,
        agent_id,
        user_name,
        user_email,
        expire_date,
        policy_name,
      } = orders[0];

      const [agents] = await pool.query(agentDetailsQuery, [agent_id]);
      const { first_name, last_name, email, contact_number } = agents[0];
      const agentName = `${first_name} ${last_name}`;

      await mailTransporter.sendMail(
        policyPurchaseEmail(
          user_email,
          user_name,
          policy_name,
          provider,
          premium,
          expire_date,
          agentName,
          email,
          contact_number
        )
      );

      resolve({ status: 200, message: "Payment successfull" });
    } catch (er) {
      console.log("errrr", er);
      reject({ message: "Something went wrong", status: 500 });
    }
  });
};

const contactPolicy = async (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { currentPage, paymentStaus, id } = req.query;
      const status = modifyPaymentStatus(paymentStaus);
      const { startIndex } = pagination(currentPage);

      const query = `SELECT o.id, o.premium, o.term, o.expire_date, c.insurance_company_name AS provider, p.name as policy_name FROM icm_orders o JOIN companies c ON c.id = o.company_id JOIN policies p ON p.id = o.policy_id WHERE o.user_id = ${id} AND o.status = '${status}' ORDER BY id DESC LIMIT 10 OFFSET ${startIndex}`;
      const premiumQuery = `SELECT premium FROM icm_orders WHERE user_id = ? AND status = '2'`;
      const totalRecordsQuery = `SELECT COUNT(*) AS totalRecords FROM icm_orders WHERE user_id = ? AND status = ?`;

      const [recordsLength] = await pool.query(totalRecordsQuery, [id, status]);
      const [premiums] = await pool.query(premiumQuery, [id]);
      const [userPolicies] = await pool.query(query);

      const { totalRecords } = recordsLength[0];
      const totalPremium = premiums.reduce((acc, p) => acc + p.premium, 0);
      const data = { totalPremium, totalRecords, policies: userPolicies };

      resolve({ status: 200, data });
    } catch (er) {
      reject({ status: 500, message: "Something went wrong" });
    }
  });
};

const pdf = async (req, res) => {
  try {
    const policyId = req.params.id;
    const queryForEmailData = `SELECT o.expire_date,o.term,o.premium, c.insurance_company_name AS provider, p.name as policy_name, u.first_name as user_name, u.email as user_email, u.address as user_address, o.agent_id FROM icm_orders o JOIN companies c ON c.id = o.company_id JOIN policies p ON p.id = o.policy_id JOIN users u ON o.user_id = u.id WHERE o.id = '${policyId}'`;

    const agentInfoQuery =
      "SELECT first_name, last_name, email, contact_number FROM users WHERE id = ?";

    const [orders] = await pool.query(queryForEmailData);

    const {
      term,
      premium,
      provider,
      agent_id,
      user_name,
      user_email,
      expire_date,
      policy_name,
      user_address,
    } = orders[0];

    const [agents] = await pool.query(agentInfoQuery, [agent_id]);

    const {
      first_name,
      last_name,
      email: agentEmail,
      contact_number: agentMobile,
    } = agents[0];

    const fullName = `${first_name} ${last_name}`;
    const pdfName = `${user_name}-${policy_name}.pdf`;

    const doc = new PDFDocument();
    res.setHeader("Content-Disposition", `attachment; filename="${pdfName}"`);
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    doc.fontSize(12);
    doc.text("Insurance Policy Details", { align: "center" });
    doc.moveDown();

    doc.fontSize(10);
    doc.text("User Information:", { underline: true });
    doc.text(`Name: ${user_name}`);
    doc.text(`Email: ${user_email}`);
    doc.text(`Address: ${user_address}`);
    doc.moveDown();

    doc.text("Agent Information:", { underline: true });
    doc.text(`Name: ${fullName}`);
    doc.text(`Email: ${agentEmail}`);
    doc.text(`Contact Number: +91 ${agentMobile}`);
    doc.moveDown();

    doc.text("Policy Information:", { underline: true });
    doc.text(`Expiry Date: ${expire_date}`);
    doc.text(`Term: ${term} Months`);
    doc.text(`Policy Premium: ${premium} Rs`);
    doc.moveDown();

    doc.text("Insurance Company:", { underline: true });
    doc.text(`Company Name: ${provider}`);
    doc.moveDown();
    doc.end();
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export {
  pdf,
  all,
  add,
  single,
  update,
  assign,
  tokenCheck,
  deleteContact,
  contactPolicy,
  policyPurchase,
  allCompanyAndPolicy,
};
