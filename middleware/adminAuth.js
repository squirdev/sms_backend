const jwt = require("jsonwebtoken"); // Make sure to install jsonwebtoken
const Admin = require("../models/admin");

const adminAuthMiddleware = (req, res, next) => {
  const token = req.headers.authorization; // Assuming the token is sent in the Authorization header

  if (!token) {
    return res.status(401).json({ message: "未提供令牌，授权被拒绝。" });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "令牌无效。" });
    }

    try {
      // Fetch full user details from the database
      const user = await Admin.findById(decoded.id); // Exclude password

      if (!user) {
        return res.status(401).json({ message: "用户不存在。" });
      }

      req.user = user; // Attach full user object to request
      next(); // Proceed to the next middleware or route handler
    } catch (dbError) {
      console.error("Error fetching user:", dbError);
      return res
        .status(500)
        .json({ message: "Server error while fetching user." });
    }
  });
};

module.exports = adminAuthMiddleware;
