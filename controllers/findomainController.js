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

//DIRS

const goDir = '~/go/bin/';

//TOOLS

const gitTool = `python3 ~/tools/github-search/github-subdomains.py`;

//DICTS
const gobusterDict = `./lists/GOBUSTER-DNS.txt`;
const altdnsDict = `./lists/ALTDNS-DICT.txt`; 

//TOKEN & APIKEYS
const gitToken = `dcef34578292f6c0cd1922d2cd1fa8146755b0ea`;

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

        
        findomain.syntax = executeFindomain(body.url, findomain.program, program.programDir);
        
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

function executeFindomain(scope, program, programDir){

    let url = scope.trim();

    let findomainDir = `${programDir}Findomain/`;

    let findoFile = `${findomainDir}findomain-${url}-${date}.txt`;
    let afinderFile = `${findomainDir}afinder-${url}-${date}.txt`;
    let subfinderFile = `${findomainDir}subfinder-${url}-${date}.txt`;
    let gobusterFile = `${findomainDir}gobuster-${url}-${date}.txt`;
    let amassFile = `${findomainDir}amass-${url}-${date}.txt`;
    let allaltFile = `${findomainDir}all-altdns-${url}-${date}.txt`;
    let auxresaltFile = `${findomainDir}aux-altdns-${url}-${date}.txt`;
    let resaltFile = `${findomainDir}altdns-${url}-${date}.txt`;
    let gitFile = `${findomainDir}git-${url}-${date}.txt`;

    let file = `${findomainDir}subdomains-${url}-${date}.txt`;


    if( fs.existsSync(findomainDir) ){
        console.log('Findomain Directory Exists.');
    } else { 
        shell.exec(`mkdir ${findomainDir}`)
    }

    try{

        var findoSyntax = `findomain -t ${url} -u ${findoFile}`;
        var subfinderSyntax = `subfinder -d ${url} -t 85 -o ${subfinderFile}`;
        var afinderSyntax = `${goDir}assetfinder --subs-only ${url} | tee -a ${afinderFile}`;
        var gobusterSyntax = `${goDir}gobuster dns -d ${url} -w ${gobusterDict} -t 100 -o ${gobusterFile}`;
        var amassSyntax = `amass enum -d ${url} -active -o ${amassFile}`;
        var altdnsSyntax = `altdns -i ${amassFile} -o ${allaltFile} -w ${altdnsDict} -t 100 -r -s ${auxresaltFile}`;
        var gitSyntax = `${gitTool} -d ${url} -t ${gitToken} | tee -a ${gitFile}`;
                


        shell.exec(findoSyntax);
        shell.exec(subfinderSyntax);
        shell.exec(afinderSyntax);
        shell.exec(gobusterSyntax);
        shell.exec(amassSyntax);
        shell.exec(altdnsSyntax);

        var altdnsReadFile = fs.readFileSync(auxresaltFile, 'UTF-8');
        var altdnsArray = altdnsReadFile.split('\n');

        altdnsArray.forEach(elem => {

            fs.appendFileSync(resaltFile,elem.split(':')[0]+'\n');
            
        })

        shell.exec(`rm ${allaltFile} ${auxresaltFile}`);

        shell.exec(gitSyntax);

        shell.exec(`cat ${findoFile} ${subfinderFile} ${afinderFile} ${gobusterFile} ${amassFile} ${resaltFile} ${gitFile} >> ${file}`);
        shell.exec(`sort -u ${file} -o ${file}`);

        shell.exec(`rm ${findoFile} ${subfinderFile} ${afinderFile} ${gobusterFile} ${amassFile} ${resaltFile} ${gitFile}`);

        saveSubdomains(program, findomainDir, file, url);

        return findoSyntax;
    }
    catch(err){
        console.log(err);
    }
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