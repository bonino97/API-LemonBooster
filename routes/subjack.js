
//LIBRARIES
const express = require('express');
const app = express();


//CONTROLLERS

const SubjackController = require('../controllers/subjackController');



// TEST WORKS
app.get('/', SubjackController.testSubjack);

// GET SUBJACK INSTANCE
app.get('/:id', SubjackController.getSubjack);

//EXECUTE SUBJACK
app.post('/', SubjackController.callSubjack)



module.exports = app;