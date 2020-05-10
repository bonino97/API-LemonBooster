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

            let crawlersDir = `${program.programDir}Crawlers/AllEndpoints/`;
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
    
            files = getCrawlersFiles(crawlersDir);

            if(!files){
                return res.status(500).json({
                    ok: false,
                    message: 'Execute Crawlers first.',
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
            let zileName = program.name;

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

function getCrawlersFiles(crawlersDir){
    
    try{
        let crawlersArray = [];

        fs.readdirSync(crawlersDir).forEach(files => {
            crawlersArray.push(files);
        });
    
        return(crawlersArray);
    }
    catch(err){
        console.log("Doesn't exist a Crawlers Scan yet!");
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
        let crawlersFile = `${programDir}Crawlers/AllEndpoints/${zile.file}`;

        syntax = `cat ${crawlersFile} | python3 ~/tools/new-zile/zile.py --request | tee -a ${zile.zileDirectory}${zileName}-${date}.txt`;

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