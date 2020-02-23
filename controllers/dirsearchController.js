'use strict'

//LIBRARIES 

const shell = require('shelljs');
const dateFormat = require('dateformat');

//MODELS

const Dirsearch = require('../models/dirsearch');

//CONSTS

let date = dateFormat(new Date(), "yyyy-mm-dd-HH:MM");


//=====================================================================
// TEST ENDPOINTS
//=====================================================================

function getDirsearch(req,res){
    res.json('GET Dirsearch - Directory Brute Forcing Enabled.');
}


//=====================================================================
// CALL DIRSEARCH EXECUTE FUNCTION
//=====================================================================

function callDirsearch(req,res){
    var body = req.body;

    var dirsearch = new Dirsearch({
        url: body.url
    })


    dirsearch.syntax = executeDirsearch(body.url);


    dirsearch.save((err,dirSaved) => {
        
        if(!dirsearch.url){
            return res.status(400).json({
                ok: false,
                message: 'Dirsearch URL not exists.',
                errors: {message: 'Dirsearch URL not exists'}
            });
        }
        
        res.status(200).json({
            ok: true,
            dirsearch: dirSaved
        });
    });
}

function executeDirsearch(url){

    let syntax = String;
    
    try{

        syntax = `python3 ~/tools/dirsearch/dirsearch.py -u ${url} -e * -x 404,400 --simple-report=dirsearch-${url}-${date}.txt`;

        shell.echo(syntax);
    }
    catch(err){
        console.log(err);
    }

    return syntax.toString();
}

module.exports = {
    getDirsearch,
    callDirsearch
}