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

//LINKFINDER GET SYNTAX
app.put('/Single', LinkfinderController.getLinkfinderSyntax);

//LINKFINDER GET SYNTAX
app.post('/Single', LinkfinderController.executeSidebarLinkFinder);



module.exports = app;