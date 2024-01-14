const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

    phone: {
        type: String,
        required: true,
        unique: true
    },

    isPhoneVerified: {
        type: Boolean,
        default: false,
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },

    isEmailVerified: {
        type: Boolean,
        default: false,
    },

    password: {
        type: String, 
        required: true,
    },

    addresses: {
        type: Array,
    },

    bookings: {
        type: Array,
    },

})

module.exports = mongoose.model("User", UserSchema);