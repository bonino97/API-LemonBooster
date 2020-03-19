'use strict'

//LIBRARIES 

const shell = require('shelljs');
const dateFormat = require('dateformat');
const fs = require('fs');

//MODELS
const Subjack = require('../models/subjack');
const Program = require('../models/program');

//CONSTS

let date = dateFormat(new Date(), "yyyy-mm-dd-HH-MM");

//=====================================================================
// TEST SUBJACK ENDPOINT
//=====================================================================

function testSubjack(req,res){
    res.status(200).json('GET Subjack Works!')
}


//=====================================================================
// OBTAIN SUBJACK PROGRAM WITH PROGRAMID
//=====================================================================

function getSubjack(req,res){
    let id = req.params.id;

    Program.findById(id, (err, program) => {

        let subdomainDir = `${program.programDir}Findomain/`;

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

        let subdomainFiles = getSubjackFiles(subdomainDir);

        return res.status(200).json({
            ok: true,
            subdomainFiles
        });

    });
}


//=====================================================================
// CALL SUBJACK EXECUTE FUNCTION
//=====================================================================

function callSubjack(req,res){
    
    const body = req.body;

    const subjack = new Subjack({
        program: body.program,
        findoFile: body.file,
        subjackDirectory: ''
    });

    try {

        Program.findById(subjack.program, (err, program) => {

            if(err){
                return res.status(400).json({
                    ok: false,
                    message: 'Error getting Program.',
                    errors: err 
                });
            }

            let programDir = program.programDir;            
            let subdomainsDirectory = `${program.programDir}Findomain/`;
            let fileName = subjack.findoFile.split('-');
            

            subjack.url = fileName[1];
            subjack.subjackDirectory = saveSubjackDirectory(programDir);

            console.log('################################################');
            
            console.log('###############-Subjack Started.-###############');
            
            console.log('################################################');

            subjack.syntax = executeSubjack(subjack, subdomainsDirectory);

            subjack.save((err,subjackSaved) => {

                if(err){
                    return res.status(400).json({
                        ok: false,
                        message: 'Error executing Subjack.',
                        errors: err 
                    });
                }

                if(!subjack){
                    return res.status(400).json({
                        ok: false,
                        message: 'Subjack doesnt exists.',
                        errors: {message: 'Subjack doesnt exists.'}
                    });
                }

                console.log('################################################');
            
                console.log('###############-Subjack Finish.-###############');
                
                console.log('################################################');
    
                res.status(200).json({
                    ok: true,
                    message: 'Subjack Executed Correctly.',
                    subjack: subjackSaved
                });
            });
        });

    } catch(err) {
        console.log(err);
    }
}

function executeSubjack(subjack, subdomainsDirectory){

    let syntax = String;
    let file = `${subdomainsDirectory}${subjack.findoFile}`;


    //syntax = `~/go/bin/subjack -w ~/recon/starbucks/all-dom/subdomains2.starbucks.txt -ssl -o ${subjack.subjackDirectory}subjack-${subjack.url}-${date}.txt -c ~/go/src/github.com/haccer/subjack/fingerprints.json`;
    syntax = `~/go/bin/subjack -w ${file} -ssl -o ${subjack.subjackDirectory}subjack-${subjack.url}-${date}.txt -c ~/go/src/github.com/haccer/subjack/fingerprints.json`;

    shell.exec(syntax);

    return syntax;

}

function getSubjackFiles(subdomainsDirectory) {

    let findomainArray = [];

    fs.readdirSync(subdomainsDirectory).forEach(files => {
        findomainArray.push(files);
    });

    return(findomainArray);
}

function saveSubjackDirectory(programDir){
    let subjackDir = `${programDir}Subjack/`;

    if( fs.existsSync(subjackDir) ){
        console.log('Subjack Directory Exists.');
    } else { 
        shell.exec(`mkdir ${subjackDir}`)
    }

    return subjackDir;
}

module.exports = {
    getSubjack,
    callSubjack,
    testSubjack
}