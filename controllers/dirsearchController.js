'use strict'

//LIBRARIES 

const shell = require('shelljs');
const dateFormat = require('dateformat');
const fs = require('fs');

//MODELS

const Dirsearch = require('../models/dirsearch');
const Program = require('../models/program');

//CONSTS

let date = dateFormat(new Date(), "yyyy-mm-dd-HH:MM");


//=====================================================================
// TEST ENDPOINTS
//=====================================================================

function testDirsearch(req,res){
    res.json('GET Dirsearch - Directory Brute Forcing Enabled.');
}

//=====================================================================
// OBTAIN DIRSEARCH PROGRAM WITH PROGRAMID
//=====================================================================

function getDirsearchFiles(req,res){
    let id = req.params.id;

    try{
        Program.findById(id, (err, program) => {

            let hakcheckurlDir = `${program.programDir}Hakcheckurl/`;
            let httprobeDir = `${program.programDir}Httprobe/`;
            let files = [];
    
            if(err){
                return res.status(400).json({
                    ok: false,
                    message: 'Error getting program.',
                    errors: err 
                });
            }

            console.log(err);
    
            if(!program){
                return res.status(500).json({
                    ok: false,
                    message: 'Doesnt exist program with this id.' ,
                    error: { message: 'Doesnt exist program with this id.' }
                });
            }
    
            files = getHakcheckurlFiles(hakcheckurlDir);
    
            console.log(files);

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
// OBTAIN SUBDOMAINS STATUS CODES
//=====================================================================

function getSubdomainsCodes(req,res){
    const body = req.body;   

    const dirsearch = new Dirsearch({
        program: body.program,
        hakcheckurlFile: body.file
    });

    console.log(dirsearch);

    Program.findById(dirsearch.program, (err,program) => {   

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

        console.log(program);

        let hakcheckurlDir = `${program.programDir}Hakcheckurl/${dirsearch.hakcheckurlFile}`;

        let hakchekurlFile = returnHakcheckurlFiles(hakcheckurlDir);

        return res.status(200).json({
            ok: true,
            hakchekurlFile
        });
    });
    

}


//=====================================================================
// CALL DIRSEARCH EXECUTE FUNCTION
//=====================================================================

function callDirsearch(req,res){

    var body = req.body;

    var dirsearch = new Dirsearch({
        program: body.program,
        url: body.subdomain,
        list: body.list
    });

    try {

        Program.findById(dirsearch.program, (err,program) => {
            if(err){
                return res.status(400).json({
                    ok: false,
                    message: 'Error getting Program.',
                    errors: err 
                });
            }

            let programDir = program.programDir;  
            let dirName = dirsearch.url.split('/');

            dirsearch.dirsearchDirectory = saveDirsearchDirectory(programDir);
            console.log(dirsearch.list);
            dirsearch.syntax = executeDirsearch(dirsearch.url, dirsearch.list, dirsearch, dirName[2]);

            console.log(dirsearch.list);

            dirsearch.save( (err, dirSaved) => {
                if(err){
                    return res.status(400).json({
                        ok: false,
                        message: 'Error executing Dirsearch.',
                        errors: err 
                    });
                }

                if(!dirsearch){
                    return res.status(400).json({
                        ok: false,
                        message: 'Dirsearch doesnt exists.',
                        errors: {message: 'Dirsearch doesnt exists.'}
                    });
                }

                console.log('################################################');
                console.log('###############-Dirsearch Finish.-###############');
                console.log('################################################');

                res.status(200).json({
                    ok: true,
                    message: 'Dirsearch Executed Correctly.',
                    dirsearch: dirSaved
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


function getDirsearchLists(req,res){
    let listsArray = [];
    let listFolder = `./lists/`;

    try{

        if(!listFolder){
            return res.status(400).json({
                ok: false,
                message: 'Wrong List Folder' ,
                error: { message: 'Wrong List Folder' }
            });
        }

        fs.readdirSync(listFolder).forEach(files => {
            listsArray.push(files);
        });
    
        return res.status(200).json({
            ok: true,
            listsArray
        });

    }
    catch(error){
        console.log(error);
    }



}

function getHakcheckurlFiles(hakcheckurlDir){
    let hakcheckurlArray = [];

    fs.readdirSync(hakcheckurlDir).forEach(files => {
        hakcheckurlArray.push(files);
        //analyzeHakcheckurlFiles(hakcheckurlDir,files);
    });

    //analyzeHakcheckurlFiles(hakcheckurlDir,hakcheckurlArray[1]);

    return(hakcheckurlArray);
}

function getHttprobeFiles(httprobeDir){
    let httprobeArray = [];

    fs.readdirSync(httprobeDir).forEach(files => {
        httprobeArray.push(files);
        //analyzeHakcheckurlFiles(hakcheckurlDir,files);
    });

    //analyzeHakcheckurlFiles(hakcheckurlDir,hakcheckurlArray[1]);

    return(httprobeArray);
}



function returnHakcheckurlFiles(hakcheckurlFile){

    let hakcheckurlResult = [];

    hakcheckurlResult = fs.readFileSync(hakcheckurlFile, {encoding: 'utf-8'}).split('\n');
    
    return hakcheckurlResult;

}

function executeDirsearch(url, list, dirsearch, dirName){

    let syntax = String;
    
    try{

        console.log(list);

        syntax = `python3 ~/tools/dirsearch/dirsearch.py -u ${url} -w ./lists/${list} -e php,html,png,js,jpg,json,xml,sql,txt,zip -x 404,400 --plain-text-report=${dirsearch.dirsearchDirectory}dirsearch-${dirName}-${date}.txt`;

        shell.exec(syntax);
    }
    catch(err){
        console.log(err);
    }

    return syntax;
}

function saveDirsearchDirectory(programDir){

    let dirsearchDir = `${programDir}Dirsearch/`;

    if( fs.existsSync(dirsearchDir) ){
        console.log('Dirsearch Directory Exists.');
    } else { 
        shell.exec(`mkdir ${dirsearchDir}`)
    }

    return dirsearchDir;

}

module.exports = {
    getDirsearchFiles,
    callDirsearch,
    testDirsearch,
    getSubdomainsCodes,
    getDirsearchLists
}