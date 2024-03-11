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
const Product = db.product;

// GET product by ID
exports.getProductById = (req, res) => {
    Product.findById(req.params.id)
    .populate("grind_types")
    .populate("import_partner")
    .populate("product_subtypes.weight")
    .populate("product_category")
    .populate("reviews.user")
    .then(product => {
        if (!product) {
            return res.status(404).send({ message: "Product Not found." });
        }
        res.send(product);
    })
    .catch(err => {
        console.error("Error getting product:", err);
        res.status(500).send({ message: err });
    });
};

// GET product by field prod_id
exports.getProductByProdId = (req, res) => {
    // Find the product by the field prod_id
    Product.findOne({ prod_id: req.params.id })
        .populate("grind_types")
        .populate("import_partner")
        .populate("product_subtypes.weight")
        .populate("product_category")
        .populate("reviews.user")
        .then(product => {
            if (!product) {
                return res.status(404).send({ message: "Product Not found." });
            }
            res.send(product);
        })
        .catch(err => {
            console.error("Error getting product:", err);
            res.status(500).send({ message: err });
        });
};