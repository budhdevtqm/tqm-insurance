import model from "../models/userModel";

export const login = async (req, res) => {
  try {
    const response = await model.loginUser(req.body);
    res.status(response.status).json(response);
  } catch (error) {
    res.status(error.status).json(error);
  }
};
