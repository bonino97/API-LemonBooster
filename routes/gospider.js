//LIBRARIES

const express = require('express');
const app = express();

//CONTROLLERS

const GoSpiderController = require('../controllers/gospiderController');

//TEST DIRSEARCH ENDPOINT
app.get('/', GoSpiderController.TestGoSpider);

//GET DIRSEARCH ENDPOINT
app.get('/:id', GoSpiderController.GetGospiderFiles);

//EXECUTE DIRSEARCH
app.post('/', GoSpiderController.CallGospider);

module.exports = app;