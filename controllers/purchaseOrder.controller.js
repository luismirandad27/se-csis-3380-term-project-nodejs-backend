/**
 * purchaseOrder.controller.js
 * Javascript file that includes the main actions for purchase Orders.
 *
 *
 * @version 1.0
 * @author  Luis Miguel Miranda
 * @updated 2024-03-12
 *
*/

const db = require("../models");
const User = db.user;

// Function to generate the Stripe payment intent
exports.savePurchaseOrder = async (req, res) => {
    
    
    const { order,userId } = req.body;
    
    try {

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        const newOrder = {
            user: order.user,
            items: order.items,
            stripe_session_id: order.stripe_session_id,
            order_status: order.status,
            created_at: order.created_at,
            updated_at: order.updated_at
        };

        user.purchase_orders.push(newOrder);

        await user.save();

        // Empty cart
        updatedUser = await User.findByIdAndUpdate(
            userId,
            { $unset: { shopping_cart: "" } },
            { new: true }
          );
        
        res.status(200).json(newOrder);

    } catch (err) {
        console.error("Error generating order:", err);
        res.status(500).send({ message: err });
    }
};
