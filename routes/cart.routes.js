/**
 * cart.routes.js
 * Javascript file with the API endpoints for Shopping Cart administration
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
    [authJwt.verifyToken],    
    controller.createOrUpdateCart
  );

  app.get(
    "/api/cart/:userId",
    [authJwt.verifyToken],
    controller.getCartByUserId
  );

  app.delete(
    "/api/cart/:userId/:productSubtypeId",
    [authJwt.verifyToken],
    controller.removeItemFromCart
  )

  app.delete(
    "/api/cart/:cartId",
    [authJwt.verifyToken],
    controller.emptyCart
  )

};