
//LIBRARIES
const express = require('express');
const app = express();


//CONTROLLERS

const HttprobeController = require('../controllers/httprobeController');



// TEST WORKS
app.get('/:id', HttprobeController.getHttprobe);

//EXECUTE HTTPROBE
app.post('/', HttprobeController.callHttprobe)



module.exports = app;