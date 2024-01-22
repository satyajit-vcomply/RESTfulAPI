require('dotenv').config()          //to get access of environment variable

const mongoose = require('mongoose')
const connect = mongoose.connect(process.env.DATABASE_URL)         //to connect with database

connect.then(() => {
    console.log("Database connected successfully!");         //database connection msg
}).catch((err) => {
    console.log("Database cannot be connected!");            //error in connecting msg
    console.log(error);
})

const model = new mongoose.Schema({
    member_id: {
        type: Number,
        required: true,
        unique: true
    },
    member_name: {
        type: String, 
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    age: {
        type: Number,
    },
    country: {
        type: String,
    },
    state: {
        type: Boolean,
    }
    // organisation_id: {
    //     type: Number,
    //     required: true,
    // }
})


//Export mongoose schema
// const schema = new mongoose.model("users",modal)
const schema = mongoose.model('schema', model)
module.exports = schema