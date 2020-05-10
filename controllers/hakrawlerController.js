'use strict'

//LIBRARIES 

const shell = require('shelljs');
const dateFormat = require('dateformat');
const fs = require('fs');

//MODELS
const Program = require('../models/program');
const Hakrawler = require('../models/hakrawler');

//CONSTS

let date = dateFormat(new Date(), "yyyy-mm-dd-HH-MM");

//=====================================================================
// TEST ENDPOINTS
//=====================================================================

function TestHakrawler(req,res){
    res.json('GET Hakrawler - Web Crawling Enabled.');
}

//=====================================================================
// OBTAIN HAKRAWLER PROGRAM WITH PROGRAMID
//=====================================================================

function GetHakrawlerFiles(req,res){
    let id = req.params.id;

    try{
        Program.findById(id, (err, program) => {

            let findomainDir = `${program.programDir}Findomain/`;
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
    
            files = GetFindomainFiles(findomainDir);
            
            if(!files){
                return res.status(500).json({
                    ok: false,
                    message: 'Execute Subdomain Enumeration first.',
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
// CALL HAKRAWLER EXECUTE FUNCTION
//=====================================================================

function CallHakrawler(req,res){

    var body = req.body;

    var hakrawler = new Hakrawler({
        program: body.program,
        url: body.url,
        findomainFile: body.findomainFile
    });

    try {

        Program.findById(hakrawler.program, (err,program) => {
            if(err){
                return res.status(400).json({
                    ok: false,
                    message: 'Error getting Program.',
                    errors: err 
                });
            }

            let programDir = program.programDir;  

            let paramsDir = SaveParamsDirectory(programDir);

            hakrawler.hakrawlerDirectory = SaveHakrawlerDirectory(programDir);

            let allEndpointsDir = SaveAllEndpointsDirectory(hakrawler.hakrawlerDirectory);

            console.log('##################################################');
            console.log('###############-HAKRAWLER STARTED.-###############');
            console.log('##################################################');

            hakrawler.syntax = ExecuteHakrawler(hakrawler.findomainFile, programDir, hakrawler, paramsDir, allEndpointsDir);

            
            console.log('#################################################');
            console.log('###############-HAKRAWLER FINISH.-###############');
            console.log('#################################################');


            hakrawler.save( (err, hakrawlerSaved) => {
                if(err){
                    return res.status(400).json({
                        ok: false,
                        message: 'Error executing Hakrawler.',
                        errors: err 
                    });
                }

                if(!hakrawler){
                    return res.status(400).json({
                        ok: false,
                        message: 'Hakrawler doesnt exists.',
                        errors: {message: 'Hakrawler doesnt exists.'}
                    });
                }

                res.status(200).json({
                    ok: true,
                    message: 'Hakrawler Executed Correctly.',
                    hakrawler: hakrawlerSaved
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

function GetFindomainFiles(findomainDir){
    
    try{
        let findomainArray = [];

        fs.readdirSync(findomainDir).forEach(files => {
            findomainArray.push(files);
        });
    
        return(findomainArray);
    }   
    catch(err){
        return false;
    }
}

function SaveHakrawlerDirectory(programDir){

    let crawlersDir = `${programDir}Crawlers/`;

    if( fs.existsSync(crawlersDir) ){
        console.log('Crawlers Directory Exists.');
    } else { 
        shell.exec(`mkdir ${crawlersDir}`)
    }
    
    return crawlersDir;

}

function SaveParamsDirectory(programDir){

    let paramsDir = `${programDir}ParamsFiles/`;

    if( fs.existsSync(paramsDir) ){
        console.log('Params Directory Exists.');
    } else { 
        shell.exec(`mkdir ${paramsDir}`)
    }

    return paramsDir;
}

function SaveAllEndpointsDirectory(crawlersDir){

    let allendpointsDir = `${crawlersDir}AllEndpoints/`;

    if( fs.existsSync(allendpointsDir) ){
        console.log('Params Directory Exists.');
    } else { 
        shell.exec(`mkdir ${allendpointsDir}`)
    }

    return allendpointsDir;
}


function ExecuteHakrawler(findomainFile, programDir, hakrawler, paramsDir, allEndpointsDir){

    let syntax = '';
    let findomainDir = `${programDir}Findomain/`;
    let hakrawlerFile = `${hakrawler.hakrawlerDirectory}hakrawler-${hakrawler.url}-${date}.txt`;

    try{

        syntax = `cat ${findomainDir}${findomainFile} | ~/go/bin/hakrawler -plain -depth 2 | tee -a ${hakrawlerFile}`;

        shell.exec(syntax);
        shell.exec(`sort -u ${hakrawlerFile} -o ${hakrawlerFile}`);

        shell.exec(`cat ${hakrawlerFile} >> ${allEndpointsDir}/AllEndpoints.txt`);
        shell.exec(`sort -u ${allEndpointsDir}/AllEndpoints.txt -o ${allEndpointsDir}/AllEndpoints.txt`);

        shell.exec(`cat ${hakrawlerFile} | grep "forward=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "dest=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "redirect=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "uri=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "path=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "continue=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "url=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "window=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "to=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "out=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "view=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "dir=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "show=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "navigation=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "open=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "domain=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "callback=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "return=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "page=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "feed=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "host=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "site=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "html=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "reference=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "file=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "return_to=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "fetch=" >> ${paramsDir}OpenRedirectsParams.txt`);

        shell.exec(`cat ${hakrawlerFile} | grep "select=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "report=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "role=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "update=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "query=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "user=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "name=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "sort=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "where=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "search=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "params=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "process=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "row=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "view=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "table=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "from=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "sel=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "results=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "sleep=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "fetch=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "order=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "keyword=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "column=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "field=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "delete=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "filter=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "alter=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "create=" >> ${paramsDir}SQLiParams.txt`);

        shell.exec(`cat ${hakrawlerFile} | grep "file=" >> ${paramsDir}LFIParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "document=" >> ${paramsDir}LFIParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "pg=" >> ${paramsDir}LFIParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "root=" >> ${paramsDir}LFIParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "folder=" >> ${paramsDir}LFIParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "path=" >> ${paramsDir}LFIParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "style=" >> ${paramsDir}LFIParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "pdf=" >> ${paramsDir}LFIParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "template=" >> ${paramsDir}LFIParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "php_path=" >> ${paramsDir}LFIParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "doc=" >> ${paramsDir}LFIParams.txt`);

        shell.exec(`cat ${hakrawlerFile} | grep "access=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "admin=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "dbg=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "debug=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "edit=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "grant=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "test=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "alter=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "clone=">> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "create=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "delete=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "disable=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "enable=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "exec=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "execute=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "load=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "make=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "modify=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "rename=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "reset=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "shell=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "toggle=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "adm=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "root=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "cfg=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "dest=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "redirect=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "uri=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "path=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "continue=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "url=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "window=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "next=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "data=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "reference=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "site=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "html=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "val=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "validate=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "domain=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "callback=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "return=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "page=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "feed=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "host=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "port=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "to=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "out=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "view=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "dir=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "show=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "navigation=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "open=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "file=" >> ${paramsDir}SSRFParams.txt`);

        shell.exec(`cat ${hakrawlerFile} | grep "daemon=" >> ${paramsDir}RCEParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "upload=" >> ${paramsDir}RCEParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "dir=" >> ${paramsDir}RCEParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "execute=" >> ${paramsDir}RCEParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "download=" >> ${paramsDir}RCEParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "log=" >> ${paramsDir}RCEParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "ip=" >> ${paramsDir}RCEParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "cli=" >> ${paramsDir}RCEParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "cmd=" >> ${paramsDir}RCEParams.txt`);

        shell.exec(`sort -u ${paramsDir}OpenRedirectsParams.txt -o ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`sort -u ${paramsDir}SQLiParams.txt -o ${paramsDir}SQLiParams.txt`);
        shell.exec(`sort -u ${paramsDir}LFIParams.txt -o ${paramsDir}LFIParams.txt`);
        shell.exec(`sort -u ${paramsDir}SSRFParams.txt -o ${paramsDir}SSRFParams.txt`);
        shell.exec(`sort -u ${paramsDir}RCEParams.txt -o ${paramsDir}RCEParams.txt`);


        
    }
    catch(err){
        console.log(err);
    }

    return syntax;
}


module.exports = {
    TestHakrawler,
    GetHakrawlerFiles,
    CallHakrawler
    
}