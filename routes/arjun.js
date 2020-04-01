//LIBRARIES

const express = require('express');
const app = express();

//CONTROLLERS

const ArjunController = require('../controllers/arjunController');


//ARJUN MAKE SYNTAX
app.put('/Single', ArjunController.makeArjunSyntax);

//ARJUN EXECUTE SYNTAX
app.post('/Single', ArjunController.executeSidebarArjun);


module.exports = app;