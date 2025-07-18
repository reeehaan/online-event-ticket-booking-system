require('dotenv').config();
const jwt = require("jsonwebtoken");
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
require("./Database/mongodb.js");

const user = require("./Routes/user-route");
const organizer = require("./Routes/organizer-route.js");
const attendee = require("./Routes/attendee-route.js")
//body-parser
// app.use(express.json());

app.use(express.json({ 
    limit: '50mb' 
}));
//app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.urlencoded({ 
    limit: '50mb', 
    extended: true 
}));
app.use(cors());
//user
app.use('/api/user',user);
//organizer
app.use('/api/org',organizer);

app.use('/api/attendee',attendee);



const port = process.env.PORT || 3000;
const server = app.listen(port, () =>
    console.log(`Server started on port ${port}`) 
);