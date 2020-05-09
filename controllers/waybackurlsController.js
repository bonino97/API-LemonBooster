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

            waybackurls.waybackurlsDirectory = SaveWaybackurlsrDirectory(programDir);


            console.log('##################################################');
            console.log('###############-WAYBACKURLS STARTED.-#############');
            console.log('##################################################');

            waybackurls.syntax = ExecuteWaybackurls(waybackurls.findomainFile, programDir, waybackurls);

            
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


function ExecuteWaybackurls(findomainFile, programDir, waybackurls){

    let syntax = '';
    let findomainDir = `${programDir}Findomain/`;
    let waybackurlFile = `${waybackurls.waybackurlsDirectory}waybackurls-${waybackurls.url}-${date}.txt`;

    try{

        syntax = `cat ${findomainDir}${findomainFile} | ${goDir}waybackurls | tee -a ${waybackurlFile}`;
        
        shell.exec(syntax);
        shell.exec(`sort -u ${waybackurlFile} -o ${waybackurlFile}`);

        shell.exec(`cat ${waybackurlFile} | grep "forward=" >> ${waybackurls.waybackurlsDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "dest=" >> ${waybackurls.waybackurlsDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "redirect=" >> ${waybackurls.waybackurlsDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "uri=" >> ${waybackurls.waybackurlsDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "path=" >> ${waybackurls.waybackurlsDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "continue=" >> ${waybackurls.waybackurlsDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "url=" >> ${waybackurls.waybackurlsDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "window=" >> ${waybackurls.waybackurlsDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "to=" >> ${waybackurls.waybackurlsDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "out=" >> ${waybackurls.waybackurlsDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "view=" >> ${waybackurls.waybackurlsDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "dir=" >> ${waybackurls.waybackurlsDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "show=" >> ${waybackurls.waybackurlsDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "navigation=" >> ${waybackurls.waybackurlsDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "open=" >> ${waybackurls.waybackurlsDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "domain=" >> ${waybackurls.waybackurlsDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "callback=" >> ${waybackurls.waybackurlsDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "return=" >> ${waybackurls.waybackurlsDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "page=" >> ${waybackurls.waybackurlsDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "feed=" >> ${waybackurls.waybackurlsDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "host=" >> ${waybackurls.waybackurlsDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "site=" >> ${waybackurls.waybackurlsDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "html=" >> ${waybackurls.waybackurlsDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "reference=" >> ${waybackurls.waybackurlsDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "file=" >> ${waybackurls.waybackurlsDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "return_to=" >> ${waybackurls.waybackurlsDirectory}OpenRedirectsParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "fetch=" >> ${waybackurls.waybackurlsDirectory}OpenRedirectsParams.txt`);

        shell.exec(`cat ${waybackurlFile} | grep "select=" >> ${waybackurls.waybackurlsDirectory}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "report=" >> ${waybackurls.waybackurlsDirectory}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "role=" >> ${waybackurls.waybackurlsDirectory}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "update=" >> ${waybackurls.waybackurlsDirectory}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "query=" >> ${waybackurls.waybackurlsDirectory}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "user=" >> ${waybackurls.waybackurlsDirectory}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "name=" >> ${waybackurls.waybackurlsDirectory}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "sort=" >> ${waybackurls.waybackurlsDirectory}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "where=" >> ${waybackurls.waybackurlsDirectory}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "search=" >> ${waybackurls.waybackurlsDirectory}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "params=" >> ${waybackurls.waybackurlsDirectory}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "process=" >> ${waybackurls.waybackurlsDirectory}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "row=" >> ${waybackurls.waybackurlsDirectory}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "view=" >> ${waybackurls.waybackurlsDirectory}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "table=" >> ${waybackurls.waybackurlsDirectory}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "from=" >> ${waybackurls.waybackurlsDirectory}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "sel=" >> ${waybackurls.waybackurlsDirectory}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "results=" >> ${waybackurls.waybackurlsDirectory}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "sleep=" >> ${waybackurls.waybackurlsDirectory}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "fetch=" >> ${waybackurls.waybackurlsDirectory}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "order=" >> ${waybackurls.waybackurlsDirectory}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "keyword=" >> ${waybackurls.waybackurlsDirectory}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "column=" >> ${waybackurls.waybackurlsDirectory}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "field=" >> ${waybackurls.waybackurlsDirectory}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "delete=" >> ${waybackurls.waybackurlsDirectory}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "filter=" >> ${waybackurls.waybackurlsDirectory}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "alter=" >> ${waybackurls.waybackurlsDirectory}SQLiParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "create=" >> ${waybackurls.waybackurlsDirectory}SQLiParams.txt`);

        shell.exec(`cat ${waybackurlFile} | grep "file=" >> ${waybackurls.waybackurlsDirectory}LFIParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "document=" >> ${waybackurls.waybackurlsDirectory}LFIParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "pg=" >> ${waybackurls.waybackurlsDirectory}LFIParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "root=" >> ${waybackurls.waybackurlsDirectory}LFIParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "folder=" >> ${waybackurls.waybackurlsDirectory}LFIParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "path=" >> ${waybackurls.waybackurlsDirectory}LFIParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "style=" >> ${waybackurls.waybackurlsDirectory}LFIParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "pdf=" >> ${waybackurls.waybackurlsDirectory}LFIParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "template=" >> ${waybackurls.waybackurlsDirectory}LFIParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "php_path=" >> ${waybackurls.waybackurlsDirectory}LFIParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "doc=" >> ${waybackurls.waybackurlsDirectory}LFIParams.txt`);

        shell.exec(`cat ${waybackurlFile} | grep "access=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "admin=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "dbg=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "debug=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "edit=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "grant=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "test=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "alter=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "clone=">> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "create=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "delete=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "disable=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "enable=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "exec=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "execute=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "load=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "make=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "modify=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "rename=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "reset=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "shell=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "toggle=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "adm=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "root=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "cfg=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "dest=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "redirect=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "uri=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "path=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "continue=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "url=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "window=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "next=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "data=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "reference=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "site=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "html=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "val=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "validate=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "domain=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "callback=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "return=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "page=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "feed=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "host=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "port=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "to=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "out=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "view=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "dir=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "show=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "navigation=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "open=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "file=" >> ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);

        shell.exec(`cat ${waybackurlFile} | grep "daemon=" >> ${waybackurls.waybackurlsDirectory}RCEParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "upload=" >> ${waybackurls.waybackurlsDirectory}RCEParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "dir=" >> ${waybackurls.waybackurlsDirectory}RCEParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "execute=" >> ${waybackurls.waybackurlsDirectory}RCEParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "download=" >> ${waybackurls.waybackurlsDirectory}RCEParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "log=" >> ${waybackurls.waybackurlsDirectory}RCEParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "ip=" >> ${waybackurls.waybackurlsDirectory}RCEParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "cli=" >> ${waybackurls.waybackurlsDirectory}RCEParams.txt`);
        shell.exec(`cat ${waybackurlFile} | grep "cmd=" >> ${waybackurls.waybackurlsDirectory}RCEParams.txt`);

        shell.exec(`sort -u ${waybackurls.waybackurlsDirectory}OpenRedirectsParams.txt -o ${waybackurls.waybackurlsDirectory}OpenRedirectsParams.txt`);
        shell.exec(`sort -u ${waybackurls.waybackurlsDirectory}SQLiParams.txt -o ${waybackurls.waybackurlsDirectory}SQLiParams.txt`);
        shell.exec(`sort -u ${waybackurls.waybackurlsDirectory}LFIParams.txt -o ${waybackurls.waybackurlsDirectory}LFIParams.txt`);
        shell.exec(`sort -u ${waybackurls.waybackurlsDirectory}SSRFParams.txt -o ${waybackurls.waybackurlsDirectory}SSRFParams.txt`);
        shell.exec(`sort -u ${waybackurls.waybackurlsDirectory}RCEParams.txt -o ${waybackurls.waybackurlsDirectory}RCEParams.txt`);

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