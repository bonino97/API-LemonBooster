
//LIBRARIES
const express = require('express');
const app = express();

//CONTROLLERS

const HakcheckurlController = require('../controllers/hakcheckurlController');

// TEST WORKS
app.get('/', HakcheckurlController.testHakcheckurl);

// GET HAKCHECKURL INSTANCE
app.get('/:id', HakcheckurlController.getHakcheckurl);

//EXECUTE HAKCHECKURL
app.post('/', HakcheckurlController.callHakcheckurl);

module.exports = app;