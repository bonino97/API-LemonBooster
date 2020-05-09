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

function testHakrawler(req,res){
    res.json('GET Hakrawler - Web Crawling Enabled.');
}

//=====================================================================
// OBTAIN HAKRAWLER PROGRAM WITH PROGRAMID
//=====================================================================

function getHakrawlerFiles(req,res){
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
    
            files = getFindomainFiles(findomainDir);
            
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

function callHakrawler(req,res){

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

            hakrawler.hakrawlerDirectory = saveHakrawlerDirectory(programDir);


            console.log('##################################################');
            console.log('###############-HAKRAWLER STARTED.-###############');
            console.log('##################################################');

            hakrawler.syntax = executeHakrawler(hakrawler.findomainFile, programDir, hakrawler);

            
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

function getFindomainFiles(findomainDir){
    
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

function saveHakrawlerDirectory(programDir){

    let crawlersDir = `${programDir}Crawlers/`;

    if( fs.existsSync(crawlersDir) ){
        console.log('Crawlers Directory Exists.');
    } else { 
        shell.exec(`mkdir ${crawlersDir}`)
    }
    
    return crawlersDir;

}


function executeHakrawler(findomainFile, programDir, hakrawler){

    let syntax = '';
    let findomainDir = `${programDir}Findomain/`;
    let hakrawlerFile = `${hakrawler.hakrawlerDirectory}hakrawler-${hakrawler.url}-${date}.txt`;

    try{

        syntax = `cat ${findomainDir}${findomainFile} | ~/go/bin/hakrawler -plain -depth 3 | tee -a ${hakrawlerFile}`;

        shell.exec(syntax);
        shell.exec(`sort -u ${hakrawlerFile} -o ${hakrawlerFile}`);

        shell.exec(`cat ${hakrawlerFile} | grep "forward=" >> ${hakrawler.hakrawlerDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "dest=" >> ${hakrawler.hakrawlerDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "redirect=" >> ${hakrawler.hakrawlerDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "uri=" >> ${hakrawler.hakrawlerDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "path=" >> ${hakrawler.hakrawlerDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "continue=" >> ${hakrawler.hakrawlerDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "url=" >> ${hakrawler.hakrawlerDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "window=" >> ${hakrawler.hakrawlerDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "to=" >> ${hakrawler.hakrawlerDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "out=" >> ${hakrawler.hakrawlerDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "view=" >> ${hakrawler.hakrawlerDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "dir=" >> ${hakrawler.hakrawlerDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "show=" >> ${hakrawler.hakrawlerDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "navigation=" >> ${hakrawler.hakrawlerDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "open=" >> ${hakrawler.hakrawlerDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "domain=" >> ${hakrawler.hakrawlerDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "callback=" >> ${hakrawler.hakrawlerDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "return=" >> ${hakrawler.hakrawlerDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "page=" >> ${hakrawler.hakrawlerDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "feed=" >> ${hakrawler.hakrawlerDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "host=" >> ${hakrawler.hakrawlerDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "site=" >> ${hakrawler.hakrawlerDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "html=" >> ${hakrawler.hakrawlerDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "reference=" >> ${hakrawler.hakrawlerDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "file=" >> ${hakrawler.hakrawlerDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "return_to=" >> ${hakrawler.hakrawlerDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "fetch=" >> ${hakrawler.hakrawlerDirectory}OpenRedirectsParams.txt`);

        shell.exec(`cat ${hakrawlerFile} | grep "select=" >> ${hakrawler.hakrawlerDirectory}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "report=" >> ${hakrawler.hakrawlerDirectory}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "role=" >> ${hakrawler.hakrawlerDirectory}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "update=" >> ${hakrawler.hakrawlerDirectory}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "query=" >> ${hakrawler.hakrawlerDirectory}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "user=" >> ${hakrawler.hakrawlerDirectory}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "name=" >> ${hakrawler.hakrawlerDirectory}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "sort=" >> ${hakrawler.hakrawlerDirectory}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "where=" >> ${hakrawler.hakrawlerDirectory}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "search=" >> ${hakrawler.hakrawlerDirectory}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "params=" >> ${hakrawler.hakrawlerDirectory}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "process=" >> ${hakrawler.hakrawlerDirectory}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "row=" >> ${hakrawler.hakrawlerDirectory}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "view=" >> ${hakrawler.hakrawlerDirectory}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "table=" >> ${hakrawler.hakrawlerDirectory}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "from=" >> ${hakrawler.hakrawlerDirectory}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "sel=" >> ${hakrawler.hakrawlerDirectory}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "results=" >> ${hakrawler.hakrawlerDirectory}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "sleep=" >> ${hakrawler.hakrawlerDirectory}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "fetch=" >> ${hakrawler.hakrawlerDirectory}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "order=" >> ${hakrawler.hakrawlerDirectory}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "keyword=" >> ${hakrawler.hakrawlerDirectory}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "column=" >> ${hakrawler.hakrawlerDirectory}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "field=" >> ${hakrawler.hakrawlerDirectory}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "delete=" >> ${hakrawler.hakrawlerDirectory}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "filter=" >> ${hakrawler.hakrawlerDirectory}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "alter=" >> ${hakrawler.hakrawlerDirectory}SQLiParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "create=" >> ${hakrawler.hakrawlerDirectory}SQLiParams.txt`);

        shell.exec(`cat ${hakrawlerFile} | grep "file=" >> ${hakrawler.hakrawlerDirectory}LFIParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "document=" >> ${hakrawler.hakrawlerDirectory}LFIParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "pg=" >> ${hakrawler.hakrawlerDirectory}LFIParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "root=" >> ${hakrawler.hakrawlerDirectory}LFIParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "folder=" >> ${hakrawler.hakrawlerDirectory}LFIParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "path=" >> ${hakrawler.hakrawlerDirectory}LFIParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "style=" >> ${hakrawler.hakrawlerDirectory}LFIParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "pdf=" >> ${hakrawler.hakrawlerDirectory}LFIParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "template=" >> ${hakrawler.hakrawlerDirectory}LFIParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "php_path=" >> ${hakrawler.hakrawlerDirectory}LFIParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "doc=" >> ${hakrawler.hakrawlerDirectory}LFIParams.txt`);

        shell.exec(`cat ${hakrawlerFile} | grep "access=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "admin=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "dbg=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "debug=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "edit=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "grant=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "test=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "alter=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "clone=">> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "create=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "delete=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "disable=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "enable=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "exec=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "execute=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "load=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "make=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "modify=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "rename=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "reset=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "shell=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "toggle=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "adm=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "root=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "cfg=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "dest=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "redirect=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "uri=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "path=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "continue=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "url=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "window=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "next=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "data=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "reference=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "site=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "html=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "val=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "validate=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "domain=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "callback=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "return=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "page=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "feed=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "host=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "port=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "to=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "out=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "view=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "dir=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "show=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "navigation=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "open=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "file=" >> ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);

        shell.exec(`cat ${hakrawlerFile} | grep "daemon=" >> ${hakrawler.hakrawlerDirectory}RCEParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "upload=" >> ${hakrawler.hakrawlerDirectory}RCEParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "dir=" >> ${hakrawler.hakrawlerDirectory}RCEParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "execute=" >> ${hakrawler.hakrawlerDirectory}RCEParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "download=" >> ${hakrawler.hakrawlerDirectory}RCEParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "log=" >> ${hakrawler.hakrawlerDirectory}RCEParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "ip=" >> ${hakrawler.hakrawlerDirectory}RCEParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "cli=" >> ${hakrawler.hakrawlerDirectory}RCEParams.txt`);
        shell.exec(`cat ${hakrawlerFile} | grep "cmd=" >> ${hakrawler.hakrawlerDirectory}RCEParams.txt`);

        shell.exec(`sort -u ${hakrawler.hakrawlerDirectory}OpenRedirectsParams.txt -o ${hakrawler.hakrawlerDirectory}OpenRedirectsParams.txt`);
        shell.exec(`sort -u ${hakrawler.hakrawlerDirectory}SQLiParams.txt -o ${hakrawler.hakrawlerDirectory}SQLiParams.txt`);
        shell.exec(`sort -u ${hakrawler.hakrawlerDirectory}LFIParams.txt -o ${hakrawler.hakrawlerDirectory}LFIParams.txt`);
        shell.exec(`sort -u ${hakrawler.hakrawlerDirectory}SSRFParams.txt -o ${hakrawler.hakrawlerDirectory}SSRFParams.txt`);
        shell.exec(`sort -u ${hakrawler.hakrawlerDirectory}RCEParams.txt -o ${hakrawler.hakrawlerDirectory}RCEParams.txt`);


        
    }
    catch(err){
        console.log(err);
    }

    return syntax;
}


module.exports = {
    testHakrawler,
    getHakrawlerFiles,
    callHakrawler
    
}