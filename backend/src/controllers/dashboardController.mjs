import { adminAnalytics, agentAnalytics } from "../models/dashboardModel.mjs";

const adminIndex = async (req, res) => {
  try {
    const response = await adminAnalytics(req);
    res.status(response.status).json(response);
  } catch (er) {
    res.status(er.status).json(er);
  }
};

const agentIndex = async (req, res) => {
  try {
    const response = await agentAnalytics(req);
    res.status(response.status).json(response);
  } catch (er) {
    res.status(er.status).json(er);
  }
};

export { adminIndex, agentIndex };
