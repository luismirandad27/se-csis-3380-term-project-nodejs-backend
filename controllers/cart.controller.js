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
        .findOne({prod_id : product.id})
        .populate('product_subtypes');

      if (!productInDb) {
        return res.status(404).send('Product not found');
      }

      const productInDbId = productInDb._id.toString();

      const productSubtype = productInDb.product_subtypes.find(subtype => subtype.weight.toString() === product.subtypeIdentifier);

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
        const itemIndex = cart.items.findIndex(item => item.product.toString() === productInDbId && item.grindType.toString() === product.grindType && item.productSubtype.toString() === product.subtypeIdentifier);

        if (itemIndex > -1) {

          // This means that the product has been added before
          cart.items[itemIndex].quantity += parseInt(product.quantity);

        } else {

          // Add new product to cart
          cart.items.push({
            product: productInDbId,
            productSubtype: product.subtypeIdentifier,
            grindType: product.grindType,
            quantity: parseInt(product.quantity),
            unitPrice: parseInt(product.price)
          });

        }
      } else {

        console.log('car does not exist');

        // No cart for user, create a new one
        cart = new ShoppingCart({
          user: userId,
          items: [{
            product: productInDbId,
            productSubtype: product.subtypeIdentifier,
            grindType: product.grindType,
            quantity: parseInt(product.quantity),
            unitPrice: parseInt(product.price)
          }]
        });
      }

      // Update stock of the product
      productSubtype.stock -= parseInt(product.quantity);
      await productInDb.save();
      
      // Save the cart
      await cart.save();

      res.status(200).json(cart);

    } catch (error) {
      console.error(error);
      res.status(500).send('Error creating or updating shopping cart');
    }
  };

// GET user's cart
exports.getCartByUserId = async (req, res) => {
  const { userId } = req.params;
  try {

    // Get the ShoppingCart for the user including the items
    const cart = await ShoppingCart.findOne({user: userId})
                                    .populate('items.product')
                                    .populate('items.grindType')
                                    .populate({
                                        path: 'items.productSubtype',
                                        model: 'WeightType'
                                    });

    res.status(200).json(cart);

  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving shopping cart');
  }
};

// REMOVE item from cart
exports.removeItemFromCart = async (req, res) => {
  const { userId, productSubtypeId } = req.params;
  
  try {

    // Get the ShoppingCart for the user 
    const cart = await ShoppingCart.findOne({user: userId});

    // Find the item (index) in the cart, where productSubType is the same as the one to be removed
    const itemIndexRemoved = cart.items.findIndex(item => item.productSubtype.toString() === productSubtypeId);

    // Store the quantity we are removing
    const productId = cart.items[itemIndexRemoved].product.toString();
    const quantityRemoved = parseInt(cart.items[itemIndexRemoved].quantity);

    // Remove the item
    if (itemIndexRemoved > -1) {
      cart.items.splice(itemIndexRemoved, 1);
    }
    else{
      return res.status(400).send('Item not found in cart');
    }
    
    // Then let's update the stock of the product subtype
    const selectedProduct = await Product.findById(productId);
    const productSubtypeIndex = selectedProduct.product_subtypes.findIndex(subtype => subtype.weight._id.toString() === productSubtypeId);
    selectedProduct.product_subtypes[productSubtypeIndex].stock += quantityRemoved;
    
    // If the cart is empty let's remove it
    if (cart.items.length === 0)
    {
      await ShoppingCart.findByIdAndDelete(cart._id);
      
    }else
    {
      await cart.save();
    }

    // Update the stock in the database
    await selectedProduct.save();

    res.status(200).json(cart);

  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving shopping cart');
  }

};