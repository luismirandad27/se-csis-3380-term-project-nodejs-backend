/**
 * authJwt.js
 * Javascript file with a set of functions use for authorization actions in every API request.
 *
 *
 * @version 1.0
 * @author  Luis Miguel Miranda
 * @updated 2024-03-02
 *
*/

const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;
const Role = db.role;

// Function to verify the token presented in any API request that requires authorizations
verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(token,
            config.secret,
            (err, decoded) => {
              if (err) {
                return res.status(401).send({
                  message: "Unauthorized!",
                });
              }
              req.userId = decoded.id;
              next();
            });
};

// Function that evaluates if the role used in the API request was Admin
isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
  
    const roles = await Role.find({ _id: { $in: user.roles } });
    if (!roles) {
      return res.status(500).send({ message: "Roles not found" });
    }
  
    // Check if the user has the admin role
    const isAdmin = roles.some(role => role.name === "admin");
    if (isAdmin) {
      next();
    } else {
      return res.status(403).send({ message: "Require Admin Role!" });
    }
  } catch (error) {
    console.error("Error finding user or roles:", error);
    res.status(500).send({ message: error });
  }
  
};

const authJwt = {
  verifyToken,
  isAdmin
};

module.exports = authJwt;