'use strict'

//LIBRARIES 

const shell = require('shelljs');
const dateFormat = require('dateformat');
const fs = require('fs');

//MODELS
const Program = require('../models/program');
const Gau = require('../models/gau');

//CONSTS

const date = dateFormat(new Date(), "yyyy-mm-dd-HH-MM");
const goDir = `~/go/bin/`;

//=====================================================================
// TEST ENDPOINTS
//=====================================================================

function TestGau(req,res){
    res.json('GET Gau - Web Crawling.');
}

//=====================================================================
// OBTAIN HAKRAWLER PROGRAM WITH PROGRAMID
//=====================================================================

function GetGauFiles(req,res){
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

function CallGau(req,res){

    var body = req.body;

    var gau = new Gau({
        program: body.program,
        url: body.url,
        findomainFile: body.findomainFile
    });

    try {

        Program.findById(gau.program, (err,program) => {
            if(err){
                return res.status(400).json({
                    ok: false,
                    message: 'Error getting Program.',
                    errors: err 
                });
            }

            let programDir = program.programDir;

            let paramsDir = SaveParamsDirectory(programDir);

            gau.gauDirectory = SaveGauDirectory(programDir);

            let allEndpointsDir = SaveAllEndpointsDirectory(gau.gauDirectory);

            console.log('##################################################');
            console.log('#################-GAU STARTED.-###################');
            console.log('##################################################');

            gau.syntax = ExecuteGau(gau.findomainFile, programDir, gau, paramsDir, allEndpointsDir);

            
            console.log('#################################################');
            console.log('#################-GAU FINISH.-###################');
            console.log('#################################################');


            gau.save( (err, gauSaved) => {
                if(err){
                    return res.status(400).json({
                        ok: false,
                        message: 'Error executing Gau.',
                        errors: err 
                    });
                }

                if(!gau){
                    return res.status(400).json({
                        ok: false,
                        message: 'Gau doesnt exists.',
                        errors: {message: 'Gau doesnt exists.'}
                    });
                }

                res.status(200).json({
                    ok: true,
                    message: 'Gau Executed Correctly.',
                    gau: gauSaved
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

function SaveGauDirectory(programDir){

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




function ExecuteGau(findomainFile, programDir, gau, paramsDir, allEndpointsDir){

    let syntax = '';
    let findomainDir = `${programDir}Findomain/`;
    
    let gauFile = `${gau.gauDirectory}gau-${gau.url}-${date}.txt`;

    try{

        syntax = `cat ${findomainDir}${findomainFile} | ${goDir}gau | tee -a ${gauFile}`;

        shell.exec(syntax);
        shell.exec(`sort -u ${gauFile} -o ${gauFile}`);

        shell.exec(`cat ${gauFile} >> ${allEndpointsDir}/AllEndpoints.txt`);
        shell.exec(`sort -u ${allEndpointsDir}/AllEndpoints.txt -o ${allEndpointsDir}/AllEndpoints.txt`);

        shell.exec(`cat ${gauFile} | grep "forward=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "dest=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "redirect=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "uri=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "path=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "continue=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "url=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "window=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "to=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "out=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "view=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "dir=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "show=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "navigation=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "open=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "domain=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "callback=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "return=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "page=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "feed=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "host=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "site=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "html=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "reference=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "file=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "return_to=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "fetch=" >> ${paramsDir}OpenRedirectsParams.txt`);

        shell.exec(`cat ${gauFile} | grep "select=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "report=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "role=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "update=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "query=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "user=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "name=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "sort=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "where=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "search=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "params=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "process=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "row=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "view=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "table=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "from=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "sel=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "results=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "sleep=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "fetch=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "order=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "keyword=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "column=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "field=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "delete=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "filter=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "alter=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "create=" >> ${paramsDir}SQLiParams.txt`);

        shell.exec(`cat ${gauFile} | grep "file=" >> ${paramsDir}LFIParams.txt`);
        shell.exec(`cat ${gauFile} | grep "document=" >> ${paramsDir}LFIParams.txt`);
        shell.exec(`cat ${gauFile} | grep "pg=" >> ${paramsDir}LFIParams.txt`);
        shell.exec(`cat ${gauFile} | grep "root=" >> ${paramsDir}LFIParams.txt`);
        shell.exec(`cat ${gauFile} | grep "folder=" >> ${paramsDir}LFIParams.txt`);
        shell.exec(`cat ${gauFile} | grep "path=" >> ${paramsDir}LFIParams.txt`);
        shell.exec(`cat ${gauFile} | grep "style=" >> ${paramsDir}LFIParams.txt`);
        shell.exec(`cat ${gauFile} | grep "pdf=" >> ${paramsDir}LFIParams.txt`);
        shell.exec(`cat ${gauFile} | grep "template=" >> ${paramsDir}LFIParams.txt`);
        shell.exec(`cat ${gauFile} | grep "php_path=" >> ${paramsDir}LFIParams.txt`);
        shell.exec(`cat ${gauFile} | grep "doc=" >> ${paramsDir}LFIParams.txt`);

        shell.exec(`cat ${gauFile} | grep "access=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "admin=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "dbg=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "debug=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "edit=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "grant=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "test=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "alter=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "clone=">> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "create=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "delete=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "disable=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "enable=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "exec=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "execute=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "load=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "make=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "modify=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "rename=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "reset=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "shell=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "toggle=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "adm=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "root=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "cfg=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "dest=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "redirect=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "uri=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "path=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "continue=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "url=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "window=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "next=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "data=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "reference=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "site=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "html=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "val=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "validate=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "domain=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "callback=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "return=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "page=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "feed=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "host=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "port=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "to=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "out=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "view=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "dir=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "show=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "navigation=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "open=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "file=" >> ${paramsDir}SSRFParams.txt`);

        shell.exec(`cat ${gauFile} | grep "daemon=" >> ${paramsDir}RCEParams.txt`);
        shell.exec(`cat ${gauFile} | grep "upload=" >> ${paramsDir}RCEParams.txt`);
        shell.exec(`cat ${gauFile} | grep "dir=" >> ${paramsDir}RCEParams.txt`);
        shell.exec(`cat ${gauFile} | grep "execute=" >> ${paramsDir}RCEParams.txt`);
        shell.exec(`cat ${gauFile} | grep "download=" >> ${paramsDir}RCEParams.txt`);
        shell.exec(`cat ${gauFile} | grep "log=" >> ${paramsDir}RCEParams.txt`);
        shell.exec(`cat ${gauFile} | grep "ip=" >> ${paramsDir}RCEParams.txt`);
        shell.exec(`cat ${gauFile} | grep "cli=" >> ${paramsDir}RCEParams.txt`);
        shell.exec(`cat ${gauFile} | grep "cmd=" >> ${paramsDir}RCEParams.txt`);

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
    TestGau,
    GetGauFiles,
    CallGau
    
}