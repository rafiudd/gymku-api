const express = require('express');
const router = express.Router();
const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../../helpers/db');
const User = db.User;

// routes
router.get('/', getAll);
module.exports = router;

async function getAll(req, res, next) {
    let header = req.headers.authorization.split(' ')[1];
    let token = jwt.verify(header, config.secret);
    let isAdmin = await User.findOne({ "_id" : token.sub });

    if(!isAdmin.role === "admin") {
        return res.status(501).json({ "code" : 501, message : "You are not Admin"})
    }

    let query = await User.find({ "role" : "user"});

    let price = query.reduce(function(previousValue, currentValue) {
        return parseInt(previousValue.price) + parseInt(currentValue.price)
    });
    
    let model = {
        countUser : query.length,
        countPrice : price
    }
    let result = res.json({"message" : "Success Get Data" , "code" : 200, "data" : model })
    
    return result
}
