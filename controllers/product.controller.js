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
const ProductCategory = db.productCategory;
const WeightType = db.weightType;
const GrindType = db.grindType;

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

// GET all products
exports.getProducts = (req, res) => {
    Product.find()
    .populate("product_category")
    .populate("import_partner")
    .populate("grind_types")
    .populate("product_subtypes.weight")
    .populate("reviews.user")
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

// GET products with Filters
exports.getAllProducts2 = async (req, res) => {
    const query = req.query;
    let filter = {};

   // Filtering by Category
   if (query.category) {
        const categoryNames = query.category.split(','); // Split the category string into an array of category names
        const categoryObjectIds = await ProductCategory.find({ 
            name: { $in: categoryNames }
        }).select('_id');  //This returns an array of Objects:documents in the ProductCategory collection where the name field matches any of the strings in the categoryNames array and returns only the _id property

        filter.product_category = { $in: categoryObjectIds.map(cat => cat._id) };//From each object we extract the _id 
        //The product_category must match any of the ids extracted from the categoryObjectIds array
    }

    // Filtering by weight
    if (query.weight) {
        const weightValue = query.weight;
        const weightObjectIds = await WeightType.find({
            name: weightValue
        }).select('_id');
        filter["product_subtypes.weight"] = weightObjectIds;
    }

    //Filtering by price range
    if (query.min){
        filter["product_subtypes.price"] = { $gte: query.min };
    }

    if(query.max) {
        filter["product_subtypes.price"] = { $lte: query.max };
    }

    //Filtering by country
    if (query.country) {
        filter.countries_origin = query.country;
    }

    //Filtering by grind
    if (query.grind) {
        const grindNames = query.grind.split(',');
        const grindObjectIds = await GrindType.find({
            name: { $in: grindNames }
        }).select('_id');
        filter.grind_types = { $in: grindObjectIds.map(grind => grind._id) };
    }
        
    Product.find(filter)
    .populate("product_category")
    .populate("import_partner")
    .populate("grind_types")
    .populate("product_subtypes.weight")
    .populate("reviews.user")
    .then(products => {
        res.send(products);
    })
    .catch(err => {
        console.error("Error getting products:", err);
        res.status(500).send({ message: err });
    });
};


//Get unique countries of origin from Product
exports.getUniqueCountries = (req, res) => {
    Product.distinct("countries_origin")
    .then(countries => {
        if (countries.length === 0 ) {
            return res.status(404).send({ message: "No countries found." });
        }
        res.send(countries);
    })
    .catch(err => {
        console.error("Error getting countries:", err);
        res.status(500).send({ message: err });
    });
};


//Get all producst with filters & stock > 0
exports.getAllProducts = async (req, res) => {
    try {
        const query = req.query;

        // Category Filter
        let categoryFilter = {};
        if (query.category) {
            const categoryNames = query.category.split(',');
            const categories = await ProductCategory.find({ name: { $in: categoryNames } }, '_id');
            categoryFilter = categories.length ? { $in: categories.map(cat => cat._id) } : {};
        }

        // Grind Filter
        let grindFilter = {};
        if (query.grind) {
            const grindNames = query.grind.split(',');
            const grinds = await GrindType.find({ name: { $in: grindNames } }, '_id');
            grindFilter = grinds.length ? { $in: grinds.map(grind => grind._id) } : {};
        }

        // Weight Filter
        let weightFilter = {};
        if (query.weight) {
            const weightValue = query.weight;
            const weights = await WeightType.find({ name: weightValue }, '_id');
            weightFilter = weights.length ? { $in: weights.map(weight => weight._id) } : {};
        }

        // Conditions for filtering the main fields
        let generalCondition = {}; 
        if (query.category) {
            generalCondition.product_category = categoryFilter;
        }
        if (query.grind) {
            generalCondition.grind_types = grindFilter;
        }
        if (query.country) {
            generalCondition.countries_origin = query.country;
        }

        // Conditions for filtering product_subtypes fields
        let subtypeCondition = {}; 
        if (query.min) {
            subtypeCondition["product_subtypes.price"] = { $gte: parseFloat(query.min) }; 
        }

        if (query.max) {
            subtypeCondition["product_subtypes.price"] = { ...subtypeCondition["product_subtypes.price"], $lte: parseFloat(query.max) }; // Merge with existing conditions if any
        }

        if (query.weight) {
            subtypeCondition["product_subtypes.weight._id"] = weightFilter;
        }

        // We define the pipeline
        let pipeline = [
            { //We filter based on the main fields (product_category, grind_types, countries_origin)
                $match: generalCondition
            },
            {//We shape our data to show only result from product_subtypes that have stock > 0
                $project: {
                    product_subtypes: {
                        $filter: {
                            input: "$product_subtypes",
                            as: "subtype",
                            cond: { $gt: ["$$subtype.stock", 0] } 
                        }
                    },
                    // Include all other fields, if you dont want to include a field, set it to 0
                    name: 1,
                    prod_id: 1,
                    description: 1,
                    product_category: 1,
                    countries_origin: 1,
                    tags: 1,
                    reviews: 1,
                    farm: 1,
                    producer: 1,
                    region: 1,
                    process: 1,
                    import_partner: 1,
                    grind_types: 1,
                }
            },
            // We opulate necessary references
            {
                $lookup: {
                    from: "productcategories",
                    localField: "product_category",
                    foreignField: "_id",
                    as: "product_category"
                }
            },
            {
                $lookup: {
                    from: "grindtypes",
                    localField: "grind_types",
                    foreignField: "_id",
                    as: "grind_types"
                }
            },
            {
                $lookup: {
                    from: "importpartners",
                    localField: "import_partner",
                    foreignField: "_id",
                    as: "import_partner"
                }
            },
            //Unwind necessary arrays, resulted from the lookups. It creates a new document for each element in the array.
            { $unwind: "$product_category" },
            { $unwind: "$import_partner" },
            {//We filter the documents based on whether the product_subtypes array result from previous steps is not empty
                $match: {
                  "product_subtypes.0": { $exists: true } 
                }
            },
            //We unwind the product_subtypes array, we create a new document for each element in the array
            { $unwind: "$product_subtypes" },          
            { //We populate the weight field in product_subtypes with the corresponding data from the weighttypes collection, this is replaced by an array
                $lookup: {
                    from: "weighttypes",
                    localField: "product_subtypes.weight",
                    foreignField: "_id",
                    as: "product_subtypes.weight"
                }
            },
            { //Since we do not want an array, we replace the array with the first element of the array, since we are sure that the array will have only one element
                $addFields: {
                    "product_subtypes.weight": {
                        $arrayElemAt: ["$product_subtypes.weight", 0] 
                    }
                }
            },
            {// Given that we have unwound the product_subtypes array, we filter the each document based on the conditions for product_subtypes
                $match: subtypeCondition            
                
            },
            {// We group the documents back together, using the _id as the grouping key
                $group: {
                    _id: "$_id", // Use the original document's _id as the grouping key
                    name: { $first: "$name" }, // Take the first encountered name value
                    prod_id: { $first: "$prod_id" }, 
                    description: { $first: "$description" }, 
                    product_category: { $first: "$product_category" }, 
                    countries_origin: { $first: "$countries_origin" }, 
                    tags: { $first: "$tags" }, 
                    reviews: { $first: "$reviews" }, 
                    farm: { $first: "$farm" },
                    producer: { $first: "$producer" },
                    region: { $first: "$region" },
                    process: { $first: "$process" },
                    import_partner: { $first: "$import_partner" }, 
                    grind_types: { $first: "$grind_types" }, 
                    product_subtypes: { $push: "$product_subtypes" }, // Reconstruct the product_subtypes array
                   
                }
            }
        ];

        // Execute the pipeline
        const products = await Product.aggregate(pipeline);
        res.send(products);
    } catch (err) {
        console.error("Error getting products:", err);
        res.status(500).send({ message: err });
    }
};