/**
 * auth.routes.js
 * Javascript file with the API endpoints for User administration
 *
 *
 * @version 1.0
 * @author  Luis Miguel Miranda - Andrea Olivares
 * @updated 2024-02-29
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
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.getUsers
  );

  //GET user by ID
  app.get(
    "/api/users/:userId",
    [authJwt.verifyToken],
    controller.getUserById
  );

  //Inactivate user
  app.put("/api/inactivate/:userId", 
  [authJwt.verifyToken, authJwt.isAdmin],
  controller.inactivateUser)
 
  //Change Password
  app.put("/api/changePassword/:userId",
  [authJwt.verifyToken],
  controller.changePassword);

  //Update User
  app.put("/api/update/:userId",
  [authJwt.verifyToken, authJwt.isAdmin],
  controller.updateUser);

  //Add Review
  app.put("/api/add-user-review",
  [authJwt.verifyToken],
  controller.addUserReview);

  //Delete User Review
  app.put("/api/deleteReview/:userId",
  [authJwt.verifyToken],
  controller.deleteUserReview)

  //Get User Review
  app.get("/api/getUserReview/:userId/:reviewId",
  [authJwt.verifyToken],
  controller.getUserReview)

  //Post Password Request Reset
  app.post("/api/request-reset-password",
  controller.requestPasswordReset)
};