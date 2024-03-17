/**
 * user.controller.js
 * Javascript file that includes the main actions for users.
 *
 *
 * @version 1.0
 * @author  Luis Miguel Miranda - Andrea Olivares
 * @updated 2024-03-16
 *
*/
var bcrypt = require("bcryptjs");
const db = require("../models");
const User = db.user;
const Role = db.role;

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
    .then((updatedDocument) => {
        if (!updatedDocument) {
            return res.status(404).send({ message: "User not found." });
        }
        res.send({ message: "User account inactivated." });
    })
    .catch((error) => {
        console.error('Error soft-deleting user:', error);
        res.status(404).send({message: err.message})
    });
};

// Change Password
exports.changePassword = async(req, res)=>{
    User.findByIdAndUpdate(req.params.userId,{password:  bcrypt.hashSync(req.body.password, 8) } )
    .then((updatedDocument) => {
        if (!updatedDocument) {
            return res.status(404).send({ message: "User not found." });
        }
        res.send({ message: "Password successfully changed!" });
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

// Update user information
exports.updateUser = async(req, res) =>{
    //Get user ID from URL
    const userId = req.params.userId;

    //Verify fields are complete
    if(!(req.body.username && req.body.email && req.body.address && req.body.phone && req.body.gender 
        && (req.body.userRole || req.body.adminRole) && req.body.company )){
            return res.status(400).send({message: "Missing information!"});
        }

    // Get the roles 
    let rolesArray = [
        req.body.userRole ? 'user' : '',
        req.body.adminRole ? 'admin' : ''
    ];
    rolesArray = rolesArray.filter(role => role !== '');

    //Get ID for each role
    let roles = await Promise.all(rolesArray.map(roleName => Role.findOne({ name: roleName })));
    const foundRoles = roles.filter(role => role != null);
    if (foundRoles.length !== rolesArray.length) {
        return res.status(500).send({ message: "One or more roles not found." });
    }

    roles = foundRoles.map(role => role._id);

    //Get  the user from database
    const user = await User.findById(userId);
    if(!user){
        return res.status(404).send({ message: "User not found." });
    }

    //Change user fields
    user.username = req.body.username,
    user. email = req.body.email,
    user.address =  req.body.address,
    user.phone = req.body.phone,
    user.gender = req.body.gender,
    user.roles = roles,
    user.company = req.body.company

    //Add deletedAt modification
    if (req.body.active === true) {
        user.deletedAt = null; 
    } else if (req.body.active === false && !user.deletedAt) {
        user.deletedAt = new Date(); 
    }

    //Update user
    try {
        const updatedUser = await user.save(); // Save the changes
        res.send(updatedUser); // Send the updated user back in the response
    } catch (err) {
        res.status(500).send({ message: "User could not be updated: " + err.message });
    }

};

// Function to add a user review to a product
exports.addUserReview = async (req, res) => {
    const { userId, productId, title, comment, rating } = req.body;
    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        const newReview = {
            user: userId,
            title: title,
            comment: comment,
            rating: rating
        };

        const product = await db.product.findById(productId);

        if (!product) {
            return res.status(404).send({ message: "Product not found" });
        }

        // Validate if the user has already added a review to the selected product
        const userReview = product.reviews.filter(review => review.user.toString() == userId);

        if (userReview.length > 0) {
            return res.status(400).send({ message: "User has already added a review to this product" });
        }

        product.reviews.push(newReview);

        await product.save();

        res.status(200).send(product);

    } catch (err) {
        res.status(500).send({ message: err.message });
    }

}
