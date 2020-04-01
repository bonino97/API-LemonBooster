'use strict'

//LIBRARIES

const dateFormat = require('dateformat');
const shell = require('shelljs');
const fs = require('fs');


//MODELS 

const Findomain = require('../models/findomain');
const Program = require('../models/program');
const Subdomain = require('../models/subdomain');
const SingleTools = require('../models/singleTools');

//CONSTS

let date = dateFormat(new Date(), "yyyy-mm-dd-HH-MM");



//=====================================================================
// TEST ENDPOINTS
//=====================================================================

function getFindomain(req,res){
    res.json('GET Findomain Enumeration');
}

//=====================================================================
// CALL EXECUTE FUNCTION WITH HTTPCLIENT
//=====================================================================


function callFindomain(req, res){
    var body = req.body;

    var findomain = new Findomain({
        url: body.url,
        program: body.program
    });

    

    Program.findById(findomain.program, (err, program) => {

        if(err){
            return res.status(400).json({
                ok: false,
                message: 'Error getting program.',
                errors: err 
            });
        }

        if(body.resolvable === '1'){
            findomain.resolvable = true;
            findomain.syntax = executeFindomain(body.url, findomain.program, program.programDir, true);
        } else {
            findomain.resolvable = false;
            findomain.syntax = executeFindomain(body.url, findomain.program, program.programDir, false);
        }
        
        findomain.save((err,findoSaved) => {
            
            if(err){
                return res.status(400).json({
                    ok: false,
                    message: 'Error executing Findomain.',
                    errors: err 
                });
            }

            if(!findomain.url){
                return res.status(400).json({
                    ok: false,
                    message: 'Findomain URL not exists.',
                    errors: {message: 'Findomain URL not exists'}
                });
            }
            
            res.status(200).json({
                ok:true,
                message: 'Findomain Executed Correctly.',
                findomain: findoSaved
            });
        });
    });
}


//=====================================================================
// EXECUTE FINDOMAIN
//=====================================================================

function executeFindomain(scope, program, programDir, resolvable){

    let syntax = String;
    let url = scope.trim();
    let findomainDir = `${programDir}Findomain/`;
    let file = `${findomainDir}findomain-${url}-${date}.txt`;


    if( fs.existsSync(findomainDir) ){
        console.log('Findomain Directory Exists.');
    } else { 
        shell.exec(`mkdir ${findomainDir}`)
    }

    try{

        if(resolvable){
            syntax = `findomain -t ${url} -r -u ${file}`;
        } else {
            syntax = `findomain -t ${url} -u ${file}`;
        }

        shell.exec(syntax);

        saveSubdomains(program, findomainDir, file, url);
    }
    catch(err){
        console.log(err);
    }
    return syntax.toString();
}

function saveSubdomains(program, programDir, file, url){
    let subdomainsArray = [];
    let subdomains = new Subdomain({
        subdomain: url,
        program: program,
        subdomainsDirectory: programDir,
        subdomainFile: file
    })
    
    subdomains.save();

    // fs.readFile(file, 'utf-8', (error, data) => {
    
    //     if(error){
    //         throw error;
    //     }

    //     subdomainsArray.push(data);
    //     console.log(`All Subdomains Saved in ${file}`);
    //     subdomainsArray.forEach(element => {
    //         subdomains.subdomain.push(element);
    //     });
    //     subdomains.save();
    // });
}


//=====================================================================
// FINDOMAIN VIA SIDEBAR ENDPOINT.
//=====================================================================

function getFindomainSyntax (req, res){
    
    let body = req.body;
    let resolvable = '';

    if(body.resolvable == true){
        resolvable = '-r';
    }

    let syntax = `findomain -t ${body.url} ${resolvable}`; 

    res.status(200).json(
        syntax
    );

}

//=====================================================================
// EXECUTE FINDOMAIN VIA SIDEBAR ENDPOINT.
//=====================================================================

function executeSidebarFindomain (req, res){
    
    try{

        let body = req.body;
        let resolvable = '';

        let urlName = body.url;
        let singleDir = saveSingleFindomainDirectory();

        if(body.resolvable == true){
            resolvable = ' -r';
        }

        let syntax = `findomain -t ${body.url}${resolvable} -u ${singleDir}findomain-${urlName}-${date}.txt`; 

        console.log('##################################################');
        console.log('###############-Findomain Started-###############');
        console.log('##################################################');

        shell.exec(syntax);

        console.log('##################################################');
        console.log('###############-Findomain Finish-###############');
        console.log('##################################################');

        let singleTools = new SingleTools({
            syntax: syntax,
            url: body.url
        });

        singleTools.save();

        res.status(200).json({
            ok: true,
            message: 'Findomain Executed Correctly.',
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

function saveSingleFindomainDirectory(){

    let singleDir = `./results/SingleTools/`;
    let findomainDir = `${singleDir}Findomain/`    

    if( fs.existsSync(singleDir) ){
        console.log('SingleTools Directory Exists.');
    } else { 
        shell.exec(`mkdir ${singleDir}`)
    }

    if( fs.existsSync(findomainDir) ){
        console.log('Single Findomain Directory Exists.');
    } else { 
        shell.exec(`mkdir ${findomainDir}`)
    }

    return findomainDir;

}


module.exports = {
    getFindomain,
    callFindomain,
    getFindomainSyntax,
    executeSidebarFindomain
}