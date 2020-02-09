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
    console.log(token, ['token'], isAdmin)

    if(!isAdmin.role === "admin") {
        return res.status(501).json({ "code" : 501, message : "You are not Admin"})
    }

    let query = await User.find({ "role" : "user"});
    let model = {
        countUser : query.length,
        countPrice : query.price
    }
    let result = res.json({"message" : "Success Get All User" , "code" : 200, "data" : query, "nextPage" : nextPage, "previousPage" : previousPage })
    
    return result
}
