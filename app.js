const shell = require('shelljs');
const argv = require('./config/yargs').argv;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
var bodyParser = require('body-parser');


// PARSE application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


app.get('/', function(req,res){
    res.send('Hello World!')
});

/*----------------------------------------------------------------------------*/

///#############################################################################
//                              MONGO DB
///#############################################################################

mongoose.connection.openUri('mongodb://localhost:27017/lemon-booster', { useNewUrlParser: true }, (err, res) => {
    
    if(err){
        throw err;
    }

    console.log('Database: lemon-booster ~ Online');
    
});

///#############################################################################
//                            END - MONGO DB
///#############################################################################

/*----------------------------------------------------------------------------*/

///#############################################################################
//                                ROUTES
///#############################################################################

//IMPORT
var findomainRoutes = require('./routes/findomain');
var appRoutes = require('./routes/app');

//ROUTE
app.use('/Findomain', findomainRoutes);
app.use('/', appRoutes);

///#############################################################################
//                              END - ROUTES
///#############################################################################

/*----------------------------------------------------------------------------*/

///#############################################################################
//                              BACKEND LISTENING
///#############################################################################

app.listen(3000, () => {
    console.log('Backend: lemon-booster ~ Online');
});

///#############################################################################
//                              END BACKEND LISTENING
///#############################################################################

/*----------------------------------------------------------------------------*/
