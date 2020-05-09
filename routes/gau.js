//LIBRARIES

const express = require('express');
const app = express();

//CONTROLLERS

const GauController = require('../controllers/gauController');

//TEST DIRSEARCH ENDPOINT
app.get('/', GauController.TestGau);

//GET DIRSEARCH ENDPOINT
app.get('/:id', GauController.GetGauFiles);

//EXECUTE DIRSEARCH
app.post('/', GauController.CallGau);

module.exports = app;