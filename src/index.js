const express = require('express');
const route = require('./routes/route.js');
const mongoose = require('mongoose');
const { AppConfig } = require('aws-sdk');
const multer = require('multer')
const app = express();
const PORT = process.env.PORT || 3000

app.use(express.json());
app.use(multer().any());

mongoose.connect("mongodb+srv://chetan:7000724002@cluster0.8cp68gw.mongodb.net/group10Database", {
    useNewUrlParser: true
})
.then(() => console.log("MongoDb is connected"), err => console.log(err))

app.use('/', route);

app.listen(PORT, function () {
    console.log('Express app running on port ' + PORT)
});