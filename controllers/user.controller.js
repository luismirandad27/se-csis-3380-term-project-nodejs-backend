/**
 * user.controller.js
 * Javascript file that includes the main actions for users.
 *
 *
 * @version 1.0
 * @author  Luis Miguel Miranda - Andrea Olivares
 * @updated 2024-03-29
 *
*/
var bcrypt = require("bcryptjs");
const db = require("../models");
const mongoose = require("mongoose");
const User = db.user;
const Role = db.role;
const Product = db.product;
const temporalPassword = '12345678';

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
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).send({ message: "User not found." });
        }

        const update = user.deletedAt ? { deletedAt: null } : { deletedAt: new Date() };

        const updatedDocument = await User.findByIdAndUpdate(req.params.userId, update, { new: true });

        if (!updatedDocument) {
            return res.status(404).send({ message: "User not found." });
        }
        
        res.send({ message: "User account inactivated." });
    } catch (error) {
        console.error('Error soft-deleting user:', error);
        res.status(500).send({ message: error.message });
    }
};


// Change Password
exports.changePassword = async(req, res)=>{
    User.findByIdAndUpdate(req.params.userId,{password:  bcrypt.hashSync(req.body.password, 8), required_change_password: false } )
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
        const user = await User.findById(userId)
        .populate("roles"); 

        if (!user) {
            return res.status(404).send({ message: "User not found" }); 
        }

        res.json(user);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
}

// Update user information
exports.updateUser = async(req, res) =>{
    //Get user ID from URL
    const userId = req.params.userId;

    //Verify fields are complete
    if(!(req.body.username && req.body.email && req.body.address && req.body.phone && req.body.roles && req.body.company )){
            return res.status(400).send({message: "Missing information!"});
        }

    //Get ID for each role
    let roles = await Promise.all((req.body.roles).map(roleName => Role.findOne({ name: roleName })));
    const foundRoles = roles.filter(role => role != null);
    if (foundRoles.length !== (req.body.roles).length) {
        return res.status(500).send({ message: "One or more roles not found." });
    }

    roles = foundRoles.map(role => role._id);

    //Get  the user from database
    const user = await User.findById(userId);
    if(!user){
        return res.status(404).send({ message: "User not found." });
    }
 
    //Change user fields
    user.username = req.body.username;
    user. email = req.body.email;
    user.address =  req.body.address;
    user.phone = req.body.phone;
    user.roles = roles;
    user.company = req.body.company;

    //Update user
    try {
        const updatedUser = await user.save(); 
        res.send(updatedUser); 
    } catch (err) {
        res.status(500).send({ message: "User could not be updated: " + err.message });
    }

}

// Function to add a user review to a product
exports.addUserReview = async (req, res) => {
    const { userId, productId, productSubtypeId, title, comment, rating, orderId, itemId } = req.body;
    try {

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        const newReview = {
            user: userId,
            title: title,
            comment: comment,
            rating: rating,
            order_id: orderId,
            order_item_id: itemId
        };

        // Look for the product
        const product = await db.product.findById(productId);

        if (!product) {
            return res.status(404).send({ message: "Product not found" });
        }

        // Look for the subproduct in the product
        const itemIndex = product.product_subtypes.findIndex(item => item._id.toString() === productSubtypeId);
        
        // Validate if the user has already added a review to the selected product
        if (!product.product_subtypes[itemIndex].reviews) {
            product.product_subtypes[itemIndex].reviews = [];
        }
        else{
            
            const userReview = product.product_subtypes[itemIndex].reviews.filter(review => review.order_id.toString() == orderId && review.order_item_id.toString() == itemId);

            if (userReview.length > 0) {
                return res.status(400).send({ message: "User has already added a review to this product" });
            }
            
        }

        product.product_subtypes[itemIndex].reviews.push(newReview);

        const updatedProduct = await product.save();

        const createdReview = updatedProduct.product_subtypes[itemIndex].reviews[updatedProduct.product_subtypes[itemIndex].reviews.length - 1];

        // Get all the orders where one of the items is at least containing the productId.
        // This means we are rating the product not the order.
        const orderIndex = user.purchase_orders.findIndex(order => order._id.toString() === orderId);
        
        if (orderIndex === -1) {
            return res.status(404).send({ message: "Order not found" });
        }

        const itemOrderIndex = user.purchase_orders[orderIndex].items.findIndex(item => item._id.toString() === itemId);

        if (itemOrderIndex === -1) {
            return res.status(404).send({ message: "Order item not found" });
        }

        user.purchase_orders[orderIndex].items[itemOrderIndex].product_rated = true;
        user.purchase_orders[orderIndex].items[itemOrderIndex].review_id = createdReview._id;
        
        
        await user.save();

        res.status(200).send(product);

    } catch (err) {
        res.status(500).send({ message: err.message });
    }

}

