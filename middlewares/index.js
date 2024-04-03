/**
 * index.js
 * Index file that compiles all javascripts files in the /Middleware folder
 *
 *
 * @version 1.0
 * @author  Luis Miguel Miranda
 * @updated 2024-03-02
 *
*/

const authJwt = require("./authJwt");
const verifySignUp = require("./verifySignUp");

module.exports = {
  authJwt,
  verifySignUp
};