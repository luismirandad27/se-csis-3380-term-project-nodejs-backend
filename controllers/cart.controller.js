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
    
    // Validate if the user or the product are added in the request
    if (!userId || !product) {
      return res.status(400).send('Missing userId or product information');
    }
  
    try {
      
      // Validate if the product exists and has stock
      const productInDb = await Product
        .findById(product.id)
        .populate('product_subtype');

      if (!productInDb) {
        return res.status(404).send('Product not found');
      }

      const productSubtype = productInDb.product_subtype.find(subtype => subtype.weight.toString() === product.subtypeIdentifier);

      if (!productSubtype) {
        return res.status(404).send('Product subtype not found');
      }

      if (productSubtype.stock < parseInt(product.quantity)) {
        return res.status(400).send('Not enough stock');
      }

      // Finding the user's cart, if it exists
      let cart = await ShoppingCart.findOne({ user: userId });
  
      if (cart) {

        // User already has a cart, update it, retrieve the index of the product in the cart
        const itemIndex = cart.items.findIndex(item => item.product.toString() === product.id && item.grindType.toString() === product.grindType && item.productSubtype.toString() === product.subtypeIdentifier);

        if (itemIndex > -1) {

          // This means that the product has been added before
          cart.items[itemIndex].quantity += product.quantity;

        } else {

          // Add new product to cart
          cart.items.push({
            product: product.id,
            productSubtype: product.subtypeIdentifier,
            grindType: product.grindType,
            quantity: product.quantity
          });

        }
      } else {

        console.log('car does not exist');

        // No cart for user, create a new one
        cart = new ShoppingCart({
          user: userId,
          items: [{
            product: product.id,
            productSubtype: product.subtypeIdentifier,
            grindType: product.grindType,
            quantity: product.quantity
          }]
        });
      }

      // Update stock of the product
      productSubtype.stock -= product.quantity;
      await productInDb.save();
      
      // Save the cart
      await cart.save();

      res.status(200).json(cart);

    } catch (error) {
      console.error(error);
      res.status(500).send('Error creating or updating shopping cart');
    }
  };