/**
 * cart.controller.js
 * Javascript file that includes the main actions for products.
 *
 *
 * @version 1.0
 * @author  Luis Miranda
 * @updated 2024-02-04
 *
*/

const db = require("../models");
const Product = db.product;
const ShoppingCart = db.shoppingCart;

// ADD product to cart
exports.createOrUpdateCart = async (req, res) => {
    const { userId, product } = req.body;
    
    if (!userId || !product) {
      return res.status(400).send('Missing userId or product information');
    }
  
    try {
      let cart = await ShoppingCart.findOne({ user: userId });
  
      if (cart) {
        // User already has a cart, update it
        const itemIndex = cart.items.findIndex(item => item.product.toString() === product.id);
  
        if (itemIndex > -1) {
          // Product already exists in cart, update quantity
          cart.items[itemIndex].quantity = product.quantity; // Or any other logic for quantity
        } else {
          // Add new product to cart
          cart.items.push({
            product: product.id,
            productSubtype: product.subtypeIdentifier, // Adjust according to your schema
            grindType: product.grindType, // Adjust according to your schema
            quantity: product.quantity // Or product.quantity if specified
          });
        }
      } else {
        // No cart for user, create a new one
        cart = new ShoppingCart({
          user: userId,
          items: [{
            product: product.id,
            productSubtype: product.subtypeIdentifier, // Adjust according to your schema
            grindType: product.grindType, // Adjust according to your schema
            quantity: product.quantity // Or product.quantity if specified
          }]
        });
      }
  
      await cart.save();
      res.status(200).json(cart);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error creating or updating shopping cart');
    }
  };