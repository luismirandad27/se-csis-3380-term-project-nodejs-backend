/**
 * product.controller.js
 * Javascript file that includes the main actions for products.
 *
 *
 * @version 1.0
 * @author  Andrea Olivares
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
    .populate("product_subtypes.reviews.user")
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
        .populate("product_subtypes.reviews.user")
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

// GET products List
exports.getProductList = async (req, res) => {
    const query = req.query;
    let filter = {};
    const page = parseInt(query.page) || 1;
    const pageSize = 5;

    // Filtering by prod_id
    if (query.id) {
        filter.prod_id = {$regex: '.*' + query.id + '.*', $options: 'i'}; // Case insensitive
    }

    try {
        // Use countDocuments to get the total count based on the filter
        const totalCount = await Product.countDocuments(filter);

        // Calculate total pages
        const totalPages = Math.ceil(totalCount / pageSize);

        // Fetch paginated products with all necessary populations
        const products = await Product.find(filter)
            .populate("product_category")
            .populate("import_partner")
            .populate("grind_types")
            .populate("product_subtypes.weight")
            .populate("reviews.user")
            .skip((page - 1) * pageSize)
            .limit(pageSize);

        // Send the response with total pages, current page, and the paginated products
        res.json({
            totalPages,
            page,
            products,
        });
    } catch (err) {
        console.error("Error getting products:", err);
        res.status(500).send({ message: err });
    }
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

// Get categories
exports.getCategories = (req, res) => {
    ProductCategory.find()
    .then(categories => {
        if (categories.length === 0 ) {
            return res.status(404).send({ message: "No categories found." });
        }
        res.send(categories.map(cat => cat.name));
    })
    .catch(err => {
        console.error("Error getting categories:", err);
        res.status(500).send({ message: err });
    });

}

// Get grind types
exports.getGrindTypes = (req, res) => {
    GrindType.find()
    .then(grinds => {
        if (grinds.length === 0 ) {
            return res.status(404).send({ message: "No grind types found." });
        }
        res.send(grinds.map(grind => grind.name));
    })
    .catch(err => {
        console.error("Error getting grind types:", err);
        res.status(500).send({ message: err });
    });
}

// Get weights
exports.getWeights = (req, res) => {
    WeightType.find()
    .then(weights => {
        if (weights.length === 0 ) {
            return res.status(404).send({ message: "No weights found." });
        }
        res.send(weights.map(weight => weight.name));
    });
}

const getPaginationInfo = (query) => {
    const pageSize = 9;
    const page = parseInt(query.page) || 1;
    return { pageSize, page };
};

const constructFilters = async (query) => {
    let generalCondition = {}; 
    let subtypeCondition = {};

    // Category Filter
    if (query.category) {
        const categoryNames = query.category.split(',');
        const categories = await ProductCategory.find({ name: { $in: categoryNames } }, '_id');
        if (categories.length) {
            generalCondition.product_category = { $in: categories.map(cat => cat._id) };
        }
    }
    
    // Grind Filter
    if (query.grind) {
        const grindNames = query.grind.split(',');
        const grinds = await GrindType.find({ name: { $in: grindNames } }, '_id');
        if (grinds.length) {
            generalCondition.grind_types = { $in: grinds.map(grind => grind._id) };
        }
    }

    // Country Filter
    if (query.country) {
        generalCondition.countries_origin = query.country;
    }

    // Weight Filter
    if (query.weight) {
        const weightValue = query.weight;
        const weights = await WeightType.find({ name: weightValue }, '_id');
        if (weights.length) {
            subtypeCondition["product_subtypes.weight._id"] = { $in: weights.map(weight => weight._id) };
        }
    }

    // Price Filter
    if (query.min) {
        subtypeCondition["product_subtypes.price"] = { $gte: parseFloat(query.min) }; 
    }

    if (query.max) {
        subtypeCondition["product_subtypes.price"] = { ...subtypeCondition["product_subtypes.price"], $lte: parseFloat(query.max) }; // Merge with existing conditions if any
    }

     // Sorting
     let sortCondition = {};
     if (!query.sort) {
         sortCondition = { "_id": 1 }; // Default sorting
     } else if (query.sort === "price-low-to-high") {
        sortCondition = {"first_subtype_price": 1};
     } else if (query.sort === "price-high-to-low") {
        sortCondition = {"first_subtype_price":-1}
     } else if (query.sort === "rating") {
         sortCondition = { "average_rating": -1 };
     } else {
         sortCondition = { "_id": 1 }; 
     }

    return { generalCondition, subtypeCondition, sortCondition};
};


const getPipeline = (generalCondition, subtypeCondition, sortCondition) => {
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
        {//We filter the documents based on whether the product_subtypes array result from previous steps is not empty
            $match: {
                "product_subtypes.0": { $exists: true } 
              }
          },           
        {// We populate necessary references
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
        //Unwind necessary arrays, It creates a new document for each element in the array.
        { $unwind: "$product_subtypes" },          
        { //We populate the weight field in product_subtypes with the corresponding data from the weighttypes collection, this is replaced by an array
            $lookup: {
                from: "weighttypes",
                localField: "product_subtypes.weight",
                foreignField: "_id",
                as: "product_subtypes.weight"
            }
        },
        { //Since we do not want arrays, we replace the array with the first element of the array, because there is only one matching element
            $addFields: {
                "product_category": {
                    $arrayElemAt: ["$product_category", 0]
                },
                "import_partner": {
                    $arrayElemAt: ["$import_partner", 0]
                },
                "product_subtypes.weight": {
                    $arrayElemAt: ["$product_subtypes.weight", 0] 
                },
                "average_rating": {
                    $cond: {
                        if: { $isArray: "$reviews" },
                        then: {
                            $avg: "$reviews.rating" 
                        },
                        else: 0
                    }
                },
            }
        },
        {// Given that we have unwound the product_subtypes array, we filter each document based on the conditions for product_subtypes
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
                average_rating: { $first: "$average_rating" },
                reviews: { $first: "$reviews" }, 
                farm: { $first: "$farm" },
                producer: { $first: "$producer" },
                region: { $first: "$region" },
                process: { $first: "$process" },
                import_partner: { $first: "$import_partner" }, 
                grind_types: { $first: "$grind_types" }, 
                product_subtypes: { $push: "$product_subtypes" }, // Reconstruct the product_subtypes array
            }
        },  
        {
            $addFields: {
                first_subtype_price: { $arrayElemAt: ["$product_subtypes.price", 0] }
            }
        },
        {//Sorting according to query.sort
            $sort: sortCondition
        }
    ];   
    return pipeline;
};



//Get all producst with filters & stock > 0
exports.getAllProducts = async (req, res) => {
    try {
        const query = req.query;
        const { pageSize, page } = getPaginationInfo(req.query); // Pagination
        const { generalCondition, subtypeCondition, sortCondition } = await constructFilters(query); // Filters
        const basePipeline = getPipeline(generalCondition, subtypeCondition, sortCondition); // Pipeline

        // Count pipeline: we count the documents that match the filters
        const countPipeline = [...basePipeline, { $count: "totalCount" }];  
        const totalDocuments = await Product.aggregate(countPipeline);
        const totalCount = totalDocuments.length > 0 ? totalDocuments[0].totalCount : 0;
        
        // Main pipeline: we get the documents that match the filters and apply pagination
        const mainPipeline = [ ...basePipeline, { $skip: (page - 1) * pageSize }, { $limit: pageSize } ];
        const paginatedProducts = await Product.aggregate(mainPipeline);
 
        //console.log(paginatedProducts);
        res.json({
            totalPages: Math.ceil(totalCount / pageSize),
            page,
            products: paginatedProducts,
            totalCount
        });
    } catch (err) {
        console.error("Error getting products:", err);
        res.status(500).send({ message: err });
    }
};


//Update product stock and price
exports.updateProduct = async (req, res) => {
    const {  product, indexSubtype } = req.body;//userId
    try {
        const productInDb = await Product
            .findById(product._id)
            
        if (!productInDb) {
            return res.status(404).send('Product not found');
        }

        // Check if the user is an admin 

        //We update the stock and of the product subtype
        productInDb.product_subtypes[indexSubtype].stock = product.product_subtypes[indexSubtype].stock;
        productInDb.product_subtypes[indexSubtype].price = product.product_subtypes[indexSubtype].price;
        await productInDb.save();
        res.status(200).json(productInDb);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating product');
    }
};