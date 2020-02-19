//LIBRARIES

const express = require('express');
const shell = require('shelljs');
const app = express();
const dateFormat = require('dateformat');

//MODELS

const Findomain = require('../models/findomain');


let date = dateFormat(new Date(), "yyyy-mm-dd-HH:MM");

app.get('/', function(req,res){
    res.json('GET Findomain Enumeration');
});

app.post('/', function(req,res){

    var body = req.body;

    var findomain = new Findomain({
        url: body.url
    })

    if(body.resolvable === '1'){
        findomain.resolvable = true;
        findomain.syntax = executeFindomain(body.url, true);
    } else {
        findomain.resolvable = false;
        findomain.syntax = executeFindomain(body.url, false);
    }
d
    findomain.save((err,findoSaved) => {
        
        if(!findomain.url){
            return res.status(400).json({
                ok: false,
                message: 'Findomain URL not exists.',
                errors: {message: 'Findomain URL not exists'}
            });
        }
        
        res.status(200).json({
            ok:true,
            findomain: findoSaved
        });
    });

    
})

function executeFindomain(url, resolvable){

    let syntax = String;
    
    try{

        if(resolvable){
            syntax = `findomain -t ${url} -r -u ${date}-${url}.txt`;
        } else {
            syntax = `findomain -t ${url} -u findomain-${url}-${date}.txt`;
        }

        shell.echo(syntax);
    }
    catch(err){
        console.log(err);
    }
    return syntax.toString();
}

module.exports = app;