
//LIBRARIES
const express = require('express');
const app = express();


//CONTROLLERS

const FindomainController = require('../controllers/findomainController');



// TEST WORKS
app.get('/', FindomainController.getFindomain);

//EXECUTE FINDOMAIN
app.post('/:id', FindomainController.callFindomain)



module.exports = app;