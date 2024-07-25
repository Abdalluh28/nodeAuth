const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyJWT = require('../middleware/verifyJWT');

// before getting all users check if user is logged in
router.use(verifyJWT)

router.route('/').get(userController.getAllUsers);

module.exports = router


// now wo must login first and take the access token to know all users