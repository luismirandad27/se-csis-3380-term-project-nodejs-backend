/**
 * product.controller.js
 * Javascript file that includes the main actions for products.
 *
 *
 * @version 1.0
 * @author  ???
 * @updated 2024-02-02
 *
*/

const db = require("../models");
const ShoppingCart = db.shoppingCart;

// Function to generate the Stripe payment intent
exports.generateStripeCheckout = async (req, res) => {
    
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    const { items } = req.body;

    try {
        
        const lineItems = items.map(item => {
            return {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.product.name + " (" + item.grindType.name + ") " + item.productSubtype.name
                    },
                    unit_amount: item.unitPrice,
                },
                quantity: item.quantity,
            };
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/checkout-success`,
            cancel_url: `${process.env.FRONTEND_URL}/checkout-cancel`,
        });

        res.json({ sessionId: session.id });

    } catch (err) {
        console.error("Error generating payment intent:", err);
        res.status(500).send({ message: err });
    }
};

exports.fetchStripeSession = async (req, res) => {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    const { sessionId } = req.params;

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        res.json(session);
    } catch (err) {
        console.error("Error fetching payment intent:", err);
        res.status(500).send({ message: err });
    }
}

exports.addSessionIdShoppingCart = async (req, res) => {
    
    const { sessionId} = req.body;
    const { cartId } = req.params;
    
    try {
        
        const cart = await ShoppingCart.findOneAndUpdate(
            { _id: cartId },
            { sessionId: sessionId },
            { new: true }
        );

        cart.updatedAt = Date.now();
        await cart.save();

        res.status(200).json(cart);

    } catch (error) {
        
        console.error(error);
        res.status(500).send('Error adding sessionId to shopping cart');

    }
}