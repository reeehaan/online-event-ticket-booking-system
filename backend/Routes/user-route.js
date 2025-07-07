const router = require('express').Router();

const User = require('../Service/UserService');

//add users to the database
router.post('/register',User.register);
//login
router.post('/login',User.login);
//forget password
router.post('/forget-password', User.forgotPassword);

module.exports = router;