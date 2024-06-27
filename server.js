require('dotenv').config()                       //to get access of environment variable

const express = require('express')
const app = express()
//const schema = require('./schema')
const mongoose = require('mongoose')
const connect = mongoose.connect(process.env.DATABASE_URL)     //to connect with database

connect.then(() => {
    console.log("Database connected successfully!");         //database connection msg
}).catch((error) => {
    console.log("Database cannot be connected!");            //error in connecting msg
    console.log(error);
})

const routes = require('./routes');              //getting the routes

app.use(express.json());                        // Middleware for parsing JSON

app.use('/', routes);

const PORT = process.env.PORT || 5000;           //local port to run the server on
app.listen(PORT, () => console.log(`Server Started!! on http://localhost:${PORT}`))

