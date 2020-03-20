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


module.exports = app;