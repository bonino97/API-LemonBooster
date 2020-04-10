//LIBRARIES

const express = require('express');
const app = express();

//CONTROLLERS

const JSearchController = require('../controllers/jsearchController');


//ARJUN MAKE SYNTAX
app.put('/Single', JSearchController.makeJsearchSyntax);

//ARJUN EXECUTE SYNTAX
app.post('/Single', JSearchController.executeSidebarJsearch);


module.exports = app;