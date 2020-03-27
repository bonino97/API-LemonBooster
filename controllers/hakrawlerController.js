'use strict'

//LIBRARIES 

const shell = require('shelljs');
const dateFormat = require('dateformat');
const fs = require('fs');

//MODELS
const Program = require('../models/program');
const Hakrawler = require('../models/hakrawler');

//CONSTS

let date = dateFormat(new Date(), "yyyy-mm-dd-HH-MM");

//=====================================================================
// TEST ENDPOINTS
//=====================================================================

function testHakrawler(req,res){
    res.json('GET Hakrawler - Web Crawling Enabled.');
}

//=====================================================================
// OBTAIN HAKRAWLER PROGRAM WITH PROGRAMID
//=====================================================================

function getHakrawlerFiles(req,res){
    let id = req.params.id;

    try{
        Program.findById(id, (err, program) => {

            let findomainDir = `${program.programDir}Findomain/`;
            let files = [];
    
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
    
            files = getFindomainFiles(findomainDir);

            return res.status(200).json({
                ok: true,
                files
            });
    
        });
    }

    catch(err){
        console.log(err);
    }
}

//=====================================================================
// CALL HAKRAWLER EXECUTE FUNCTION
//=====================================================================

function callHakrawler(req,res){

    var body = req.body;

    var hakrawler = new Hakrawler({
        program: body.program,
        url: body.url,
        findomainFile: body.findomainFile
    });

    try {

        Program.findById(hakrawler.program, (err,program) => {
            if(err){
                return res.status(400).json({
                    ok: false,
                    message: 'Error getting Program.',
                    errors: err 
                });
            }

            let programDir = program.programDir;  

            hakrawler.hakrawlerDirectory = saveHakrawlerDirectory(programDir);


            console.log('##################################################');
            console.log('###############-HAKRAWLER STARTED.-###############');
            console.log('##################################################');

            hakrawler.syntax = executeHakrawler(hakrawler.findomainFile, programDir, hakrawler);

            
            console.log('#################################################');
            console.log('###############-HAKRAWLER FINISH.-###############');
            console.log('#################################################');


            hakrawler.save( (err, hakrawlerSaved) => {
                if(err){
                    return res.status(400).json({
                        ok: false,
                        message: 'Error executing Hakrawler.',
                        errors: err 
                    });
                }

                if(!hakrawler){
                    return res.status(400).json({
                        ok: false,
                        message: 'Hakrawler doesnt exists.',
                        errors: {message: 'Hakrawler doesnt exists.'}
                    });
                }

                res.status(200).json({
                    ok: true,
                    message: 'Hakrawler Executed Correctly.',
                    hakrawler: hakrawlerSaved
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

function getFindomainFiles(findomainDir){
    let findomainArray = [];

    fs.readdirSync(findomainDir).forEach(files => {
        findomainArray.push(files);
    });

    return(findomainArray);
}

function saveHakrawlerDirectory(programDir){

    let hakrawlerDir = `${programDir}Hakrawler/`;

    if( fs.existsSync(hakrawlerDir) ){
        console.log('Hakrawler Directory Exists.');
    } else { 
        shell.exec(`mkdir ${hakrawlerDir}`)
    }

    return hakrawlerDir;

}


function executeHakrawler(findomainFile, programDir, hakrawler){

    let syntax = String;
    let findomainDir = `${programDir}Findomain/`;

    try{

        syntax = `cat ${findomainDir}${findomainFile} | ~/go/bin/hakrawler -plain | tee -a ${hakrawler.hakrawlerDirectory}hakrawler-${hakrawler.url}-${date}.txt`;

        shell.exec(syntax);
    }
    catch(err){
        console.log(err);
    }

    return syntax;
}


module.exports = {
    testHakrawler,
    getHakrawlerFiles,
    callHakrawler
    
}