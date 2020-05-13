'use strict'

//LIBRARIES 

const shell = require('shelljs');
const dateFormat = require('dateformat');
const fs = require('fs');

//MODELS

const SingleTools = require('../models/singleTools')

//CONSTS

let date = dateFormat(new Date(), "yyyy-mm-dd-HH-MM");

//=====================================================================
// JSEARCH VIA SIDEBAR ENDPOINT.
//=====================================================================

function makeJsearchSyntax (req, res){
    
    let body = req.body;

    let syntax = `python3 ~/tools/jsearch/jsearch.py -u ${body.url} -n ${body.name}`; 

    console.log(syntax);

    res.status(200).json(
        syntax
    );

}

//=====================================================================
// EXECUTE JSEARCH VIA SIDEBAR ENDPOINT.
//=====================================================================

function executeSidebarJsearch (req, res){
    
    try{

        let body = req.body;

        let singleDir = saveSingleJsearchDirectory();    
        
        let syntax = `python3 ~/tools/jsearch/jsearch.py -u ${body.url} -n ${body.name} | tee -a ${singleDir}jsearch-${body.name}-${date}.txt`; 

        console.log('##################################################');
        console.log('###############-JSearch Started-###############');
        console.log('##################################################');

        shell.exec(syntax);

        console.log('##################################################');
        console.log('###############-JSearch Finish-###############');
        console.log('##################################################');
        
        let singleTools = new SingleTools({
            syntax: syntax,
            url: body.url
        });

        singleTools.save();

        res.status(200).json({
            ok: true,
            message: 'JSearch Executed Correctly.',
            syntax: syntax,
            directory: singleDir,
            singleTools
        });

    }catch(err){
        console.log(err);
    }
}


//=====================================================================
// SINGLE TOOLS FUNCTIONS
//=====================================================================

function saveSingleJsearchDirectory(){

    let singleDir = `../LemonBooster-Results/SingleTools/`;
    let jsearchDir = `${singleDir}JSearch/`    

    if( fs.existsSync(singleDir) ){
        console.log('SingleTools Directory Exists.');
    } else { 
        shell.exec(`mkdir ${singleDir}`)
    }

    if( fs.existsSync(jsearchDir) ){
        console.log('Single JSearch Directory Exists.');
    } else { 
        shell.exec(`mkdir ${jsearchDir}`)
    }

    return jsearchDir;

}


module.exports = {
    makeJsearchSyntax,
    executeSidebarJsearch
}