require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const mongoose = require('mongoose');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const cookieParser = require('cookie-parser');
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');



connectDB();


app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json()); // to allow express to read json objects


app.use('/', express.static('./public/css'));
app.use('/', require('./routes/root'));
app.use('/auth', require('./routes/authRoutes'));
app.use('/users', require('./routes/userRoutes'));

// once we connect to the database, start the server
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(port, () => {
        console.log(`Listening on port ${port}`);
    })
})


mongoose.connection.on('error', (err) => {
    console.log(err);
    process.exit(1);
})



app.all('*', (req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
})