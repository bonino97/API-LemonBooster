//LIBRARIES

const express = require('express');
const app = express();

//CONTROLLERS

const DirsearchController = require('../controllers/dirsearchController');

//TEST DIRSEARCH ENDPOINT
app.get('/', DirsearchController.getDirsearch);

//EXECUTE DIRSEARCH
app.post('/', DirsearchController.callDirsearch );


module.exports = app;