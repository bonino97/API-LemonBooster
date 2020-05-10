'use strict'

//LIBRARIES 

const shell = require('shelljs');
const dateFormat = require('dateformat');
const fs = require('fs');

//MODELS
const Program = require('../models/program');
const Waybackurls = require('../models/waybackurls');

//CONSTS

const date = dateFormat(new Date(), "yyyy-mm-dd-HH-MM");
const goDir = `~/go/bin/`;

//=====================================================================
// TEST ENDPOINTS
//=====================================================================

function TestWaybackurls(req,res){
    res.json('GET Waybackurls - Web History Crawling Enabled.');
}

//=====================================================================
// OBTAIN HAKRAWLER PROGRAM WITH PROGRAMID
//=====================================================================

function GetWaybackurlsFiles(req,res){
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

function CallWaybackurls(req,res){

    var body = req.body;

    var waybackurls = new Waybackurls({
        program: body.program,
        url: body.url,
        findomainFile: body.findomainFile
    });

    try {

        Program.findById(waybackurls.program, (err,program) => {
            if(err){
                return res.status(400).json({
                    ok: false,
                    message: 'Error getting Program.',
                    errors: err 
                });
            }

            let programDir = program.programDir;  
            let paramsDir = SaveParamsDirectory(programDir);

            waybackurls.waybackurlsDirectory = SaveWaybackurlsrDirectory(programDir);

            let allEndpointsDir = SaveAllEndpointsDirectory(waybackurls.waybackurlsDirectory);

            console.log('##################################################');
            console.log('###############-WAYBACKURLS STARTED.-#############');
            console.log('##################################################');

            waybackurls.syntax = ExecuteWaybackurls(waybackurls.findomainFile, programDir, waybackurls, paramsDir, allEndpointsDir);

            
            console.log('#################################################');
            console.log('###############-WAYBACKURLS FINISH.-#############');
            console.log('#################################################');


            waybackurls.save( (err, waybackurlsSaved) => {
                if(err){
                    return res.status(400).json({
                        ok: false,
                        message: 'Error executing Waybackurls.',
                        errors: err 
                    });
                }

                if(!waybackurls){
                    return res.status(400).json({
                        ok: false,
                        message: 'Waybackurls doesnt exists.',
                        errors: {message: 'Waybackurls doesnt exists.'}
                    });
                }

                res.status(200).json({
                    ok: true,
                    message: 'Waybackurls Executed Correctly.',
                    waybackurls: waybackurlsSaved
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

function SaveWaybackurlsrDirectory(programDir){

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

function ExecuteWaybackurls(findomainFile, programDir, waybackurls, paramsDir, allEndpointsDir){

    let syntax = '';
    let findomainDir = `${programDir}Findomain/`;
    let waybackurlFile = `${waybackurls.waybackurlsDirectory}waybackurls-${waybackurls.url}-${date}.txt`;

    try{

        syntax = `cat ${findomainDir}${findomainFile} | ${goDir}waybackurls | tee -a ${waybackurlFile}`;
        
        shell.exec(syntax);
        shell.exec(`sort -u ${waybackurlFile} -o ${waybackurlFile}`);

        shell.exec(`cat ${waybackurlFile} >> ${allEndpointsDir}/AllEndpoints.txt`);
        shell.exec(`sort -u ${allEndpointsDir}/AllEndpoints.txt -o ${allEndpointsDir}/AllEndpoints.txt`);

        shell.exec(`cat ${waybackurlFile} | grep "forward=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "dest=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "redirect=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "uri=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "path=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "continue=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "url=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "window=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "to=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "out=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "view=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "dir=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "show=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "navigation=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "open=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "domain=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "callback=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "return=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "page=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "feed=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "host=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "site=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "html=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "reference=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "file=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "return_to=" >> ${paramsDir}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "fetch=" >> ${paramsDir}OpenRedirectsParams.txt`);

        shell.exec(`cat ${waybackurlFile} | grep "select=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "report=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "role=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "update=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "query=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "user=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "name=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "sort=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "where=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "search=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "params=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "process=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "row=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "view=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "table=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "from=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "sel=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "results=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "sleep=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "fetch=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "order=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "keyword=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "column=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "field=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "delete=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "filter=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "alter=" >> ${paramsDir}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "create=" >> ${paramsDir}SQLiParams.txt`);

        shell.exec(`cat ${waybackurlFile} | grep "file=" >> ${paramsDir}LFIParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "document=" >> ${paramsDir}LFIParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "pg=" >> ${paramsDir}LFIParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "root=" >> ${paramsDir}LFIParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "folder=" >> ${paramsDir}LFIParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "path=" >> ${paramsDir}LFIParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "style=" >> ${paramsDir}LFIParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "pdf=" >> ${paramsDir}LFIParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "template=" >> ${paramsDir}LFIParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "php_path=" >> ${paramsDir}LFIParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "doc=" >> ${paramsDir}LFIParams.txt`);

        shell.exec(`cat ${waybackurlFile} | grep "access=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "admin=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "dbg=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "debug=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "edit=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "grant=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "test=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "alter=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "clone=">> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "create=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "delete=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "disable=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "enable=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "exec=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "execute=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "load=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "make=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "modify=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "rename=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "reset=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "shell=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "toggle=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "adm=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "root=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "cfg=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "dest=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "redirect=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "uri=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "path=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "continue=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "url=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "window=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "next=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "data=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "reference=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "site=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "html=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "val=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "validate=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "domain=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "callback=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "return=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "page=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "feed=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "host=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "port=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "to=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "out=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "view=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "dir=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "show=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "navigation=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "open=" >> ${paramsDir}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "file=" >> ${paramsDir}SSRFParams.txt`);

        shell.exec(`cat ${waybackurlFile} | grep "daemon=" >> ${paramsDir}RCEParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "upload=" >> ${paramsDir}RCEParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "dir=" >> ${paramsDir}RCEParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "execute=" >> ${paramsDir}RCEParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "download=" >> ${paramsDir}RCEParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "log=" >> ${paramsDir}RCEParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "ip=" >> ${paramsDir}RCEParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "cli=" >> ${paramsDir}RCEParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "cmd=" >> ${paramsDir}RCEParams.txt`);

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
    TestWaybackurls,
    GetWaybackurlsFiles,
    CallWaybackurls
    
}