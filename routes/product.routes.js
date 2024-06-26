/**
 * product.routes.js
 * Javascript file with the API endpoints for Product administration
 *
 *
 * @version 1.0
 * @author  Luis Miguel Miranda
 * @updated 2024-03-04
 *
*/

const { authJwt } = require("../middlewares");
const controller = require("../controllers/product.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/api/product/:id", 
    controller.getProductByProdId);

  app.get(
      "/api/products", controller.getAllProducts);

  app.get(
    "/api/countries", controller.getUniqueCountries);

  app.get(
    "/api/categories", controller.getCategories);

  app.get(
    "/api/grindTypes", controller.getGrindTypes);

  app.get(
      "/api/weights", controller.getWeights);

  app.get("/api/productList",
    [authJwt.verifyToken, authJwt.isAdmin], 
    controller.getProductList);

   app.put("/api/editProduct/:product", 
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.updateProduct);
 
};


