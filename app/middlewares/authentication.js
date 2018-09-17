const {User} = require('../models/user');

//if we pass as parameters then req.query


//if we pass as headers

//authenticate middleware
//custom middleware,we can call where ever we require
let authencicateUser = (req,res,next) => {
    let token = req.header('x-auth');
    User.findByToken(token).then(user => {
        //between functions if we want to pass data we use req object
        //by using req.locals we can use locals in views (like .pug) also
        req.locals = {
            user,
            token
        }
        next();
    }).catch(err => res.status(401).send(err))
};

module.exports = {
    authencicateUser
}