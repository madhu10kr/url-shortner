const express = require('express');
const router = express.Router();
const {urlsController} = require('../app/controllers/urls_controller');
const {usersController} = require('../app/controllers/users_controller');

router.use('/urls',urlsController);
router.use('/users',usersController);




module.exports = {
    router
}