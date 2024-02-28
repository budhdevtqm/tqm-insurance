import {
  all,
  single,
  update,
  toggler,
  addPolicy,
  deletePolicy,
  allInsuranceCompanies,
} from "../models/policyModal.mjs";

const getCompanies = async (req, res) => {
  try {
    const response = await allInsuranceCompanies();
    res.status(200).json(response);
  } catch (error) {
    res.status(error.status).json(error);
  }
};

const add = async (req, res) => {
  try {
    const response = await addPolicy(req);
    res.status(response.status).json(response);
  } catch (error) {
    res.status(error.status).json(error);
  }
};

const getAll = async (req, res) => {
  try {
    const response = await all(req);
    res.status(response.status).json(response);
  } catch (error) {
    res.status(error.status).json(error);
  }
};

const softDelete = async (req, res) => {
  try {
    const response = await deletePolicy(req);
    res.status(response.status).json(response);
  } catch (error) {
    res.status(error.status).json(error);
  }
};

const getSingle = async (req, res) => {
  try {
    const response = await single(req);
    res.status(response.status).json(response);
  } catch (error) {
    res.status(error.status).json(error);
  }
};

const updatePolicy = async (req, res) => {
  try {
    const response = await update(req);
    res.status(response.status).json(response);
  } catch (error) {
    res.status(error.status).json(error);
  }
};

const statusToggler = async (req, res) => {
  try {
    const response = await toggler(req);
    res.status(response.status).json(response);
  } catch (error) {
    res.status(error.status).json(error);
  }
};

export {
  add,
  getAll,
  getSingle,
  softDelete,
  updatePolicy,
  getCompanies,
  statusToggler,
};
