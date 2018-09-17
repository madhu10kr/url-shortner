const express = require('express');
const router = express.Router();
const _ = require('lodash');


const {User} = require('../models/user');
const {authencicateUser} = require('../middlewares/authentication');

router.get('/',(req,res) => {
    User.find().then(data => res.send(data)).catch(err => res.send(err))
});

//authenticate middleware
//custom middleware,we can call where ever we require


// let authencicateUser = (req,res,next) => {
//     let token = req.header('x-auth');
//     User.findByToken(token).then(user => {
//         //between functions if we want to pass data we use req object
//         //by using re.locals we can use locals in views (like .pug) also
//         req.locals = {
//             user,
//             token
//         }
//         next();
//     }).catch(err => res.status(401).send(err))
// };

router.get('/me',authencicateUser,(req,res) => {
    //req.locals
    res.send(req.locals.user);
});

router.post('/',(req,res) => {
    let body =  _.pick(req.body,['userName','email','mobile','password']);
    let user = new User(body);
    user.save().then((user) => {
        return user.generateToken()
    }).then((token) => {
        res.header('x-auth',token).send(user);//we are passing token data in header//x-auth is a key/parameter

    }).catch((err) => res.send(err));
});

router.delete('/logout',authencicateUser,(req,res) => {
    // req.locals.user.deleteToken(req.locals.token).then(() =>{
    //     res.send();
    // }).catch(err => console.log(err))
    User.findOneAndUpdate(req.locals.user,{$pull: {tokens:req.locals.token}}, { new: true }).then(data => {
        res.send(data)
      }).catch(err => res.send(err));
});


module.exports = {
    usersController:router
}