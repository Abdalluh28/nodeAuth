const User = require('../models/User');

const getAllUsers = async (req, res) => {
    const users = await User.find().select('-password').lean(); // return all users data except password

    if(!users) {
        res.json({message: 'No users found'});
    }

    res.json(users);
}


module.exports = {
    getAllUsers,
}