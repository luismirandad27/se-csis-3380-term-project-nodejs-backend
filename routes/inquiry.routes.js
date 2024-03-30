const { authJwt } = require("../middlewares");
const controller = require("../controllers/inquiry.controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    });


    //ADD an inquiry
    app.post("/api/addInquiry", controller.createInquiry)

    //Retrieve inquiries
    app.get("/api/inquiries", 
    [authJwt.verifyToken, authJwt.isAdmin], 
    controller.getInquiries)

    //Open an inquiry
    app.put("/api/inquiry/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.openInquiry)

}