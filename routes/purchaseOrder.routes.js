/**
 * payment.routes.js
 * Javascript file with the API endpoints for Stripe payments
 *
 *
 * @version 1.0
 * @author  Luis Miguel Miranda
 * @updated 2024-03-11
 *
*/

const { authJwt } = require("../middlewares");
const controller = require("../controllers/purchaseOrder.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/save-purchase-order", 
    [authJwt.verifyToken],    
    controller.savePurchaseOrder
  );


};