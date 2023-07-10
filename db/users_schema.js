const mongoose = require("mongoose");

// Defining schema
const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    age: String,
    city: String,
    state: String,
    country: String,
    planguages: String,
})

// The string in mongoose model argument should be collection name.
module.exports = mongoose.model("users", UserSchema);