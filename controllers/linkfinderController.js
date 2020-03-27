'use strict'

//LIBRARIES 

const shell = require('shelljs');
const dateFormat = require('dateformat');
const fs = require('fs');

//CONSTS

let date = dateFormat(new Date(), "yyyy-mm-dd-HH-MM");

//MODELS

const Program = require('../models/program');
const Linkfinder = require('../models/linkfinder');

//=====================================================================
// TEST ENDPOINTS
//=====================================================================

function testLinkfinder(req,res){
    res.json('GET LinkFinder - JS Link Finder.');
}

//=====================================================================
// OBTAIN DIRSEARCH PROGRAM WITH PROGRAMID
//=====================================================================

function getLinkfinderFiles(req,res){
    let id = req.params.id;

    try{
        Program.findById(id, (err, program) => {

            let hakcheckurlDir = `${program.programDir}Hakcheckurl/`;
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
    
            files = getHakcheckurlFiles(hakcheckurlDir);

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
// OBTAIN JS LINKS
//=====================================================================

function getJsLinks(req,res){
    const body = req.body;   

    const linkfinder = new Linkfinder({
        program: body.program,
        file: body.file
    });

    Program.findById(linkfinder.program, (err,program) => {   

        if(err){
            return res.status(400).json({
                ok: false,
                message: 'Error getting Program.',
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

        let hakcheckurlDirAndFile = `${program.programDir}Hakcheckurl/${linkfinder.file}`;

        let hakcheckurlFile = returnHakcheckurlLinks(hakcheckurlDirAndFile);

        return res.status(200).json({
            ok: true,
            hakcheckurlFile
        });
    });
    

}

//=====================================================================
// CALL DIRSEARCH EXECUTE FUNCTION
//=====================================================================

function callLinkfinder(req,res){

    var body = req.body;

    var linkfinder = new Linkfinder({
        program: body.program,
        link: body.link
    });

    try {

        Program.findById(linkfinder.program, (err,program) => {
            if(err){
                return res.status(400).json({
                    ok: false,
                    message: 'Error getting Program.',
                    errors: err 
                });
            }

            let programDir = program.programDir;  
            let linkName = linkfinder.link.split('/')[2];

            console.log(linkName)

            linkfinder.linkfinderDirectory = saveLinkfinderDirectory(programDir);

            console.log('##################################################');
            console.log('###############-LinkFinder Started-###############');
            console.log('##################################################');

            linkfinder.syntax = executeLinkfinder(linkfinder.link, linkfinder.linkfinderDirectory, linkName);

            linkfinder.save( (err, linkSaved) => {
                if(err){
                    return res.status(400).json({
                        ok: false,
                        message: 'Error executing Linkfinder.',
                        errors: err 
                    });
                }

                if(!linkfinder){
                    return res.status(400).json({
                        ok: false,
                        message: 'Linkfinder doesnt exists.',
                        errors: {message: 'Linkfinder doesnt exists.'}
                    });
                }

                console.log('#################################################');
                console.log('###############-LinkFinder Finish.-###############');
                console.log('#################################################');

                res.status(200).json({
                    ok: true,
                    message: 'Linkfinder Executed Correctly.',
                    linkfinder: linkSaved
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

function getHakcheckurlFiles(hakrawlerDir){
    let hakrawlerArray = [];

    fs.readdirSync(hakrawlerDir).forEach(files => {
        hakrawlerArray.push(files);
    });

    return(hakrawlerArray);
}

function returnHakcheckurlLinks(hakcheckurlFile){

    let hakcheckurlResult = [];

    hakcheckurlResult = fs.readFileSync(hakcheckurlFile, {encoding: 'utf-8'}).split('\n');
    
    return hakcheckurlResult;

}

function saveLinkfinderDirectory(programDir){

    let linkfinderDir = `${programDir}Linkfinder/`;

    if( fs.existsSync(linkfinderDir) ){
        console.log('Dirsearch Directory Exists.');
    } else { 
        shell.exec(`mkdir ${linkfinderDir}`)
    }

    return linkfinderDir;

}

function executeLinkfinder(link, linkfinderDir, linkName){

    let syntax = String;
    
    try{

        syntax = `python3 ~/tools/LinkFinder/linkfinder.py -i ${link} -d -o ${linkfinderDir}linkfinder-${linkName}-${date}.html`;

        shell.exec(syntax);
    }
    catch(err){
        console.log(err);
    }

    return syntax;
}

module.exports = {
    testLinkfinder,
    getLinkfinderFiles,
    getJsLinks,
    callLinkfinder
}