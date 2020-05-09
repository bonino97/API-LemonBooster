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

            gau.gauDirectory = SaveGauDirectory(programDir);


            console.log('##################################################');
            console.log('#################-GAU STARTED.-###################');
            console.log('##################################################');

            gau.syntax = ExecuteGau(gau.findomainFile, programDir, gau);

            
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


function ExecuteGau(findomainFile, programDir, gau){

    let syntax = '';
    let findomainDir = `${programDir}Findomain/`;
    let gauFile = `${gau.gauDirectory}gau-${gau.url}-${date}.txt`;

    try{

        syntax = `cat ${findomainDir}${findomainFile} | ${goDir}gau | tee -a ${gauFile}`;
        
        shell.exec(syntax);
        shell.exec(`sort -u ${gauFile} -o ${gauFile}`);

        shell.exec(`cat ${gauFile} | grep "forward=" >> ${gau.gauDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "dest=" >> ${gau.gauDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "redirect=" >> ${gau.gauDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "uri=" >> ${gau.gauDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "path=" >> ${gau.gauDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "continue=" >> ${gau.gauDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "url=" >> ${gau.gauDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "window=" >> ${gau.gauDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "to=" >> ${gau.gauDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "out=" >> ${gau.gauDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "view=" >> ${gau.gauDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "dir=" >> ${gau.gauDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "show=" >> ${gau.gauDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "navigation=" >> ${gau.gauDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "open=" >> ${gau.gauDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "domain=" >> ${gau.gauDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "callback=" >> ${gau.gauDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "return=" >> ${gau.gauDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "page=" >> ${gau.gauDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "feed=" >> ${gau.gauDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "host=" >> ${gau.gauDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "site=" >> ${gau.gauDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "html=" >> ${gau.gauDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "reference=" >> ${gau.gauDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "file=" >> ${gau.gauDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "return_to=" >> ${gau.gauDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${gauFile} | grep "fetch=" >> ${gau.gauDirectory}OpenRedirectsParams.txt`);

        shell.exec(`cat ${gauFile} | grep "select=" >> ${gau.gauDirectory}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "report=" >> ${gau.gauDirectory}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "role=" >> ${gau.gauDirectory}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "update=" >> ${gau.gauDirectory}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "query=" >> ${gau.gauDirectory}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "user=" >> ${gau.gauDirectory}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "name=" >> ${gau.gauDirectory}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "sort=" >> ${gau.gauDirectory}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "where=" >> ${gau.gauDirectory}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "search=" >> ${gau.gauDirectory}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "params=" >> ${gau.gauDirectory}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "process=" >> ${gau.gauDirectory}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "row=" >> ${gau.gauDirectory}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "view=" >> ${gau.gauDirectory}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "table=" >> ${gau.gauDirectory}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "from=" >> ${gau.gauDirectory}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "sel=" >> ${gau.gauDirectory}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "results=" >> ${gau.gauDirectory}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "sleep=" >> ${gau.gauDirectory}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "fetch=" >> ${gau.gauDirectory}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "order=" >> ${gau.gauDirectory}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "keyword=" >> ${gau.gauDirectory}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "column=" >> ${gau.gauDirectory}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "field=" >> ${gau.gauDirectory}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "delete=" >> ${gau.gauDirectory}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "filter=" >> ${gau.gauDirectory}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "alter=" >> ${gau.gauDirectory}SQLiParams.txt`);
        shell.exec(`cat ${gauFile} | grep "create=" >> ${gau.gauDirectory}SQLiParams.txt`);

        shell.exec(`cat ${gauFile} | grep "file=" >> ${gau.gauDirectory}LFIParams.txt`);
        shell.exec(`cat ${gauFile} | grep "document=" >> ${gau.gauDirectory}LFIParams.txt`);
        shell.exec(`cat ${gauFile} | grep "pg=" >> ${gau.gauDirectory}LFIParams.txt`);
        shell.exec(`cat ${gauFile} | grep "root=" >> ${gau.gauDirectory}LFIParams.txt`);
        shell.exec(`cat ${gauFile} | grep "folder=" >> ${gau.gauDirectory}LFIParams.txt`);
        shell.exec(`cat ${gauFile} | grep "path=" >> ${gau.gauDirectory}LFIParams.txt`);
        shell.exec(`cat ${gauFile} | grep "style=" >> ${gau.gauDirectory}LFIParams.txt`);
        shell.exec(`cat ${gauFile} | grep "pdf=" >> ${gau.gauDirectory}LFIParams.txt`);
        shell.exec(`cat ${gauFile} | grep "template=" >> ${gau.gauDirectory}LFIParams.txt`);
        shell.exec(`cat ${gauFile} | grep "php_path=" >> ${gau.gauDirectory}LFIParams.txt`);
        shell.exec(`cat ${gauFile} | grep "doc=" >> ${gau.gauDirectory}LFIParams.txt`);

        shell.exec(`cat ${gauFile} | grep "access=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "admin=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "dbg=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "debug=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "edit=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "grant=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "test=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "alter=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "clone=">> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "create=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "delete=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "disable=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "enable=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "exec=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "execute=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "load=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "make=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "modify=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "rename=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "reset=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "shell=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "toggle=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "adm=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "root=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "cfg=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "dest=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "redirect=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "uri=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "path=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "continue=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "url=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "window=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "next=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "data=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "reference=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "site=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "html=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "val=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "validate=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "domain=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "callback=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "return=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "page=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "feed=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "host=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "port=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "to=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "out=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "view=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "dir=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "show=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "navigation=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "open=" >> ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`cat ${gauFile} | grep "file=" >> ${gau.gauDirectory}SSRFParams.txt`);

        shell.exec(`cat ${gauFile} | grep "daemon=" >> ${gau.gauDirectory}RCEParams.txt`);
        shell.exec(`cat ${gauFile} | grep "upload=" >> ${gau.gauDirectory}RCEParams.txt`);
        shell.exec(`cat ${gauFile} | grep "dir=" >> ${gau.gauDirectory}RCEParams.txt`);
        shell.exec(`cat ${gauFile} | grep "execute=" >> ${gau.gauDirectory}RCEParams.txt`);
        shell.exec(`cat ${gauFile} | grep "download=" >> ${gau.gauDirectory}RCEParams.txt`);
        shell.exec(`cat ${gauFile} | grep "log=" >> ${gau.gauDirectory}RCEParams.txt`);
        shell.exec(`cat ${gauFile} | grep "ip=" >> ${gau.gauDirectory}RCEParams.txt`);
        shell.exec(`cat ${gauFile} | grep "cli=" >> ${gau.gauDirectory}RCEParams.txt`);
        shell.exec(`cat ${gauFile} | grep "cmd=" >> ${gau.gauDirectory}RCEParams.txt`);

        shell.exec(`sort -u ${gau.gauDirectory}OpenRedirectsParams.txt -o ${gau.gauDirectory}OpenRedirectsParams.txt`);
        shell.exec(`sort -u ${gau.gauDirectory}SQLiParams.txt -o ${gau.gauDirectory}SQLiParams.txt`);
        shell.exec(`sort -u ${gau.gauDirectory}LFIParams.txt -o ${gau.gauDirectory}LFIParams.txt`);
        shell.exec(`sort -u ${gau.gauDirectory}SSRFParams.txt -o ${gau.gauDirectory}SSRFParams.txt`);
        shell.exec(`sort -u ${gau.gauDirectory}RCEParams.txt -o ${gau.gauDirectory}RCEParams.txt`);

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