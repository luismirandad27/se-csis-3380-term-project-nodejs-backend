const express = require("express");
const cors = require("cors");
require('dotenv').config();

const app = express();

const db = require("./models");
const Role = db.role;

// Enabling connection to MongoDB based on .env file
db.mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });


var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// List of routes by features
require('./routes/auth.routes')(app);
require('./routes/user.routes')(app);
require('./routes/product.routes')(app);
require('./routes/cart.routes')(app);
require('./routes/payment.routes')(app);
require('./routes/purchaseOrder.routes')(app);
require('./routes/inquiry.routes')(app);

// Backend port = 8080
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
