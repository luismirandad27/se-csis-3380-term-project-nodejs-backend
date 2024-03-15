/**
 * auth.routes.js
 * Javascript file with the API endpoints for User administration
 *
 *
 * @version 1.0
 * @author  Luis Miguel Miranda
 * @updated 2024-02-02
 *
*/

const { authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // GET all users
  app.get(
    "/api/users",
   // [authJwt.verifyToken, authJwt.isAdmin],
    controller.getUsers
  );

  //GET users by ID
  app.get(
    "/api/getUser/:userId",
    // [authJwt.verifyToken, authJwt.isAdmin],
    controller.getUserById
  );

  //Inactivate user
  app.put("/api/users/:userId", 
  // [authJwt.verifyToken, authJwt.isAdmin],
  controller.inactivateUser)
 
  //Change Password
  app.put("/api/changePassword/:userId",
   // [authJwt.verifyToken, authJwt.isAdmin],
  controller.changePassword);

  //
};