//LIBRARIES

const express = require('express');
const app = express();

//CONTROLLERS

const HakrawlerController = require('../controllers/hakrawlerController');

//TEST DIRSEARCH ENDPOINT
app.get('/', HakrawlerController.TestHakrawler);

//GET DIRSEARCH ENDPOINT
app.get('/:id', HakrawlerController.GetHakrawlerFiles);

//EXECUTE DIRSEARCH
app.post('/', HakrawlerController.CallHakrawler );

module.exports = app;