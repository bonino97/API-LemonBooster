const express = require('express');
const shell = require('shelljs');
const app = express();


app.get('/', function(req,res){
    res.json('GET Findomain Enumeration');
});

app.post('/:url', function(req,res){
    var url = req.params.url;
    
    executeFindomain(url);
    
})

function executeFindomain(url){
    
    shell.exec(`findomain -t ${url}`);
}

module.exports = app;