'use strict'

//LIBRARIES 

const shell = require('shelljs');
const dateFormat = require('dateformat');
const fs = require('fs');

//MODELS

const Program = require('../models/program');
const Hakcheckurl = require('../models/hakcheckurl');

//CONSTS

let date = dateFormat(new Date(), "yyyy-mm-dd-HH-MM");

//=====================================================================
// TEST HAKCHECKURL ENDPOINT
//=====================================================================

function testHakcheckurl(req,res){
    res.status(200).json('GET HAKCHECKURL Works!')
}

//=====================================================================
// OBTAIN HAKCHECKURL PROGRAM WITH PROGRAMID
//=====================================================================

function getHakcheckurl(req,res){
    let id = req.params.id;
    
    Program.findById(id, (err,program) => {

        let subdomainDir = `${program.programDir}Httprobe/`;

        if(err){
            return res.status(400).json({
                ok: false,
                message: 'Error getting program.',
                errors: err 
            });
        }

        if(!program){
            return res.status(500).json({
                ok: false,
                message: 'Doesnt exist program with this id.' ,
                error: { message: 'Doesnt exist program with this id.' }
            });
        }

        let httprobeFiles = getHakcheckurlFiles(subdomainDir);

        
        if(!httprobeFiles){
            return res.status(500).json({
                ok: false,
                message: 'Execute Httprobe first.',
                error: err
            });
        }

        return res.status(200).json({
            ok: true,
            httprobeFiles
        });
    });
}

//=====================================================================
// CALL HAKCHECKURL EXECUTE FUNCTION
//=====================================================================

function callHakcheckurl(req,res){
    const body = req.body;
    const hakcheckurl = new Hakcheckurl({

        program: body.program,
        httprobeFile: body.file
   
    });

    console.log(body.file);

    try{

        Program.findById(hakcheckurl.program, (err,program)=>{
            if(err){
                return res.status(400).json({
                    ok: false,
                    message: 'Error getting Program.',
                    errors: err 
                });
            }

            let programDir = program.programDir;  
            let httprobeDirectory = `${program.programDir}Httprobe/`;
            let fileName = hakcheckurl.httprobeFile.split('-');

            hakcheckurl.url = fileName[1];
            hakcheckurl.hakcheckurlDirectory = saveHakcheckurlDirectory(programDir);

            console.log('####################################################');
            console.log('###############-Hakcheckurl Started.-###############');            
            console.log('####################################################');

            hakcheckurl.syntax = executeHakcheckurl(hakcheckurl, httprobeDirectory);

            hakcheckurl.hakcheckurlFiles = getHakcheckurlResult(hakcheckurl.hakcheckurlDirectory);

            hakcheckurl.save((err,hakcheckurlSaved) => {
                
                if(err){
                    return res.status(400).json({
                        ok: false,
                        message: 'Error executing Hakcheckurl.',
                        errors: err 
                    });
                }

                if(!hakcheckurl){
                    return res.status(400).json({
                        ok: false,
                        message: 'Hakcheckurl doesnt exists.',
                        errors: {message: 'Hakcheckurl doesnt exists.'}
                    });
                }

                console.log('###################################################');
                console.log('###############-Hakcheckurl Finish.-###############');
                console.log('###################################################');
    
                res.status(200).json({
                    ok: true,
                    message: 'Hakcheckurl Executed Correctly.',
                    hakcheckurl: hakcheckurlSaved
                });
            });
        });

    }
    catch(err){
        console.log(err);
    }
}



//=====================================================================
// FUNCTIONS
//=====================================================================


function getHakcheckurlFiles(subdomainDir){

    try {

        let hakcheckurlArray = [];

        fs.readdirSync(subdomainDir).forEach(files => {
            hakcheckurlArray.push(files);
        });
    
        return(hakcheckurlArray);

    }
    catch(err){
        return false;
    }
};

function saveHakcheckurlDirectory(programDir){
    let hakcheckurlDir = `${programDir}Hakcheckurl/`;

    if( fs.existsSync(hakcheckurlDir) ){
        console.log('Hakcheckurl Directory Exists.');
    } else { 
        shell.exec(`mkdir ${hakcheckurlDir}`)
    }

    return hakcheckurlDir;
}

function executeHakcheckurl(hakcheckurl, httprobeDirectory){

    let syntax = String;
    let file = `${httprobeDirectory}${hakcheckurl.httprobeFile}`;

    syntax = `cat ${file} | ~/go/bin/hakcheckurl | grep -v 404,999 | tee -a ${hakcheckurl.hakcheckurlDirectory}hakcheckurl-${hakcheckurl.url}-${date}.txt`;

    shell.exec(syntax);

    return syntax;

}

function getHakcheckurlResult(hackcheckurlDir){

    let resultArray = [];

    fs.readdirSync(hackcheckurlDir).forEach(files => {
        resultArray.push(files);
    });

    return(resultArray);
};


module.exports = {
    testHakcheckurl,
    getHakcheckurl,
    callHakcheckurl
}