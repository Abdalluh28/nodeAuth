const allowedOrigins = require("./allowedOrigins")

const corsOptions = {
    origin: (origin, callback) => {
        
        // this condition is to check if there is elements in the allowedOrigins array or not
        // !origin is just for postman testing (when uploading we delete it)
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true) 
            // this means there is no error (first parameter) 
            //and the origin is specified to the allowedOrigins array

        } else {
            callback(new Error("Not allowed by CORS"))
        }
    },

    credentials: true, // to allow sending cookies in requests
    optionsSuccessStatus: 200
}


module.exports = corsOptions