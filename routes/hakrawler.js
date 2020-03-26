//LIBRARIES

const express = require('express');
const app = express();

//CONTROLLERS

const HakrawlerController = require('../controllers/hakrawlerController');

//TEST DIRSEARCH ENDPOINT
app.get('/', HakrawlerController.testHakrawler);

//GET DIRSEARCH ENDPOINT
app.get('/:id', HakrawlerController.getHakrawlerFiles);

//EXECUTE DIRSEARCH
app.post('/', HakrawlerController.callHakrawler );

module.exports = app;