/**
 * cart.routes.js
 * Javascript file with the API endpoints for Product administration
 *
 *
 * @version 1.0
 * @author  Luis Miguel Miranda
 * @updated 2024-03-04
 *
*/

const { authJwt } = require("../middlewares");
const controller = require("../controllers/cart.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/cart", 
    //[authJwt.verifyToken],    
    controller.createOrUpdateCart);

};