const db = require("../models");
const Product = db.product;

// GET product by ID
exports.getProductById = (req, res) => {
    Product.findById(req.params.id)
    .populate("product_category_id")
    .populate("grind_types")
    .populate("import_partner_id")
    .populate("product_subtype.weight")
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


// GET all products
exports.getAllProducts = (req, res) => {
    Product.find()
    .populate("product_category_id")
    .populate("import_partner_id")
    .populate("grind_types")
    .populate("product_subtype.weight")
    .then(products => {
        if (products.length === 0 ) {
            return res.status(404).send({ message: "Product List is empty." });
        }
        res.send(products);
    })
    .catch(err => {
        console.error("Error getting products:", err);
        res.status(500).send({ message: err });
    });
};

// GET products by category
exports.getProductsByCategory = (req, res) => {
    Product.find({ product_category_id: req.params.id })
    .populate("product_category_id")
    .populate("import_partner_id")
    .populate("grind_types")
    .populate("product_subtype.weight")
    .then(products => {
        if (products.length === 0 ) {
            return res.status(404).send({ message: "Product List is empty." });
        }
        res.send(products);
    })
    .catch(err => {
        console.error("Error getting products:", err);
        res.status(500).send({ message: err });
    });
};

//GET products by country
exports.getProductsByCountry = (req, res) =>{
    Product.find({ countries_origin: req.params.country })
    .populate("product_category_id")
    .populate("import_partner_id")
    .populate("grind_types")
    .populate("product_subtype.weight")
    .then(products => {
        if (products.length === 0 ) {
            return res.status(404).send({ message: "Product List is empty." });
        }
        res.send(products);
    })
    .catch(err => {
        console.error("Error getting products:", err);
        res.status(500).send({ message: err });
    })
}


//GET products by tags
exports.getProductsByTags = (req, res) => {
    const tagsArray = req.query.tags.split(','); // Splitting the 'tags' query parameter into an array

    Product.find({ tags: { $in: tagsArray } })
    .populate("product_category_id")
    .populate("import_partner_id")
    .populate("grind_types")
    .populate("product_subtype.weight")
    .then(products => {
        if (products.length === 0) {
            return res.status(404).send({ message: "Product List is empty." });
        }
        res.send(products);
    })
    .catch(err => {
        console.error("Error getting products by tags:", err);
        res.status(500).send({ message: err });
    });
};

//GET products by weight
exports.getProductsByWeight = (req, res) => {
    Product.find({ "product_subtype.weight": req.params.weight })
    .populate("product_category_id")
    .populate("import_partner_id")
    .populate("grind_types")
    .populate("product_subtype.weight")
    .then(products => {
        if (products.length === 0 ) {
            return res.status(404).send({ message: "Product List is empty." });
        }
        res.send(products);
    })
    .catch(err => {
        console.error("Error getting products:", err);
        res.status(500).send({ message: err });
    });
};

//GET product by range price
exports.getProductsByRangePrice = (req, res) => {
    Product.find({ "product_subtype.price": { $gte: req.params.min, $lte: req.params.max } })
    .populate("product_category_id")
    .populate("import_partner_id")
    .populate("grind_types")
    .populate("product_subtype.weight")
    .then(products => {
        if (products.length === 0 ) {
            return res.status(404).send({ message: "Product List is empty." });
        }
        res.send(products);
    })
    .catch(err => {
        console.error("Error getting products:", err);
        res.status(500).send({ message: err });
    });
};


//Sort products by price - Ascending
exports.sortProductsByPrice = (req, res) => {
    Product.find().sort({ "product_subtype.price": 1 })
    .populate("product_category_id")
    .populate("import_partner_id")
    .populate("grind_types")
    .populate("product_subtype.weight")
    .then(products => {
        if (products.length === 0 ) {
            return res.status(404).send({ message: "Product List is empty." });
        }
        res.send(products);
    })
    .catch(err => {
        console.error("Error getting products:", err);
        res.status(500).send({ message: err });
    });
};