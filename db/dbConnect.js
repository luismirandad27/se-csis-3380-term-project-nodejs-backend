// Import the mongoose module
const mongoose = require('mongoose');
require('dotenv').config();

async function dbConnect() {
    mongoose.connect(
        process.env.DB_URL, 
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    )
    .then(() => {
        console.log('Database connection successful');
    })
    .catch(err => {
        console.log('Unable to connect to MongoDB')
        console.error(err);
    });
}

module.exports = dbConnect;