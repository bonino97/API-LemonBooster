
//LIBRARIES
const express = require('express');
const app = express();


//CONTROLLERS

const HttprobeController = require('../controllers/httprobeController');



// TEST WORKS
app.get('/', HttprobeController.getHttprobe);

//EXECUTE FINDOMAIN
app.post('/', HttprobeController.callHttprobe)



module.exports = app;