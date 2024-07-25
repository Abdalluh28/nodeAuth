// any domin name in the front-end will have access to the api 
// we dont want that so we use cors to limit the access to specific domains

const allowedOrigins = [
    'http://localhost:3000',
]


module.exports = allowedOrigins