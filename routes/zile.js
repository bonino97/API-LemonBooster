//LIBRARIES

const express = require('express');
const app = express();

//CONTROLLERS

const zileController = require('../controllers/zileController');

//TEST GETJS ENDPOINT
app.get('/', zileController.testZile);

//GETJS PROGRAM ENDPOINT
app.get('/:id', zileController.getZileFiles);

//EXECUTE GETJS
app.post('/', zileController.callZile );


module.exports = app;