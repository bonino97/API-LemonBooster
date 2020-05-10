'use strict'

//LIBRARIES 

const shell = require('shelljs');
const dateFormat = require('dateformat');
const fs = require('fs');

//MODELS

const Httprobe = require('../models/httprobe');
const Program = require('../models/program');

//CONSTS

let date = dateFormat(new Date(), "yyyy-mm-dd-HH-MM");

//=====================================================================
// TEST HTTPROBE ENDPOINT
//=====================================================================

function testHttprobe(req,res){
    res.status(200).json('GET HTTProbe Works!')
}


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

        if(!subdomainFiles){
            return res.status(500).json({
                ok: false,
                message: 'Execute Subdomain Enumeration first.',
                error: err
            });
        }

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

    try {

        Program.findById(httprobe.program, (err, program) => {

            if(err){
                return res.status(400).json({
                    ok: false,
                    message: 'Error getting Program.',
                    errors: err 
                });
            }

            let programDir = program.programDir;            
            let subdomainsDirectory = `${program.programDir}Findomain/`;
            let fileName = httprobe.findoFile.split('-');
            let allendpointsDir = saveAllEndpointsDirectory(programDir);

            httprobe.url = fileName[1];
            httprobe.httprobeDirectory = saveHttprobeDirectory(programDir);

            
            console.log('################################################');
            
            console.log('###############-HTTProbe Started.-###############');
            
            console.log('################################################');

            httprobe.syntax = executeHttprobe(httprobe, subdomainsDirectory, allendpointsDir);
            
            httprobe.save((err,httprobeSaved) => {
                
                if(err){
                    return res.status(400).json({
                        ok: false,
                        message: 'Error executing HTTProbe.',
                        errors: err 
                    });
                }

                if(!httprobe){
                    return res.status(400).json({
                        ok: false,
                        message: 'HTTProbe doesnt exists.',
                        errors: {message: 'HTTProbe doesnt exists.'}
                    });
                }

                console.log('################################################');
            
                console.log('###############-HTTProbe Finish.-###############');
                
                console.log('################################################');
    
                res.status(200).json({
                    ok: true,
                    message: 'HTTProbe Executed Correctly.',
                    httprobe: httprobeSaved
                });
            });
        });

    } catch(err) {
        console.log(err);
        res.status(500).json({
            ok: false,
            message: 'Error executing tool',
            error: err
        });
    }
}

function executeHttprobe(httprobe, subdomainsDirectory, allendpointsDir){

    let syntax = '';
    let file = `${subdomainsDirectory}${httprobe.findoFile}`;
    let allEndpointsFile = `${allendpointsDir}AllEndpoints.txt`;
    let httprobeFile = `${httprobe.httprobeDirectory}httprobe-${httprobe.url}-${date}.txt`;

    syntax = `cat ${file} | ~/go/bin/httprobe | tee -a ${httprobeFile}`;

    shell.exec(syntax);

    shell.exec(`cat ${httprobeFile} >> ${allEndpointsFile}`);
    shell.exec(`sort -u ${allEndpointsFile} -o ${allEndpointsFile}`);

    return syntax;

}

function getHttprobeFiles(subdomainsDirectory) {

    try {

        let httprobeArray = [];

        fs.readdirSync(subdomainsDirectory).forEach(files => {
            httprobeArray.push(files);
        });
    
        return(httprobeArray);

    }
    catch(err){
        console.log("Doesn't exist a Findomain Scan yet!");
        return false;
    }
}

function saveAllEndpointsDirectory(programDir){

    let crawlersDir = `${programDir}Crawlers/`;

    if( fs.existsSync(crawlersDir) ){
        console.log('Crawler Directory Exists.');
    } else { 
        shell.exec(`mkdir ${crawlersDir}`)
    }

    let allendpointsDir = `${crawlersDir}AllEndpoints/`;

    if( fs.existsSync(allendpointsDir) ){
        console.log('Params Directory Exists.');
    } else { 
        shell.exec(`mkdir ${allendpointsDir}`)
    }

    return allendpointsDir;
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
    callHttprobe,
    testHttprobe
}