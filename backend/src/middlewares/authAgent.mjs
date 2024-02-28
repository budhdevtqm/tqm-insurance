import jwt from "jsonwebtoken";
import pool from "../../utils/db.mjs";

const authAgent = async (req, res, next) => {
  try {
    const token = req.headers["authorization"];

    if (token == null || token == undefined || token === "") {
      return res
        .status(401)
        .json({ status: 401, ok: false, message: "Invalid Token" });
    }

    const verify = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const { userEmail, userRole } = verify;

    if (userRole !== "agent") {
      return res
        .status(403)
        .json({ status: 403, ok: false, message: "Access denied" });
    }

    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
      userEmail,
    ]);

    req.body.userId = users[0].id;
    req.body.userEmail = userEmail;
    req.body.userRole = userRole;
    next();
  } catch (er) {
    res.status(401).json({ status: 401, ok: false, message: "Invalid Token" });
  }
};

export default authAgent;
