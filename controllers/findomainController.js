'use strict'

//LIBRARIES

const dateFormat = require('dateformat');
const shell = require('shelljs');
const fs = require('fs');


//MODELS 

const Findomain = require('../models/findomain');
const Program = require('../models/program');
const Subdomain = require('../models/subdomain');

//CONSTS

let date = dateFormat(new Date(), "yyyy-mm-dd-HH:MM");



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
    })

    Program.findById(findomain.program, (err, program) => {

        if(err){
            return res.status(400).json({
                ok: false,
                message: 'Error getting program.',
                errors: err 
            });
        }
    });

    if(body.resolvable === '1'){
        findomain.resolvable = true;
        findomain.syntax = executeFindomain(body.url, true);
    } else {
        findomain.resolvable = false;
        findomain.syntax = executeFindomain(body.url, false);
    }
    
    findomain.save((err,findoSaved) => {
        
        if(!findomain.url){
            return res.status(400).json({
                ok: false,
                message: 'Findomain URL not exists.',
                errors: {message: 'Findomain URL not exists'}
            });
        }
        
        res.status(200).json({
            ok:true,
            findomain: findoSaved,
        });
    });
}


//=====================================================================
// EXECUTE FINDOMAIN
//=====================================================================

function executeFindomain(scope, resolvable){

    let syntax = String;
    let url = scope.trim();
    let subdomainsFolder = `./results/findomain/findomain-${url}-${date}.txt`;

    let subdomainsTesting = `./results/findomain/testing.txt`;


    try{

        if(resolvable){
            syntax = `findomain -t ${url} -r -u ${subdomainsFolder}`;
        } else {
            syntax = `findomain -t ${url} -u ${subdomainsFolder}`;
        }

        shell.exec(syntax);

        saveSubdomains(subdomainsFolder);
    }
    catch(err){
        console.log(err);
    }
    return syntax.toString();
}

function saveSubdomains(subdomainsFolder){
    let subdomainsArray = [];
    let body = req.body;

    let subdomains = new Subdomain({
        subdomain: [],
        program: body.program
    })
    

    fs.readFile(subdomainsFolder, 'utf-8', (error, data) => {
    
        if(error){
            throw error;
        }

        subdomainsArray.push(data);
        console.log(`All Subdomains Saved in ${subdomainsFolder}`);
        subdomainsArray.forEach(element => {
            subdomains.subdomain.push(element);
        });
        subdomains.save();
    });
}


module.exports = {
    getFindomain,
    callFindomain
}