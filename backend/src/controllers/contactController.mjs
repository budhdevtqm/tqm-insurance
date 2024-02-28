import {
  add,
  all,
  single,
  update,
  assign,
  tokenCheck,
  deleteContact,
  contactPolicy,
  policyPurchase,
  allCompanyAndPolicy,
  pdf,
} from "../models/contactModal.mjs";

const addNew = async (req, res) => {
  try {
    const response = await add(req);
    res.status(response.status).json(response);
  } catch (er) {
    res.status(er.status).json(er);
  }
};

const getAll = async (req, res) => {
  try {
    const response = await all(req);
    res.status(response.status).json(response);
  } catch (er) {
    res.status(er.status).json(er);
  }
};

const getSingle = async (req, res) => {
  try {
    const response = await single(req);
    res.status(response.status).json(response);
  } catch (er) {
    res.status(er.status).json(er);
  }
};

const updateOne = async (req, res) => {
  try {
    const response = await update(req);
    res.status(response.status).json(response);
  } catch (er) {
    res.status(er.status).json(er);
  }
};

const companiesAndPolices = async (req, res) => {
  try {
    const response = await allCompanyAndPolicy(req);
    res.status(response.status).json(response);
  } catch (er) {
    res.status(er.status).json(er);
  }
};

const assignPolicy = async (req, res) => {
  try {
    const response = await assign(req);
    res.status(response.status).json(response);
  } catch (er) {
    res.status(er.status).json(er);
  }
};

const checkToken = async (req, res) => {
  try {
    const response = await tokenCheck(req);
    res.status(response.status).json(response);
  } catch (er) {
    res.status(er.status).json(er);
  }
};

const softDelete = async (req, res) => {
  try {
    const response = await deleteContact(req);
    res.status(response.status).json(response);
  } catch (er) {
    res.status(er.status).json(er);
  }
};

const payment = async (req, res) => {
  try {
    const response = await policyPurchase(req);
    res.status(response.status).json(response);
  } catch (er) {
    res.status(er.status).json(er);
  }
};

const getContactPolicy = async (req, res) => {
  try {
    const response = await contactPolicy(req);
    res.status(response.status).json(response);
  } catch (er) {
    res.status(er.status).json(er);
  }
};

export {
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
};
