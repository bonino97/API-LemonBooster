//LIBRARIES

const express = require('express');
const app = express();

//CONTROLLERS

const WaybackurlsController = require('../controllers/waybackurlsController');

//TEST DIRSEARCH ENDPOINT
app.get('/', WaybackurlsController.TestWaybackurls);

//GET DIRSEARCH ENDPOINT
app.get('/:id', WaybackurlsController.GetWaybackurlsFiles);

//EXECUTE DIRSEARCH
app.post('/', WaybackurlsController.CallWaybackurls);

module.exports = app;