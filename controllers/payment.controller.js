/**
 * payment.controller.js
 * Javascript file that includes the main actions for payments.
 *
 *
 * @version 1.0
 * @author  Luis Miguel Miranda
 * @updated 2024-02-02
 *
*/

const db = require("../models");
const ShoppingCart = db.shoppingCart;
const User  = db.user;

// Function to generate the Stripe payment intent
exports.generateStripeCheckout = async (req, res) => {
    
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    const { items, userId } = req.body;

    try {
        
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send('User not found');
        }

        const lineItems = items.map(item => {
            return {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.product.name + " (" + item.grind_type.name + ") " + item.product_subtype.name
                    },
                    unit_amount: parseInt(item.unit_price * 100),
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
            metadata: {
                user_id: userId,
                user_email: user.email
            },
            automatic_tax: {
                enabled: true,
            }
        });

        res.json({ stripe_session_id: session.id });

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
    
    const { userId, sessionId} = req.body;
    
    try {
        
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).send('User not found');
        }
        
        user.shopping_cart.updated_at = Date.now();
        user.shopping_cart.stripe_session_id = sessionId;

        await user.save();

        res.status(200).json(user);

    } catch (error) {
        
        console.error(error);
        res.status(500).send('Error adding sessionId to shopping cart');

    }
}