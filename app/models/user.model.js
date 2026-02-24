const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: {
        type: String,
        enum: ["admin", "manager", "sales"],
        default: "sales"
    },
    isActive: Boolean,
    }, {timestamps: true})

const User = mongoose.model('User', userSchema)

module.exports = User