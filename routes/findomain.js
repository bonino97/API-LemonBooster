
//LIBRARIES
const express = require('express');
const app = express();


//CONTROLLERS

const FindomainController = require('../controllers/findomainController');



// TEST WORKS
app.get('/', FindomainController.getFindomain);

//EXECUTE FINDOMAIN
app.post('/', FindomainController.callFindomain)

//SINGLE FINDOMAIN GET SYNTAX
app.put('/Single', FindomainController.getFindomainSyntax);

//SINGLE FINDOMAIN EXECUTE SYNTAX
app.post('/Single', FindomainController.executeSidebarFindomain);


module.exports = app;