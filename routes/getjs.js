//LIBRARIES

const express = require('express');
const app = express();

//CONTROLLERS

const getJsController = require('../controllers/getjsController');

//TEST GETJS ENDPOINT
app.get('/', getJsController.testGetJs);

//GETJS PROGRAM ENDPOINT
app.get('/:id', getJsController.getGetJsFiles);

//EXECUTE SUBDOMAINS CODES
app.post('/Links/', getJsController.getJsLinks );

//EXECUTE GETJS
app.post('/', getJsController.callGetJs );


module.exports = app;