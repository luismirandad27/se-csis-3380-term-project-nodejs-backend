/**
 * cart.controller.js
 * Javascript file that includes the main actions for shopping carts.
 *
 *
 * @version 1.0
 * @author  Luis Miguel Miranda
 * @updated 2024-02-04
 *
 */

const db = require("../models");
const mongoose = require("mongoose");
const Product = db.product;
const User = db.user;

// ADD product to cart
exports.createOrUpdateCart = async (req, res) => {

  const {
    userId,
    product
  } = req.body;

  // Validate if the user or the product are added in the request
  if (!userId || !product) {
    return res.status(400).send('Missing userId or product information');
  }

  try {

    // Search the user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({
        message: 'User not found'
      });
    }

    // Validate if the product exists and has stock
    const productInDb = await Product
      .findOne({
        prod_id: product.id
      })
      .populate('product_subtypes');

    if (!productInDb) {
      return res.status(404).send({
        message: 'Product not found'
      });
    }

    const productSubtype = productInDb.product_subtypes.find(subtype => subtype._id.toString() === product.subtypeIdentifier);

    if (!productSubtype) {
      return res.status(404).send({
        message: 'Product subtype not found'
      });
    }

    if (productSubtype.stock < parseInt(product.quantity)) {
      return res.status(400).send({
        message: 'Not enough stock'
      });
    }

    let cart = user.shopping_cart || {
      created_at: new Date(),
      sessionId: null,
      updated_at: null,
      items: []
    };

    const itemIndex = cart.items.findIndex(item => item.grind_type.toString() === product.grindType && item.product_subtype.toString() === product.subtypeIdentifier);

    if (itemIndex > -1) {

      cart.items[itemIndex].quantity += parseInt(product.quantity);
      cart.updated_at = new Date();

    } else {

      cart.items.push({
        product: productInDb._id.toString(),
        product_subtype: product.subtypeIdentifier,
        grind_type: product.grindType,
        quantity: parseInt(product.quantity),
        unit_price: product.price
      });

      cart.updated_at = new Date();

    }

    // Since the cart is embedded, we update the user's cart directly
    user.shopping_cart = cart;

    // Update stock of the product
    productSubtype.stock -= parseInt(product.quantity);
    await productInDb.save();

    // Save the cart
    await user.save();

    res.status(200).json(user);

  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating or updating shopping cart');
  }

};

// GET user's cart
exports.getCartByUserId = async (req, res) => {
  const {
    userId
  } = req.params;

  try {

    const user = await User
      .findById(userId)
      .populate({
        path: 'shopping_cart',
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
        path: 'shopping_cart',
        populate: {
          path: 'items.grind_type',
          model: 'GrindType'
        }
      });

    if (!user) {
      return res.status(404).send({
        message: 'User not found'
      });

    }

    const userObject = user.toJSON();
    
    if (userObject.shopping_cart && userObject.shopping_cart.items) {
      userObject.shopping_cart.items.forEach(item => {

        if (item.product && item.product.product_subtypes) {
          item.product.product_subtypes = item.product.product_subtypes.filter(subtype => 
            subtype._id.toString() === item.product_subtype.toString()
          );
          
        }
  
      });
    }
    else{
      userObject.shopping_cart = null;
    }

    res.status(200).json(userObject.shopping_cart);

  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving shopping cart');
  }
};

// REMOVE item from cart
exports.removeItemFromCart = async (req, res) => {

  const {
    userId,
    productSubtypeId
  } = req.params;

  try {

    // Get the user information
    const user = await User.findById(userId);

    if (!user || !user.shopping_cart || user.shopping_cart.items.length === 0) {
      return res.status(404).send('User not found or shopping cart is empty');
    }

    // Find the item (index) in the cart, where productSubType is the same as the one to be removed
    const itemIndexRemoved = user.shopping_cart.items.findIndex(item => item.product_subtype.toString() === productSubtypeId);

    // Store the quantity we are removing
    const productId = user.shopping_cart.items[itemIndexRemoved].product.toString();
    const quantityRemoved = parseInt(user.shopping_cart.items[itemIndexRemoved].quantity);

    // Remove the item
    if (itemIndexRemoved > -1) {
      user.shopping_cart.items.splice(itemIndexRemoved, 1);
    } else {
      return res.status(400).send('Item not found in cart');
    }

    // Then let's update the stock of the product subtype
    const selectedProduct = await Product.findById(productId);
    const productSubtypeIndex = selectedProduct.product_subtypes.findIndex(subtype => subtype._id.toString() === productSubtypeId);
    selectedProduct.product_subtypes[productSubtypeIndex].stock += quantityRemoved;

    let updatedUser;

    // If the cart is empty let's remove it
    if (user.shopping_cart.items.length === 0) {
      updatedUser = await User.findByIdAndUpdate(
        userId, {
          $unset: {
            shopping_cart: ""
          }
        }, {
          new: true
        }
      );

    } else {
      updatedUser = await user.save();
    }

    // Update the stock in the database
    await selectedProduct.save();

    res.status(200).json(updatedUser);

  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving shopping cart');
  }

};

// REMOVE shopping cart
exports.emptyCart = async (req, res) => {

  const {
    userId
  } = req.params;

  try {

    updatedUser = await User.findByIdAndUpdate(
      userId, {
        $unset: {
          shopping_cart: ""
        }
      }, {
        new: true
      }
    );

    res.status(200).json({
      message: 'Cart deleted'
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving shopping cart');
  }
};