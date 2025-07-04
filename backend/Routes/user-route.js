const router = require('express').Router();

const User = require('../Service/UserService');

//add users to the database
router.post('/register',User.register);

//login
router.post('/login',User.login);

module.exports = router;