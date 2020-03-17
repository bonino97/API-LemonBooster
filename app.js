
const express = require('express');
const app = express();
const mongoose = require('mongoose');
var bodyParser = require('body-parser');



///#############################################################################
///              PARSE application/x-www-form-urlencoded
///#############################################################################


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


///#############################################################################
//                              CORS
///#############################################################################

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // DOMINIO PERMITIDO PARA INTERACTUAR CON EL SVR
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
  });



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
var aquatoneRoutes = require('./routes/aquatone');
var httprobeRoutes = require('./routes/httprobe');
var dirsearchRoutes = require('./routes/dirsearch');
var findomainRoutes = require('./routes/findomain');
var programRoutes = require('./routes/program');
var appRoutes = require('./routes/app');


//ROUTES
app.use('/Aquatone', aquatoneRoutes);
app.use('/Dirsearch', dirsearchRoutes);
app.use('/Httprobe', httprobeRoutes);
app.use('/Findomain', findomainRoutes);
app.use('/Program', programRoutes);
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
