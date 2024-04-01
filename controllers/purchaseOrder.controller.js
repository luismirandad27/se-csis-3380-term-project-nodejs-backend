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
            total_taxes: order.total_taxes,
            total_purchase: order.total_purchase,
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

        const userUpdateOrder = await User
          .findById(userId)
          .populate({
            path: 'purchase_orders',
            populate: {
              path: 'items.product',
              model: 'Product',
              select: 'name product_subtypes._id product_subtypes.image_url product_subtypes.weight',
              populate: {
                path: 'product_subtypes.weight',
                model: 'WeightType'
              }
            }
          })
          .populate({
            path: 'purchase_orders',
            populate: {
              path: 'items.grind_type',
              model: 'GrindType'
            }
          });

        res.status(200).json(userUpdateOrder.purchase_orders[userUpdateOrder.purchase_orders.length - 1]);

    } catch (err) {
        console.error("Error generating order:", err);
        res.status(500).send({ message: err });
    }
};

// Function to obtain the Purchase Order based on an Id
exports.getPurchaseOrder = async(req, res) => {

    const { userId, orderId } = req.params;

    try{

        const user = await User
                          .findById(userId)
                          .populate({
                            path: 'purchase_orders',
                            populate: {
                              path: 'items.product',
                              model: 'Product',
                              select: 'name product_subtypes._id product_subtypes.image_url product_subtypes.weight',
                              populate: {
                                path: 'product_subtypes.weight',
                                model: 'WeightType'
                              }
                            }
                          })
                          .populate({
                            path: 'purchase_orders',
                            populate: {
                              path: 'items.grind_type',
                              model: 'GrindType'
                            }
                          });

        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        // Find the purchase order from the purchase_orders array where _id is equal to orderId
        const purchaseOrder = user.purchase_orders.find(order => order._id == orderId);

        if (!purchaseOrder) {
            return res.status(404).send({ message: "Purchase Order not found" });
        }

        return res.status(200).json(purchaseOrder);
    }
    catch(err){
        console.error("Error getting purchase order:", err);
        res.status(500).send({ message: err });
    }

}

// Function to get all purchase orders of a user
exports.getPurchaseOrders = async(req, res) => {
  
      const { userId } = req.params;
  
      try{
  
          const user = await User
                            .findById(userId)
                            .populate({
                              path: 'purchase_orders',
                              populate: {
                                path: 'items.product',
                                model: 'Product',
                                select: 'name product_subtypes._id product_subtypes.image_url product_subtypes.weight',
                                populate: {
                                  path: 'product_subtypes.weight',
                                  model: 'WeightType'
                                }
                              }
                            })
                            .populate({
                              path: 'purchase_orders',
                              populate: {
                                path: 'items.grind_type',
                                model: 'GrindType'
                              }
                            });
  
          if (!user) {
              return res.status(404).send({ message: "User not found" });
          }
  
          return res.status(200).json(user.purchase_orders);
      }

      catch(err){
          console.error("Error getting purchase orders:", err);
          res.status(500).send({ message: err });
      }
  
  }
