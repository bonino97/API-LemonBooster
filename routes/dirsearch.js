//LIBRARIES

const express = require('express');
const app = express();

//CONTROLLERS

const DirsearchController = require('../controllers/dirsearchController');

//TEST DIRSEARCH ENDPOINT
app.get('/', DirsearchController.testDirsearch);

//DIRSEARCH LISTS
app.get('/Lists', DirsearchController.getDirsearchLists);

//TEST DIRSEARCH ENDPOINT
app.get('/:id', DirsearchController.getDirsearchFiles);

//EXECUTE SUBDOMAINS CODES
app.post('/Status/', DirsearchController.getSubdomainsCodes );

//EXECUTE DIRSEARCH
app.post('/', DirsearchController.callDirsearch );

//DIRSEARCH GET SYNTAX
app.put('/Single', DirsearchController.makeDirsearchSyntax);

//EXECUTE SINGLE DIRSEARCH
app.post('/Single', DirsearchController.executeSidebarDirsearch);


module.exports = app;