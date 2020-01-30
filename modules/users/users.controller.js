const express = require('express');
const router = express.Router();
const userService = require('./users.service');
const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../../helpers/db');
const User = db.User;

// routes
router.post('/admin/register', registerAdmin);
router.post('/login', authenticate);
router.post('/register', create);
router.get('/all', getAll);
router.get('/search', searchQuery)
router.get('/current', getCurrent);
router.get('/', getById);
router.put('/update', update);
router.delete('/delete', _delete);

module.exports = router;
async function registerAdmin(req, res) {
    let model = {
        fullname : "UUD GANS",
        username : "uudgansbgt",
        email : "uud123@gymku.com",
        phone : "088983210303",
        password : bcrypt.hashSync("UUDGANS", 10),
        role : "admin"
    }

    const user = new User(model)
    let query = await user.save();
    let result = res.json({"message" : "Success Register Admin" , "code" : 200, "data" : query})
    return result
}

async function create(req,res) {
    let model = {
        username : req.body.username,
        fullname : req.body.fullname,
        email : req.body.email,
        phone : req.body.phone,
        gender : req.body.gender,
        address : req.body.address,
        password : bcrypt.hashSync(req.body.password, 10),
        gym_class : {
            title : req.body.gym_class.title,
            type : req.body.gym_class.type,
            trainer_name : req.body.gym_class.trainer_name,
            time_type : req.body.gym_class.time_type,
            start_time : req.body.gym_class.start_time,
            end_time : req.body.gym_class.end_time,
        },
        isTaken : true,
        isActive : true,
        role : "user"
    }
    let checkEmail = await User.findOne({ "email" : model.email });
    let checkUsername = await User.findOne({ "username" : model.username });
    if (checkEmail) {
        return res.status(501).json({ "code" : 501, message : "Email is already taken"})
    }

    if(checkUsername) {
        return res.status(501).json({ "code" : 501, message : "Username is already taken"})
    }
    console.log(model)
    const user = new User(model)
   
    let query = await user.save();
    let result = res.json({"message" : "Success Register User" , "code" : 200, "data" : query})
    return result
}

async function authenticate(req, res) {
    let model = {
        email : req.body.email,
        password : req.body.password
    }
    const checkEmail = await User.findOne({ "email" : model.email });
    if(!checkEmail) {
        return res.status(404).json({"message" : "email not found"})
    }

    if(checkEmail && bcrypt.compareSync(model.password, checkEmail.password)) {
        const token = jwt.sign({ sub: checkEmail.id }, config.secret);
        return res.status(200).json({ code : 200, message : "Succes Login", data: checkEmail, token: token})        
    } else {
        return res.status(500).json({ code : 500, message : "Password Incorrect" })        
    }
}

async function getAll(req, res, next) {
    let header = req.headers.authorization.split(' ')[1];
    let token = jwt.verify(header, config.secret);
    let isAdmin = await User.findOne({ "_id" : token.sub });
    console.log(token, ['token'], isAdmin)

    if(!isAdmin.role === "admin") {
        return res.status(501).json({ "code" : 501, message : "You are not Admin"})
    }
    let pageOptions = {
        page: req.query.page || 0,
        limit: req.query.limit
    }
    let url = config.server;
    let nextPage = `${url + '/api/users/all?page=' + (parseInt(pageOptions.page) + 1) + '&limit=' + pageOptions.limit}`
    let previousPage = `${url + '/api/users/all?page=' + (parseInt(pageOptions.page) - 1) + '&limit=' + pageOptions.limit}`

    if(parseInt(pageOptions.page) === 0) {
        previousPage = null;
    }

    console.log(pageOptions,['QUERY'])

    let query = await User.find({ "role" : "user"}).limit(parseInt(pageOptions.limit)).skip(parseInt(pageOptions.page) * parseInt(pageOptions.limit));
    let result = res.json({"message" : "Success Get All User" , "code" : 200, "data" : query, "nextPage" : nextPage, "previousPage" : previousPage })
    
    return result
}

function getCurrent(req, res, next) {
    userService.getById(req.user.sub)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

async function getById(req, res, next) {
    let model = {
        id : req.query.id
    }

    let query = await User.findById(model.id);
    let newModel = {
        username : query.username,
        fullname: query.fullname,
        email : query.email,
        phone : query.phone,
        gender : query.gender,
        address : query.address,
        password : bcrypt.hashSync(query.password, 10),
        gym_class : {
            title : query.gym_class.title,
            type : query.gym_class.type,
            trainer_name : query.gym_class.trainer_name,
            time_type : query.gym_class.time_type,
            start_time : query.gym_class.start_time,
            end_time : query.gym_class.end_time,
        }
    }
    let result = res.json({"message" : "Success Get User by Id" , "code" : 200, "data" : newModel })
    
    return result
}

async function update(req, res, next) {
    let id = req.query.id;
    let model = {
        username : req.body.username,
        fullname : req.body.fullname,
        email : req.body.email,
        phone : req.body.phone,
        gender : req.body.gender,
        address : req.body.address,
        password : req.body.password,
        gym_class : {
            title : req.body.title,
            type : req.body.type,
            trainer_name : req.body.trainer_name,
            time_type : req.body.time_type,
            start_time : req.body.start_time,
            end_time : req.body.end_time,
        }
    }

    // let checkUser = await User.findById(id);

    // if(!checkUser) {
    //     return res.status(404).json({ "code" : 404, message : "Users Not Found"})
    // }
    console.log(model,['UPDATE MODEL'])
    if(model.password) {
        model.password = bcrypt.hashSync(model.password, 10);
    }
    let query = User.findByIdAndUpdate(id,model,{new : true}).then( res => {
        if(!res) {
            return res.status(404).json({ "code" : 404, message : "Users Not Found"})
        }
    })
    // Object.assign(checkUser, model);
    // console.log(model)
    // let query = await checkUser.save();
    let result = res.json({"message" : "Success Update User" , "code" : 200, "data" : query})
    return result
}

async function _delete(req, res, next) {
    let id = req.query.id;
    let query = await User.findByIdAndRemove(id);

    let result = res.json({"message" : "Success Remove User" , "code" : 200, "data" : query})
    return result
}

async function searchQuery(req, res) {
    let model = {
        username : req.query.username,
        fullname : req.query.fullname,
        email : req.query.email
    }
    let query;
    if(model.email) {
        query = await User.find({ email : model.email});
    }

    if(model.fullname) {
        query = await User.find({ fullname : model.fullname});
    }

    if(model.username) {
        query = await User.find({ username : model.username});
    }

    let result = res.json({"message" : "Success Searcg User" , "code" : 200, "data" : query})
    return result
}