//Delete a Review
exports.deleteUserReview = async(req, res)=>{
    const userId = req.params.userId; 
    const { productId,productSubtypeId,orderId,orderItemId} = req.body; 
    
    try {
        const product = await Product.findById(productId);
        
        if(!product){
           return res.status(404).send({ message: 'Product not found' });
        }

        const subproductIndex = product.product_subtypes.findIndex(subproduct => subproduct._id.toString() === productSubtypeId);

        if (subproductIndex === -1) {
            return res.status(404).send({ message: 'Subproduct not found' });
        }

        const reviewIndex = product.product_subtypes[subproductIndex].reviews.findIndex(review => review.user._id.toString() === userId && review.order_id.toString() === orderId && review.order_item_id.toString() === orderItemId);

        if (reviewIndex === -1) {
            return res.status(404).send({ message: 'Review not found' });
        }

        product.product_subtypes[subproductIndex].reviews.splice(reviewIndex, 1);

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        const orderIndex = user.purchase_orders.findIndex(order => order._id.toString() === orderId);

        if (orderIndex === -1) {
            return res.status(404).send({ message: 'Order not found' });
        }

        const itemOrderIndex = user.purchase_orders[orderIndex].items.findIndex(item => item._id.toString() === orderItemId);

        if (itemOrderIndex === -1) {
            return res.status(404).send({ message: 'Order item not found' });
        }

        user.purchase_orders[orderIndex].items[itemOrderIndex].product_rated = false;
        user.purchase_orders[orderIndex].items[itemOrderIndex].review_id = null;
 
        await product.save();
        await user.save();

        res.status(200).send({ message: 'Review deleted successfully' });

    } catch (error) {
        res.status(500).send({ message: 'An error occurred', error: error.toString() });
    }

}

exports.getUserReview = async(req, res) => {

    const userId = req.params.userId;
    const reviewId = req.params.reviewId;

    try{
        
        const result = await Product.aggregate([
            {
              $unwind: "$product_subtypes"
            },
            {
              $unwind: "$product_subtypes.reviews"
            },
            {
              $match: {
                "product_subtypes.reviews._id": new mongoose.Types.ObjectId(reviewId)
              }
            },
            {
              $project: {
                review: "$product_subtypes.reviews"
              }
            }
          ]);
    
        if (result.length === 0) {
        throw new Error('Review not found');
        }
        
        res.status(200).send(result[0].review);

    }
    catch(err){
        res.status(500).send({ message: err.message });
    }
    


}

// Request password reset
exports.requestPasswordReset = async(req, res) => {
    const email = req.body.email;

    try {
        const user = await User
            .findOne({ email: email });
        
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        user.password = bcrypt.hashSync(temporalPassword, 8);
        user.required_change_password = true;

        await user.save();

        res.status(200).send({ message: "Password reset request sent successfully. An email has been sent with the instructions." });

    } catch (err) {
        res.status(500).send({ message: err.message });
    }
}