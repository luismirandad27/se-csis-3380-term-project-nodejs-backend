/**
 * purchaseOrder.controller.js
 * Javascript file that includes the main actions for purchase Orders.
 *
 *
 * @version 1.0
 * @author  ???
 * @updated 2024-03-12
 *
*/

const db = require("../models");
const PurchaseOrder = db.purchaseOrder;

// Function to generate the Stripe payment intent
exports.savePurchaseOrder = async (req, res) => {
    
    const order = req.body;
    
    try {

        const newOrder = new PurchaseOrder({
            user: order.user,
            items: order.items,
            sessionId: order.sessionId,
            orderStatus: order.status,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
        });
        
        
        const savedOrder = await newOrder.save();
        
        res.status(200).json(savedOrder);

    } catch (err) {
        console.error("Error generating payment intent:", err);
        res.status(500).send({ message: err });
    }
};
