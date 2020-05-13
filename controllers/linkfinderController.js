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
const SingleTools = require('../models/singleTools');

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

            if(!files){
                return res.status(500).json({
                    ok: false,
                    message: 'Execute Hakcheckurl first.',
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
// CALL LINKFINDER EXECUTE FUNCTION
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
// LINKFINDER VIA SIDEBAR ENDPOINT.
//=====================================================================

function getLinkfinderSyntax (req, res){
    
    let body = req.body;
    let domain = '';
    let cookies = '';

    if(body.domain == true){
        domain = '-d';
    }
    if(body.cookies == true){
        cookies = '-c';
    }

    let syntax = `python3 ~/tools/LinkFinder/linkfinder.py -i ${body.url} ${domain} ${cookies}`; 

    res.status(200).json(
        syntax
    );

}

//=====================================================================
// EXECUTE LINKFINDER VIA SIDEBAR ENDPOINT.
//=====================================================================

function executeSidebarLinkFinder (req, res){
    
    try{

        let body = req.body;
        let domain = '';
        let cookies = '';
        let urlName = '';
        let singleDir = saveSingleLinkfinderDirectory();

        if(body.domain == true){
            domain = ' -d';
        }
        if(body.cookies == true){
            cookies = ' -c';
        }

        if(body.url.indexOf('http') === -1){

            if(body.url.indexOf('/') === -1){
                urlName = body.url;
            } else {
                urlName = body.url.split('/')[0];
            }
        } else {
            urlName = body.url.split('/')[2];
        }

        let syntax = `python3 ~/tools/LinkFinder/linkfinder.py -i ${body.url}${domain}${cookies} -o ${singleDir}linkfinder-${urlName}-${date}.html`; 

        console.log('##################################################');
        console.log('###############-LinkFinder Started-###############');
        console.log('##################################################');

        shell.exec(syntax);

        console.log('##################################################');
        console.log('###############-LinkFinder Finish-###############');
        console.log('##################################################');

        let singleTools = new SingleTools({
            syntax: syntax,
            url: body.url
        });

        singleTools.save();

        res.status(200).json({
            ok: true,
            message: 'Linkfinder Executed Correctly.',
            syntax: syntax,
            directory: singleDir,
            singleTools
        });
    }
    catch(error){
        console.log(error);
    }
}


//=====================================================================
// SINGLE TOOLS FUNCTIONS
//=====================================================================

function saveSingleLinkfinderDirectory(){

    let singleDir = `../LemonBooster-Results/SingleTools/`;
    let linkfinderDir = `${singleDir}LinkFinder/`    

    if( fs.existsSync(singleDir) ){
        console.log('SingleTools Directory Exists.');
    } else { 
        shell.exec(`mkdir ${singleDir}`)
    }

    if( fs.existsSync(linkfinderDir) ){
        console.log('Single LinkFinder Directory Exists.');
    } else { 
        shell.exec(`mkdir ${linkfinderDir}`)
    }

    return linkfinderDir;

}


//=====================================================================
// FUNCTIONS
//=====================================================================

function getHakcheckurlFiles(hakrawlerDir){

    try {
        let hakrawlerArray = [];

        fs.readdirSync(hakrawlerDir).forEach(files => {
            hakrawlerArray.push(files);
        });
    
        return(hakrawlerArray);
    }
    catch(err){
        return false;
    }
}

function returnHakcheckurlLinks(hakcheckurlFile){

    let hakcheckurlResult = [];

    hakcheckurlResult = fs.readFileSync(hakcheckurlFile, {encoding: 'utf-8'}).split('\n');
    
    return hakcheckurlResult;

}

function saveLinkfinderDirectory(programDir){

    let linkfinderDir = `${programDir}Linkfinder/`;

    if( fs.existsSync(linkfinderDir) ){
        console.log('LinkFinder Directory Exists.');
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
    callLinkfinder,
    getLinkfinderSyntax,
    executeSidebarLinkFinder
}