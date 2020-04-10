'use strict'

//LIBRARIES 

const shell = require('shelljs');
const dateFormat = require('dateformat');
const fs = require('fs');

//CONSTS

let date = dateFormat(new Date(), "yyyy-mm-dd-HH-MM");

//MODELS

const Program = require('../models/program');
const Zile = require('../models/zile');


//=====================================================================
// TEST ENDPOINTS
//=====================================================================

function testZile(req,res){
    res.json('GET Zile - Endpoint Scanner.');
}

//=====================================================================
// OBTAIN ZILE PROGRAM WITH PROGRAMID
//=====================================================================

function getZileFiles(req,res){
    let id = req.params.id;

    try{
        Program.findById(id, (err, program) => {

            let hakrawlerDir = `${program.programDir}Hakrawler/`;
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
    
            files = getHakrawlerFiles(hakrawlerDir);

            if(!files){
                return res.status(500).json({
                    ok: false,
                    message: 'Execute Hakrawler first.',
                    error: err
                });
            }
            
            return res.status(200).json({
                ok: true,
                files
            });
    
        });
    }
    catch(err){
        console.log(err)
        return res.status(500).json({
            ok: false,
            message: 'Error loading tool...',
            error: err
        });
    }
}

//=====================================================================
// CALL ZILE EXECUTE FUNCTION
//=====================================================================

function callZile(req,res){

    var body = req.body;

    var zile = new Zile({
        program: body.program,
        file: body.file
    });

    try {

        Program.findById(zile.program, (err,program) => {
            if(err){
                return res.status(400).json({
                    ok: false,
                    message: 'Error getting Program.',
                    errors: err 
                });
            }

            let programDir = program.programDir;  
            let zileName = zile.file.split('-')[1];

            console.log(zileName)

            zile.zileDirectory = saveZileDirectory(programDir);

            console.log(zile.zileDirectory)

            console.log('##################################################');
            console.log('###############-Zile Started-###############');
            console.log('##################################################');


            zile.syntax = executeZile(zile, zileName, programDir);

            zile.save( (err, zileSaved) => {
                if(err){
                    return res.status(400).json({
                        ok: false,
                        message: 'Error executing Zile.',
                        errors: err 
                    });
                }

                if(!zile){
                    return res.status(400).json({
                        ok: false,
                        message: 'Zile doesnt exists.',
                        errors: {message: 'Zile doesnt exists.'}
                    });
                }

                console.log('#################################################');
                console.log('###############-Zile Finish.-###################');
                console.log('#################################################');

                res.status(200).json({
                    ok: true,
                    message: 'Zile Executed Correctly.',
                    zile: zileSaved
                });

            });

        });

    }
    catch(err){

        console.log(err);
        return res.status(500).json({
            ok: false,
            message: 'Error executing tool',
            error: err
        });

    }

}







//=====================================================================
// FUNCTIONS
//=====================================================================

function getHakrawlerFiles(hakrawlerDir){
    
    try{
        let hakrawlerArray = [];

        fs.readdirSync(hakrawlerDir).forEach(files => {
            hakrawlerArray.push(files);
        });
    
        return(hakrawlerArray);
    }
    catch(err){
        console.log("Doesn't exist a Hakrawler Scan yet!");
        return false;
    }


}

function saveZileDirectory(programDir){

    try {
        let zileDir = `${programDir}KeyFinder/`;

        if( fs.existsSync(zileDir) ){
            console.log('Zile Directory Exists.');
        } else { 
            shell.exec(`mkdir ${zileDir}`)
        }
    
        return zileDir;
    }
    catch(err){
        return err;
    }


}

function executeZile(zile, zileName, programDir){

    try{

        let syntax = String;
        let hakrawlerFile = `${programDir}Hakrawler/${zile.file}`;

        syntax = `cat ${hakrawlerFile} | python3 ~/tools/new-zile/zile.py --request | tee -a ${zile.zileDirectory}keys-${zileName}-${date}.txt`;

        shell.exec(syntax);
        return syntax;

    }
    catch(err){
        
        console.log(err);
        return err;
    }
}




module.exports = {
    testZile,
    getZileFiles,
    callZile
}