require('dotenv').config()                       //to get access of environment variable

const express = require('express')
const app = express()
//const schema = require('./schema')

const routes = require('./routes');              //getting the routes

app.use(express.json());                        // Middleware for parsing JSON

app.use('/', routes);

const PORT = process.env.PORT || 5000;           //local port to run the server on
app.listen(PORT, () => console.log(`Server Started!! on http://localhost:${PORT}`))

