/**
 * verifySignUp.js
 * Javascript file that compiles the methods to validate user's sign ups.
 *
 *
 * @version 1.0
 * @author  Luis Miguel Miranda
 * @updated 2024-03-02
 *
*/

const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;

// Function to review if a user is trying to register a new account with a username/email already registered
checkDuplicateUsernameOrEmail = async (req, res, next) => {
  try {
    // Check if username already exists
    const existingUsername = await User.findOne({ username: req.body.username });
    if (existingUsername) {
      return res.status(400).send({ message: "Failed! Username is already in use!" });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email: req.body.email });
    if (existingEmail) {
      return res.status(400).send({ message: "Failed! Email is already in use!" });
    }

    next(); // If both username and email are unique, proceed to the next middleware
  } catch (error) {
    console.error("Error checking duplicate username or email:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};

// Function to check that the role(s) added in the API request for registration are included in the database
checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        res.status(400).send({
          message: `Failed! Role ${req.body.roles[i]} does not exist!`
        });
        return;
      }
    }
  }

  next();
};

const verifySignUp = {
  checkDuplicateUsernameOrEmail,
  checkRolesExisted
};

module.exports = verifySignUp;