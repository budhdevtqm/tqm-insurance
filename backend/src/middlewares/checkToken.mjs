import jwt from "jsonwebtoken";

const verifyToken = async (req, res, next) => {
  try {
    const token = req.params.token;
    const verify = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const { userEmail } = verify;

    req.body.userEmail = userEmail;
    next();
  } catch (er) {
    res.status(401).json({ status: 401, ok: false, message: "Link expired" });
  }
};

export default verifyToken;
