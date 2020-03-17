
//LIBRARIES
const express = require('express');
const app = express();


//CONTROLLERS

const AquatoneController = require('../controllers/aquatoneController');



// TEST WORKS
app.get('/', AquatoneController.testAquatone);

// GET AQUATONE INSTANCE
app.get('/:id', AquatoneController.getAquatone);

//EXECUTE AQUATONE
app.post('/', AquatoneController.callAquatone);

module.exports = app;