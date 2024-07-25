const jwt = require('jsonwebtoken');


const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization; // "Bearer TOKEN"

    if(!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({message: 'unauthorized'});
    }

    const token = authHeader.split(' ')[1]; // what is sent in the header is the access token

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if(err) {
            return res.status(403).json({message: 'forbidden'}); // if the token is not valid (expires مثلا)
        } 

        // here we redirect it to another middleware to refersh the token
        req.user = decoded.userInfo.id;

        next();
    });
}


module.exports = verifyJWT

