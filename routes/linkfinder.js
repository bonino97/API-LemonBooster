//LIBRARIES

const express = require('express');
const app = express();

//CONTROLLERS

const LinkfinderController = require('../controllers/linkfinderController');

//TEST LINKFINDER ENDPOINT
app.get('/', LinkfinderController.testLinkfinder);

//LINKFINDER PROGRAM ENDPOINT
app.get('/:id', LinkfinderController.getLinkfinderFiles);

//EXECUTE SUBDOMAINS CODES
app.post('/Links/', LinkfinderController.getJsLinks );

//EXECUTE LINKFINDER
app.post('/', LinkfinderController.callLinkfinder );

module.exports = app;