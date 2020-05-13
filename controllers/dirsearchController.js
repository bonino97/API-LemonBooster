'use strict'

//LIBRARIES 

const shell = require('shelljs');
const dateFormat = require('dateformat');
const fs = require('fs');

//MODELS

const Dirsearch = require('../models/dirsearch');
const Program = require('../models/program');
const SingleTools = require('../models/singleTools');

//CONSTS

let date = dateFormat(new Date(), "yyyy-mm-dd-HH-MM");


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
// OBTAIN SUBDOMAINS STATUS CODES
//=====================================================================

function getSubdomainsCodes(req,res){
    
    try {

        const body = req.body;   

        const dirsearch = new Dirsearch({
            program: body.program,
            hakcheckurlFile: body.file
        });

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

            let hakcheckurlDir = `${program.programDir}Hakcheckurl/${dirsearch.hakcheckurlFile}`;

            let hakchekurlFile = returnHakcheckurlFiles(hakcheckurlDir);

            return res.status(200).json({
                ok: true,
                hakchekurlFile
            });
        });

    }
    catch(err){
        console.log(err)
    }
    
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

            console.log('##################################################');
            console.log('###############-Dirsearch Started.-###############');
            console.log('##################################################');

            dirsearch.syntax = executeDirsearch(dirsearch.url, dirsearch.list, dirsearch, dirName[2]);

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

                console.log('#################################################');
                console.log('###############-Dirsearch Finish.-###############');
                console.log('#################################################');

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
// DIRSEARCH LISTS
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


//=====================================================================
// DIRSEARCH VIA SIDEBAR ENDPOINT.
//=====================================================================

function makeDirsearchSyntax (req, res){
    
    let body = req.body;
    let recursive = '';
    let cookies = '';
    let hostname = '';
    let forceExtensions = '';
    let followRedirect = '';
    let excludeCheck = '';
    let excludeStatus = '';
    let threadCheck = '';
    let threads = '';
    let httpCheck = '';
    let httpMethod= '';

    let listFolder = `./lists/`;



    if(body.recursive == true){
        recursive = ' -r';
    }
    if(body.cookies == true){
        cookies = ' -c';
    }
    if(body.hostname == true){
        hostname = ' -b';
    }
    if(body.forceExtensions == true){
        forceExtensions = ' -f';
    }
    if(body.followRedirect == true){
        followRedirect = ' -F';
    }
    if(body.excludeCheck == true){
        excludeCheck = ' -x';
        excludeStatus = body.excludeStatus
    }
    if(body.threadCheck == true){
        threadCheck = ' -t';
        threads = body.threads;
    }
    if(body.httpCheck == true){
        httpCheck = ' --http-method=';
        httpMethod = body.httpMethod;   
    }


    let syntax = `python3 ~/tools/dirsearch/dirsearch.py -u ${body.url}${hostname}-w ${listFolder}${body.list}${recursive}${cookies}${forceExtensions}${followRedirect}${excludeCheck} ${excludeStatus}${threadCheck} ${threads}${httpCheck}${httpMethod}`; 

    res.status(200).json(
        syntax
    );

}

//=====================================================================
// EXECUTE LINKFINDER VIA SIDEBAR ENDPOINT.
//=====================================================================

function executeSidebarDirsearch (req, res){
    
    try{

        let body = req.body;
        let recursive = '';
        let cookies = '';
        let hostname = '';
        let forceExtensions = '';
        let followRedirect = '';
        let excludeCheck = '';
        let excludeStatus = '';
        let threadCheck = '';
        let threads = '';
        let listFolder = `./lists/`;
        let httpCheck = '';
        let httpMethod= '';
        
        let urlName = '';
        let singleDir = saveSingleDirsearchDirectory();

        if(body.recursive == true){
            recursive = ' -r';
        }
        if(body.cookies == true){
            cookies = ' -c';
        }
        if(body.hostname == true){
            hostname = ' -b';
        }
        if(body.forceExtensions == true){
            forceExtensions = ' -f';
        }
        if(body.followRedirect == true){
            followRedirect = ' -F';
        }
        if(body.excludeCheck == true){
            excludeCheck = ' -x';
            excludeStatus = body.excludeStatus
        }
        if(body.threadCheck == true){
            threadCheck = ' -t';
            threads = body.threads;
        }
        if(body.httpCheck == true){
            httpCheck = ' --http-method=';
            httpMethod = body.httpMethod;   
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

        let syntax = `python3 ~/tools/dirsearch/dirsearch.py -u ${body.url}${hostname} -w ${listFolder}${body.list}${recursive}${cookies}${forceExtensions}${followRedirect}${excludeCheck}${excludeStatus}${threadCheck} ${threads} -e php,html,png,js,jpg,json,xml,sql,txt,zip${httpCheck}${httpMethod} --plain-text-report=${singleDir}dirsearch-${urlName}-${date}.txt`; 

        console.log('##################################################');
        console.log('###############- Dirsearch Started -###############');
        console.log('##################################################');

        shell.exec(syntax);

        console.log('##################################################');
        console.log('###############- Dirsearch Finish -###############');
        console.log('##################################################');

        let singleTools = new SingleTools({
            syntax: syntax,
            url: body.url
        });

        singleTools.save();

        res.status(200).json({
            ok: true,
            message: 'Dirsearch Executed Correctly.',
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

function saveSingleDirsearchDirectory(){

    try {

        let singleDir = `../LemonBooster-Results/SingleTools/`;
        let dirsearchDir = `${singleDir}Dirsearch/`    
    
        if( fs.existsSync(singleDir) ){
            console.log('SingleTools Directory Exists.');
        } else { 
            shell.exec(`mkdir ${singleDir}`)
        }
    
        if( fs.existsSync(dirsearchDir) ){
            console.log('Single Dirsearch Directory Exists.');
        } else { 
            shell.exec(`mkdir ${dirsearchDir}`)
        }
    
        return dirsearchDir;

    } catch(err){
        return err
    }

}



//=====================================================================
// FUNCTIONS
//=====================================================================


function getHakcheckurlFiles(hakcheckurlDir){
    
    try{
        let hakcheckurlArray = [];

        fs.readdirSync(hakcheckurlDir).forEach(files => {
            hakcheckurlArray.push(files);
            //analyzeHakcheckurlFiles(hakcheckurlDir,files);
        });
    
        //analyzeHakcheckurlFiles(hakcheckurlDir,hakcheckurlArray[1]);
    
        return(hakcheckurlArray);
    }
    catch(err){
        return false;
    }

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

        syntax = `python3 ~/tools/dirsearch/dirsearch.py -u ${url} -w ./lists/${list} -t 60 -e php,html,png,js,jpg,json,xml,sql,txt,zip -x 404,400 --plain-text-report=${dirsearch.dirsearchDirectory}dirsearch-${dirName}-${date}.txt`;

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
    getDirsearchLists,
    makeDirsearchSyntax,
    executeSidebarDirsearch
}