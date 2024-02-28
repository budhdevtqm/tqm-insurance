import {
  invite,
  status,
  register,
  allAgents,
  toggler,
  deleteOne,
  allPending,
} from "../models/agentModels.mjs";

const signup = async (req, res) => {
  try {
    const response = await register(req);
    res.status(201).json(response);
  } catch (error) {
    res.status(error.status).json(error);
  }
};

const invitation = async (req, res) => {
  try {
    const response = await invite(req);
    res.status(201).json(response);
  } catch (error) {
    res.status(error.status).json(error);
  }
};

const getAll = async (req, res) => {
  try {
    const response = await allAgents(req);
    res.status(200).json(response);
  } catch (error) {
    res.status(error.status).json(error);
  }
};

const getPending = async (req, res) => {
  try {
    const response = await allPending();
    res.status(200).json(response);
  } catch (error) {
    res.status(error.status).json(error);
  }
};

const updateStatus = async (req, res) => {
  try {
    const response = await status(req);
    res.status(200).json(response);
  } catch (error) {
    res.status(error.status).json(error);
  }
};

const deleteAgent = async (req, res) => {
  try {
    const response = await deleteOne(req);
    res.status(200).json(response);
  } catch (error) {
    res.status(error.status).json(error);
  }
};

const toggle = async (req, res) => {
  try {
    const response = await toggler(req);
    res.status(200).json(response);
  } catch (error) {
    res.status(error.status).json(error);
  }
};

export {
  signup,
  getAll,
  updateStatus,
  deleteAgent,
  getPending,
  invitation,
  toggle,
};
