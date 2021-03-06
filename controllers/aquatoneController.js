'use strict'

//LIBRARIES 

const shell = require('shelljs');
const dateFormat = require('dateformat');
const fs = require('fs');

//MODELS

const Httprobe = require('../models/httprobe');
const Program = require('../models/program');
const Aquatone = require('../models/aquatone');

//CONSTS

let date = dateFormat(new Date(), "yyyy-mm-dd-HH-MM");


//=====================================================================
// TEST AQUATONE ENDPOINT
//=====================================================================

function testAquatone(req,res){
    res.status(200).json('GET Aquatone Works!')
}

//=====================================================================
// OBTAIN AQUATONE PROGRAM WITH PROGRAMID
//=====================================================================


function getAquatone(req,res){
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

        let httprobeFiles = getAquatoneFiles(subdomainDir);

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
// CALL AQUATONE EXECUTE FUNCTION
//=====================================================================

function callAquatone(req,res){
    const body = req.body;
    const aquatone = new Aquatone({

        program: body.program,
        httprobeFile: body.file
   
    });

    console.log(body.file);

    try{

        Program.findById(aquatone.program, (err,program)=>{
            if(err){
                return res.status(400).json({
                    ok: false,
                    message: 'Error getting Program.',
                    errors: err 
                });
            }

            let programDir = program.programDir;  
            let httprobeDirectory = `${program.programDir}Httprobe/`;
            let fileName = aquatone.httprobeFile.split('-');

            aquatone.url = fileName[1];
            aquatone.aquatoneDirectory = saveAquatoneDirectory(programDir);
            aquatone.aquatoneDirSession = saveAquatoneDirSession(aquatone);
            aquatone.syntax = executeAquatone(aquatone, httprobeDirectory);

            aquatone.save((err,aquatoneSaved) => {
                
                if(err){
                    return res.status(400).json({
                        ok: false,
                        message: 'Error executing Aquatone.',
                        errors: err 
                    });
                }

                if(!aquatone){
                    return res.status(400).json({
                        ok: false,
                        message: 'Aquatone doesnt exists.',
                        errors: {message: 'Aquatone doesnt exists.'}
                    });
                }

                console.log('################################################');
            
                console.log('###############-Aquatone Finish.-###############');
                
                console.log('################################################');
    
                res.status(200).json({
                    ok: true,
                    message: 'Aquatone Executed Correctly.',
                    aquatone: aquatoneSaved
                });
            });
        });

    }
    catch(err){
        console.log(err);
    }
}

function saveAquatoneDirectory(programDir){
    let aquatoneDir = `${programDir}Aquatone/`;

    if( fs.existsSync(aquatoneDir) ){
        console.log('Aquatone Directory Exists.');
    } else { 
        shell.exec(`mkdir ${aquatoneDir}`)
    }

    return aquatoneDir;
}

function saveAquatoneDirSession(aquatone){
    let aquatoneDirSession =`${aquatone.aquatoneDirectory}aquatone-${aquatone.url}-${date}`;

    console.log(aquatoneDirSession);

    shell.exec(`mkdir ${aquatoneDirSession}`);

    return aquatoneDirSession;
    
}

function executeAquatone(aquatone, httprobeDirectory){

    let syntax = String;
    let file = `${httprobeDirectory}${aquatone.httprobeFile}`;

    syntax = `cat ${file} | ~/go/bin/aquatone -ports large -out ${aquatone.aquatoneDirSession}`;

    shell.exec(syntax);

    return syntax;

}

function getAquatoneFiles(subdomainDir){

    try {

        let aquatoneArray = [];

        fs.readdirSync(subdomainDir).forEach(files => {
            aquatoneArray.push(files);
        });
    
        return(aquatoneArray);

    }
    catch(err){
        console.log("Doesn't exist a Httprobe Scan yet!");
        return false;
    }

};

module.exports = {
    testAquatone,
    getAquatone,
    callAquatone
}