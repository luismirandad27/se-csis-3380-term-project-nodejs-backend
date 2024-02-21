const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../db/models/userModel'); // Adjust the path as per your project structure
const jwt = require("jsonwebtoken");

// Register Endpoint
router.post("/register", (request, response) => {
    // Hash the password received
    bcrypt.hash(request.body.password, 10)
    .then((hashedPassword) => {
        const user = new User({
            email: request.body.email,
            password: hashedPassword
        });
        // Save the user to the database
        user.save().then((result) => {
            response.status(201).send({
                message: "User created successfully",
                user: result
            });
        });
    })
    .catch((err) => {
        response.status(500).send({
            message: "Password was not hashed successfully",
            error: err
        });
    });
});

// Login Endpoint
router.post("/login", (request, response) => {
    // Find the user in the database
    User.findOne({ email: request.body.email })
        .then((user) => {
            // Compare the password
            bcrypt.compare(request.body.password, user.password)
                .then((passwordCheck) => {
                    // if it's not correct, return bad status
                    if(!passwordCheck){
                        return response.status(400).send({
                            message:"Password does not match",
                            error
                        })
                    }
                    
                    //otherwise, provide a JWT token to the user
                    const token = jwt.sign(
                        {
                            userId: user._id,
                            userEmail: user.email
                        },
                        "RANDOM-TOKEN",
                        {expiresIn: "24h"}
                    )

                    // return the token in the response
                    response.status(200).send({
                        message: "Login Successful",
                        email: user.email,
                        token,
                    })
                })
                .catch((e) => {
                    response.status(400).send({
                        message: "Password is incorrect. Please try again",
                        error: e
                    });
                });
        })
        .catch((e) => {
            response.status(404).send({
                message: "User not found",
                error: e
            });
        })
});

module.exports = router;
