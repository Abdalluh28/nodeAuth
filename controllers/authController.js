const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')

const register = async (req, res) => {
    const {firstName, lastName, email, password} = req.body;

    if(!firstName || !lastName || !email || !password) {
        return res.status(404).json({'message': 'All fields are required'});
    }

    const existingUser = await User.findOne({email}).exec();

    if(existingUser) {
        return res.status(401).json({'message': 'User already exists'});
    }

    let hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
        firstName, lastName, email, password: hashedPassword
    })

    // creating token
    // passing user info to token (information that is not sensitive) not email or password
    const accessToken = jwt.sign({
        userInfo: {
            id: newUser._id,
        }
    }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'})

    const refreshToken = jwt.sign({
        userInfo: {
            id: newUser._id,
        }
    }, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'})


    res.cookie('jwt', refreshToken, {
        httpOnly: true, // for security reasons (accessible only by web server)
        secure: process.env.NODE_ENV === 'production', // for security reasons (https) in production not development
        sameSite: 'None', // this cookie is sent to all the domains
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })



    return res.json({
        accessToken, 
        email: newUser.email, 
        firstName: newUser.firstName,
    })
}



const login = async (req, res) => {
    const {email, password} = req.body;

    if(!email || !password) {
        return res.status(400).json({'message': 'All fields are required'});
    }

    const existingUser = await User.findOne({email}).exec();
    if(!existingUser) {
        return res.status(401).json({'message': 'User does not exist'});
    }

    let isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if(!isPasswordCorrect) {
        return res.status(401).json({'message': 'Incorrect password'});
    }

    const accessToken = jwt.sign({
        userInfo: {
            id: existingUser._id,
        }
    }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'})

    const refreshToken = jwt.sign({
        userInfo: {
            id: existingUser._id,
        }
    }, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'})


    res.cookie('jwt', refreshToken, {
        httpOnly: true, // for security reasons (accessible only by web server)
        secure: process.env.NODE_ENV === 'production', // for security reasons (https) in production not development
        sameSite: 'None', // this cookie is sent to all the domains
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    return res.json({
        accessToken,
        firstName: existingUser.firstName
    })
}



// if the access token is expired, we use the refresh token (if it exists) to get a new access token
const refresh = (req, res) => {
    const cookies = req.cookies
    if(!cookies?.jwt) {
        // no refresh token
        return res.status(401).json({'message': 'Unauthorized'})
    }

    const refreshToken = cookies.jwt; 
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
        if(err) {
            return res.status(403).json({'message': 'Forbidden'}) // refresh token not matches the REFRESH_TOKEN_SECRET
        }

        const existingUser = await User.findById(decoded.userInfo.id).exec();

        if(!existingUser) {
            return res.status(401).json({'message': 'Unauthorized'}) // the user does not exist
        }

        const accessToken = jwt.sign({
            userInfo: {
                id: existingUser._id,
            }
        }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'})
    

        return res.json({accessToken})

    })
}

const logout = (req, res) => {
    const cookies = req.cookies
    if(!cookies?.jwt) {
        return res.status(204).json({'message': 'No content'})
    }

    res.clearCookie('jwt', {
        httpOnly: true, // for security reasons (accessible only by web server)
        secure: process.env.NODE_ENV === 'production', // for security reasons (https) in production not development
        sameSite: 'None', // this cookie is sent to all the domains
    })

    return res.json({'message': 'Cookie cleared'})
}

module.exports = {
    register,
    login,
    refresh,
    logout
}