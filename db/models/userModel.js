const mongoose = require('mongoose');

// Creating the User Schema and specifying the fields
const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please enter an email'],
        unique: [true, 'Email already exists']
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: [6, 'Password must be at least 6 characters long'],
        unique: false
    },
});

// Create the User collection if there is no collection created already.
module.exports = mongoose.model.Users || mongoose.model('Users', UserSchema);