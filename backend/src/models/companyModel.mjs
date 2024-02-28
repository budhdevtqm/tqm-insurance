import pool from "../../utils/db.mjs";
import { validationResult } from "express-validator";
import { pagination } from "../../utils/variables.mjs";
import { modifiedErrors } from "../../utils/commonFns.mjs";

const add = async (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return reject({
          ok: false,
          status: 400,
          error: modifiedErrors(errors.array()),
        });
      }

      const { insurance_company_name, email } = req.body;
      const sameNameQuery = `SELECT * FROM companies WHERE insurance_company_name = '${insurance_company_name}'`;
      const sameEmailQuery = `SELECT * FROM companies WHERE email = '${email}'`;

      const [sameNames] = await pool.query(sameNameQuery);
      if (sameNames.length > 0) {
        return reject({
          ok: false,
          status: 400,
          message: "Please choose different company Name",
        });
      }

      const [sameEmails] = await pool.query(sameEmailQuery);

      if (sameEmails.length > 0) {
        return reject({
          ok: false,
          status: 400,
          message: "Please choose different email for company",
        });
      }

      await pool.query(
        "INSERT INTO companies (insurance_company_name,email) VALUES (?,?)",
        [insurance_company_name, email]
      );

      resolve({ ok: true, status: 201, message: "Company added" });
    } catch (error) {
      reject({ ok: false, status: 500, message: "something went wrong" });
    }
  });
};

const updateName = async (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return reject({
          ok: false,
          status: 400,
          error: modifiedErrors(errors.array()),
        });
      }

      const companyId = req.params.id;
      const { insurance_company_name } = req.body;

      const [sameCompanies] = await pool.query(
        "SELECT * FROM companies WHERE insurance_company_name = ?",
        [insurance_company_name]
      );

      if (sameCompanies.length > 1) {
        return reject({
          ok: false,
          status: 400,
          message: "Pleae try with another name!",
        });
      }

      await pool.query(
        `UPDATE companies SET insurance_company_name = '${insurance_company_name}' WHERE id = ${companyId}`
      );
      resolve({ ok: true, status: 200, message: "Company updated" });
    } catch (error) {
      reject({ ok: false, status: 500, message: "something went wrong" });
    }
  });
};

const getSingle = async (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const companyId = req.params.id;
      const [companies] = await pool.query(
        "SELECT * FROM companies WHERE id=?",
        [companyId]
      );
      const company = companies[0];

      resolve({ ok: true, status: 200, data: company });
    } catch (error) {
      reject({ ok: false, status: 500, message: "something went wrong" });
    }
  });
};

const getAll = (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { insurance_company_name, currentPage, sortBy, sortOrder } =
        req.query;
      const { startIndex } = pagination(currentPage);

      let query = "";
      let totalRecordsQuery = "";
      const baseQuery = "SELECT * FROM companies WHERE is_deleted = 0";
      const baseTotalRecordsQuery =
        "SELECT COUNT(*) AS totalRecords FROM companies WHERE is_deleted = 0";

      if (insurance_company_name) {
        const nameCondition = `insurance_company_name LIKE '%${insurance_company_name}%'`;
        query = `${baseQuery} AND ${nameCondition} LIMIT 10 OFFSET ${startIndex}`;
        totalRecordsQuery = `${baseTotalRecordsQuery} AND ${nameCondition}`;
      } else if (sortBy && sortOrder) {
        query = `${baseQuery} ORDER BY ${sortBy} ${sortOrder} LIMIT 10 OFFSET ${startIndex}`;
        totalRecordsQuery = baseTotalRecordsQuery;
      } else {
        query = `${baseQuery} ORDER BY id DESC LIMIT 10 OFFSET ${startIndex}`;
        totalRecordsQuery = baseTotalRecordsQuery;
      }

      const [companies] = await pool.query(query);
      const [recordsLength] = await pool.query(totalRecordsQuery);
      const totalRecords = recordsLength[0].totalRecords;
      resolve({ status: 200, totalRecords, data: companies });
    } catch (error) {
      reject({ status: 500, message: "something went wrong" });
    }
  });
};

const companyDeletion = async (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const companyId = req.params.id;
      await pool.query("UPDATE companies SET is_deleted = 1 WHERE id=?", [
        companyId,
      ]);
      resolve({ status: 200, message: "Company Deleted" });
    } catch (error) {
      reject({ status: 500, message: "something went wrong" });
    }
  });
};

const toggler = async (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const companyId = req.params.id;
      await pool.query(
        `UPDATE companies SET status = CASE WHEN status = 0 THEN 1 WHEN status = 1 THEN 0 ELSE status END WHERE id = ${companyId}`
      );
      resolve({ status: 200, message: "Status updated" });
    } catch (error) {
      reject({ status: 500, message: "something went wrong" });
    }
  });
};

export { add, updateName, getSingle, getAll, companyDeletion, toggler };
