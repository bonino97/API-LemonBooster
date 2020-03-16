'use strict'

//LIBRARIES 

const shell = require('shelljs');
const dateFormat = require('dateformat');
const fs = require('fs');

//MODELS

const Httprobe = require('../models/httprobe');
const Program = require('../models/program');
const Subdomain = require('../models/subdomain');

//CONSTS

let date = dateFormat(new Date(), "yyyy-mm-dd-HH-MM");


//=====================================================================
// OBTAIN HTTPROBE PROGRAM WITH PROGRAMID
//=====================================================================

function getHttprobe(req,res){
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

        let subdomainFiles = getHttprobeFiles(subdomainDir);

        return res.status(200).json({
            ok: true,
            subdomainFiles
        });

    });
}


//=====================================================================
// CALL HTTPROBE EXECUTE FUNCTION
//=====================================================================

function callHttprobe(req,res){
    
    const body = req.body;

    const httprobe = new Httprobe({
        program: body.program,
        findoFile: body.file,
        httprobeDirectory: ''
    });
    

    Program.findById(httprobe.program, (err, program) => {

        let programDir = program.programDir;

        if(err){
            return res.status(400).json({
                ok: false,
                message: 'Error getting Program.',
                errors: err 
            });
        }
        
        

        Subdomain.find({subdomainFile: {$regex: /findoFile$/}}, (err, subdomain) => {


            let subdomainsDirectory = `${program.programDir}Findomain/`;
            
            console.log(subdomain)

            if(err){
                return res.status(400).json({
                    ok: false,
                    message: 'Error getting Subdomain.',
                    errors: err 
                });
            }

            
            //subdomainsArray = subdomains.toString().split('\n'); // IMPORTANT BUT NOT NOW.

            httprobe.url = subdomain.subdomain;
            httprobe.httprobeDirectory = saveHttprobeDirectory(programDir);
            httprobe.syntax = executeHttprobe(httprobe, subdomainsDirectory);
            httprobe.save();

            res.json(httprobe);
        }).limit(1);
    });
}

function executeHttprobe(httprobe, subdomainsDirectory){

    let syntax = String;
    let file = `${subdomainsDirectory}${httprobe.findoFile}`;

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