/**
 * user.controller.js
 * Javascript file that includes the main actions for users.
 *
 *
 * @version 1.0
 * @author  Luis Miguel Miranda
 * @updated 2024-02-02
 *
*/
const db = require("../models");
const User = db.user;
const Role = db.role;
var bcrypt = require("bcryptjs");

exports.allAccess = (req, res) => {
    res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
    res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
    res.status(200).send("Admin Content.");
};

//Get all users
exports.getUsers = async (req, res) => {
        const query = req.query;
        let filter = {};
        const page = parseInt(query.page) || 1;
        const pageSize = 10;

        // Filter by username
        if (query.username) {
            filter.username = {$regex: '.*' + query.username + '.*', $options: 'i'};
        }
    
    try {
        //Pagination info
        const totalUsers = await User.countDocuments(filter);
        const totalPages = Math.ceil(totalUsers / pageSize);

        const users = await User.find(filter)
            .populate("roles","name")
            .skip(pageSize * (page - 1))
            .limit(pageSize);

        res.json({
            totalPages,
            page,
            users,
        });
    } catch (err) {
        res.status(500).send({ message: err });
    }
};

// Inactivate user
exports.inactivateUser = async (req, res) => {
    User.findByIdAndUpdate(req.params.userId, {deletedAt: new Date() })
    .then(() => {
        res.send({ message: "User was inactivated successfully!" });    
    })
    .catch((error) => {
        console.error('Error soft-deleting user:', error);
        res.status(404).send({message: err.message})
    });
};

// Change Password
exports.changePassword = async(req, res)=>{
    User.findByIdAndUpdate(req.params.userId,{password:  bcrypt.hashSync(req.body.password, 8) } )
    .then(() => {
        res.send({ message: "Password succesfully changed!" });    
    })
    .catch((error) => {
        console.error('Error:', error);
        res.status(404).send({message: err.message})
    });
};

//Get user by ID
exports.getUserById = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId); 

        if (!user) {
            return res.status(404).send({ message: "User not found" }); 
        }

        res.json(user);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

