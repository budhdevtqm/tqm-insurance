import jwt from "jsonwebtoken";

const authAdmin = async (req, res, next) => {
  try {
    const token = req.headers["authorization"];

    if (token == null || token == undefined || token === "") {
      return res
        .status(401)
        .json({ status: 401, ok: false, message: "Invalid Token" });
    }

    const verify = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const { userEmail, userRole } = verify;

    if (userRole !== "admin") {
      return res
        .status(403)
        .json({ status: 403, ok: false, message: "Access denied" });
    }

    req.body.userEmail = userEmail;
    req.body.userRole = userRole;
    next();
  } catch (er) {
    res.status(401).json({ status: 401, ok: false, message: "Invalid Token" });
  }
};

export default authAdmin;
