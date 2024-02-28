import {
  verify,
  signinAdmin,
  logoutUser,
  registerUser,
  signinAgent,
  verifyLink
} from "../models/authModel.mjs";

const loginAdmin = async (req, res) => {
  try {
    const response = await signinAdmin(req);
    res.status(200).json(response);
  } catch (error) {
    res.status(error.status).json(error);
  }
};

const logout = async (req, res) => {
  try {
    const response = await logoutUser(req);
    res.status(200).json(response);
  } catch (error) {
    res.status(error.status).json(error);
  }
};

const register = async (req, res) => {
  try {
    const response = await registerUser(req);
    res.status(201).json(response);
  } catch (error) {
    res.status(error.status).json(error);
  }
};

const loginAgent = async (req, res) => {
  try {
    const response = await signinAgent(req);
    res.status(200).json(response);
  } catch (error) {
    res.status(error.status).json(error);
  }
};

const verifyAccount = async (req, res) => {
  try {
    const response = await verify(req);
    res.status(200).json(response);
  } catch (error) {
    res.status(error.status).json(error);
  }
};

const linkVerification = async (req, res) => {
  try {
    const response = await verifyLink(req);
    res.status(200).json(response);
  } catch (error) {
    res.status(error.status).json(error);
  }
};

export {
  register,
  loginAdmin,
  logout,
  loginAgent,
  verifyAccount,
  linkVerification,
};
