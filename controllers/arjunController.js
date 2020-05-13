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
// ARJUN VIA SIDEBAR ENDPOINT.
//=====================================================================

function makeArjunSyntax (req, res){
    
    let body = req.body;
    let method = body.method;
    let stable = '';
    let threadCheck = '';
    let threads = '';

    if(body.stable == true){
        stable = ' --stable';
    }
    if(body.threadCheck == true){
        threadCheck = ' -t ';
        threads = body.threads;
    }


    let syntax = `python3 ~/tools/Arjun/arjun.py -u ${body.url} ${method}${stable}${threadCheck}${threads}`; 

    console.log(syntax);

    res.status(200).json(
        syntax
    );

}

//=====================================================================
// EXECUTE ARJUN VIA SIDEBAR ENDPOINT.
//=====================================================================

function executeSidebarArjun (req, res){
    
    try{

        let body = req.body;
        let method = body.method;
        let stable = '';

        let threadCheck = '';
        let threads = '';

        let urlName = '';
        let singleDir = saveSingleArjunDirectory();

        if(body.stable == true){
            stable = ' --stable';
        }

        if(body.threadCheck == true){
            threadCheck = ' -t ';
            threads = body.threads;
        }
    
        
        if(body.url.indexOf('http') === -1){

            if(body.url.indexOf('/') === -1){
                urlName = body.url;
            } else {
                urlName = body.url.split('/')[0];
            }

        } else {
            urlName = body.url.split('/')[2];
        }
        
        let syntax = `python3 ~/tools/Arjun/arjun.py -u ${body.url} ${method}${stable}${threadCheck}${threads} -f "./lists/arjun-params.txt" -o ${singleDir}arjun-${urlName}-${date}.json`; 

        console.log('##################################################');
        console.log('###############-Arjun Started-###############');
        console.log('##################################################');

        shell.exec(syntax);

        console.log('##################################################');
        console.log('###############-Arjun Finish-###############');
        console.log('##################################################');
        
        let singleTools = new SingleTools({
            syntax: syntax,
            url: body.url
        });

        singleTools.save();

        res.status(200).json({
            ok: true,
            message: 'Arjun Executed Correctly.',
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

function saveSingleArjunDirectory(){

    let singleDir = `../LemonBooster-Results/SingleTools/`;
    let arjunDir = `${singleDir}Arjun/`    

    if( fs.existsSync(singleDir) ){
        console.log('SingleTools Directory Exists.');
    } else { 
        shell.exec(`mkdir ${singleDir}`)
    }

    if( fs.existsSync(arjunDir) ){
        console.log('Single Arjun Directory Exists.');
    } else { 
        shell.exec(`mkdir ${arjunDir}`)
    }

    return arjunDir;

}


module.exports = {
    makeArjunSyntax,
    executeSidebarArjun
}