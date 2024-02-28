import pool from "../../utils/db.mjs";
import { pagination } from "../../utils/variables.mjs";
import { removePolicyImage } from "../middlewares/upload.mjs";

const allInsuranceCompanies = async (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const [allCompanies] = await pool.query(
        "SELECT * FROM  companies WHERE is_deleted = 0 AND status = 1"
      );

      const onlyIdandName = allCompanies.map((c) => ({
        id: c.id,
        label: c.insurance_company_name,
      }));

      resolve({ ok: true, status: 200, data: onlyIdandName });
    } catch (error) {
      reject({ ok: false, message: "Something went wrong", status: 500 });
    }
  });
};

const addPolicy = async (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const filename = req.file.filename;
      const { name, premium, provider, term } = req.body;

      const [companies] = await pool.query(
        "SELECT * FROM companies WHERE insurance_company_name = ?",
        [provider]
      );

      const providerId = companies[0].id;

      await pool.query(
        "INSERT INTO policies (name, premium, term, provider, image) VALUES (?,?,?,?,?)",
        [name, Number(premium), Number(term), providerId, filename]
      );
      resolve({ ok: true, status: 201, message: "Policy added" });
    } catch (error) {
      reject({ ok: false, message: "Something went wrong", status: 500 });
    }
  });
};

const all = async (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { name, currentPage, sortBy, sortOrder } = req.query;
      const { startIndex } = pagination(currentPage);

      let query = "";
      let totalRecordsQuery = "";
      const baseQuery =
        "SELECT p.id, p.name, p.premium, p.currency, p.term, p.image, p.status, p.is_deleted, p.created_at, p.updated_at, c.insurance_company_name AS provider FROM `policies` p INNER JOIN companies c ON c.id = p.provider AND p.is_deleted = 0";
      const baseTotalRecordsQuery =
        "SELECT COUNT(*) AS totalRecords FROM policies WHERE is_deleted = 0";

      if (name) {
        const nameCondition = `name LIKE '%${name}%'`;
        query = `${baseQuery} WHERE ${nameCondition} LIMIT 10 OFFSET ${startIndex}`;
        totalRecordsQuery = `${baseTotalRecordsQuery} AND ${nameCondition}`;
      } else if (sortBy && sortOrder) {
        query = `${baseQuery} ORDER BY ${sortBy} ${sortOrder} LIMIT 10 OFFSET ${startIndex}`;
        totalRecordsQuery = baseTotalRecordsQuery;
      } else {
        query = `${baseQuery} ORDER BY id DESC LIMIT 10 OFFSET ${startIndex}`;
        totalRecordsQuery = baseTotalRecordsQuery;
      }

      const [polices] = await pool.query(query);
      const [recordsLength] = await pool.query(totalRecordsQuery);
      const totalRecords = recordsLength[0].totalRecords;
      resolve({ status: 200, totalRecords, data: polices });
    } catch (error) {
      reject({ status: 500, message: "Something went wrong" });
    }
  });
};

const update = async (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const filename = req?.file?.filename;
      const { premium, term } = req.body;
      const policyId = req.params.id;

      if (filename === undefined) {
        await pool.query(
          `UPDATE policies SET premium = ${Number(premium)}, term = ${Number(
            term
          )} WHERE id = ${policyId} `
        );
      } else {
        const [polices] = await pool.query(
          "SELECT * FROM policies WHERE id = ?",
          policyId
        );

        const imageName = polices[0].image;
        removePolicyImage("public/uploads/policy", imageName);

        const reuslt = await pool.query(
          `UPDATE policies SET premium = ${Number(premium)}, term = ${Number(
            term
          )}, image = '${filename}' WHERE id = ${policyId}`
        );
      }

      resolve({ status: 200, message: "Policy Updated" });
    } catch (error) {
      reject({ ok: false, message: "Something went wrong", status: 500 });
    }
  });
};

const deletePolicy = async (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const policyId = req.params.id;
      await pool.query(
        "UPDATE policies SET is_deleted = 1 WHERE id = ?",
        policyId
      );
      resolve({ ok: true, message: "Policy Deleted", status: 200 });
    } catch (er) {
      reject({ ok: false, message: "Something went wrong", status: 500 });
    }
  });
};

const single = async (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const policyId = req.params.id;
      const [policies] = await pool.query(
        "SELECT p.id, p.name, p.premium, p.currency, p.term, p.image, p.status, p.is_deleted, p.created_at, p.updated_at, c.insurance_company_name AS provider FROM `policies` p INNER JOIN companies c ON c.id = p.provider AND c.is_deleted = 0 WHERE p.id = ?",
        [policyId]
      );

      resolve({ ok: true, data: policies[0], status: 200 });
    } catch (error) {
      reject({ ok: false, message: "Something went wrong", status: 500 });
    }
  });
};

const toggler = async (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const policyId = req.params.id;
      await pool.query(
        `UPDATE policies SET status = CASE WHEN status = 0 THEN 1 WHEN status = 1 THEN 0 ELSE status END WHERE id = ${policyId}`
      );
      resolve({ status: 200, message: "Status updated" });
    } catch (er) {
      reject({ status: 500, message: "something went wrong" });
    }
  });
};

export {
  addPolicy,
  allInsuranceCompanies,
  all,
  single,
  deletePolicy,
  update,
  toggler,
};
