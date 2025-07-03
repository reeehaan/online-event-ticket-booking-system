require('dotenv').config();

const mongoose = require("mongoose");
const uri = process.env.MONGODB_URI;
try {
    mongoose.connect(uri);
} catch (e) {
    console.log(e);
}
