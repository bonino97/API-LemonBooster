'use strict'

//LIBRARIES 

const shell = require('shelljs');
const dateFormat = require('dateformat');
const fs = require('fs');

//MODELS

const Httprobe = require('../models/httprobe');
const Findomain = require('../models/findomain');
const Program = require('../models/program');
const Subdomain = require('../models/subdomain');

//CONSTS

let date = dateFormat(new Date(), "yyyy-mm-dd-HH-MM");


//=====================================================================
// TEST ENDPOINTS
//=====================================================================

function getHttprobe(req,res){
    res.json('GET Httprobe - Subdomain Response Scanner.');
}


//=====================================================================
// CALL HTTPROBE EXECUTE FUNCTION
//=====================================================================

function callHttprobe(req,res){
    
    const body = req.body;

    const httprobe = new Httprobe({
        subdomain: body.subdomain,
        program: body.program,
        httprobeDirectory: '',
        httprobeFiles: []
    });
    
    let subdomainsArray = [];

    Program.findById(httprobe.program, (err, program) => {

        let programUrl = program.domain;
        let programDir = program.programDir;

        if(err){
            return res.status(400).json({
                ok: false,
                message: 'Error getting Program.',
                errors: err 
            });
        }
        
        Subdomain.findById(httprobe.subdomain, (err, subdomain) => {

            let subdomainsDirectory = subdomain.subdomainsDirectory;

            if(err){
                return res.status(400).json({
                    ok: false,
                    message: 'Error getting Subdomain.',
                    errors: err 
                });
            }

            
            //subdomainsArray = subdomains.toString().split('\n'); // IMPORTANT BUT NOT NOW.

            httprobe.url = subdomain.subdomain;
            httprobe.httprobeFiles = getHttprobeFiles(subdomainsDirectory);
            httprobe.httprobeDirectory = saveHttprobeDirectory(programDir);
            httprobe.syntax = executeHttprobe(httprobe, subdomainsDirectory);
            httprobe.save();

            res.json(httprobe);
        });
    });
}

function executeHttprobe(httprobe, subdomainsDirectory){

    let syntax = String;
    let file = `${subdomainsDirectory}${httprobe.httprobeFiles[0]}`;

    syntax = `cat ${file} | httprobe | tee ${httprobe.httprobeDirectory}httprobe-${httprobe.url}-${date}.txt`;

    shell.echo(syntax);

    return syntax;

}

function getHttprobeFiles(subdomainsDirectory) {

    let httprobeArray = [];

    fs.readdirSync(subdomainsDirectory).forEach(files => {
        httprobeArray.push(files);
    });

    return(httprobeArray);
}

function saveHttprobeDirectory(programDir){
    let httprobeDir = `${programDir}Httprobe/`;

    if( fs.existsSync(httprobeDir) ){
        console.log('Httprobe Directory Exists.');
    } else { 
        shell.exec(`mkdir ${httprobeDir}`)
    }

    return httprobeDir;
}

module.exports = {
    getHttprobe,
    callHttprobe
}