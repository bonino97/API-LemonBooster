'use strict'

//LIBRARIES 

const shell = require('shelljs');
const dateFormat = require('dateformat');
const fs = require('fs');

//CONSTS

let date = dateFormat(new Date(), "yyyy-mm-dd-HH-MM");

//MODELS

const Program = require('../models/program');
const GetJs = require('../models/getjs');


//=====================================================================
// TEST ENDPOINTS
//=====================================================================

function testGetJs(req,res){
    res.json('GET GetJs - JS Extractor.');
}

//=====================================================================
// OBTAIN GETJS PROGRAM WITH PROGRAMID
//=====================================================================

function getGetJsFiles(req,res){
    let id = req.params.id;

    try{
        Program.findById(id, (err, program) => {

            let hakcheckurlDir = `${program.programDir}Hakcheckurl/`;
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
// OBTAIN JS LINKS
//=====================================================================

function getJsLinks(req,res){
    const body = req.body;   

    const getJs = new GetJs({
        program: body.program,
        file: body.file
    });

    Program.findById(getJs.program, (err,program) => {   

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

        let hakcheckurlDirAndFile = `${program.programDir}Hakcheckurl/${getJs.file}`;

        let hakcheckurlFile = returnHakcheckurlLinks(hakcheckurlDirAndFile);

        return res.status(200).json({
            ok: true,
            hakcheckurlFile
        });
    });
    

}

//=====================================================================
// CALL GETJS EXECUTE FUNCTION
//=====================================================================

function callGetJs(req,res){

    var body = req.body;

    var getJs = new GetJs({
        program: body.program,
        link: body.link
    });

    try {

        Program.findById(getJs.program, (err,program) => {
            if(err){
                return res.status(400).json({
                    ok: false,
                    message: 'Error getting Program.',
                    errors: err 
                });
            }

            let programDir = program.programDir;  
            let getjsName = getJs.link.split('/')[2];

            console.log(getjsName)

            getJs.getjsDirectory = saveGetJsDirectory(programDir);

            console.log(getJs.getjsDirectory)

            console.log('##################################################');
            console.log('###############-GetJs Started-###############');
            console.log('##################################################');


            getJs.syntax = executeGetJs(getJs, getjsName);

            getJs.save( (err, getJsSaved) => {
                if(err){
                    return res.status(400).json({
                        ok: false,
                        message: 'Error executing GetJs.',
                        errors: err 
                    });
                }

                if(!getJs){
                    return res.status(400).json({
                        ok: false,
                        message: 'GetJs doesnt exists.',
                        errors: {message: 'GetJs doesnt exists.'}
                    });
                }

                console.log('#################################################');
                console.log('###############-GetJs Finish.-###################');
                console.log('#################################################');

                res.status(200).json({
                    ok: true,
                    message: 'GetJs Executed Correctly.',
                    getJs: getJsSaved
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

function getHakcheckurlFiles(hakcheckurlDir){
    
    try {
        let hakcheckurlArray = [];

        fs.readdirSync(hakcheckurlDir).forEach(files => {
            hakcheckurlArray.push(files);
        });
    
        return(hakcheckurlArray);
    }
    catch(err){
        return err
    }

}

function returnHakcheckurlLinks(hakcheckurlFile){

    try {
        let hakcheckurlResult = [];

        hakcheckurlResult = fs.readFileSync(hakcheckurlFile, {encoding: 'utf-8'}).split('\n');
        
        return hakcheckurlResult;
    }
    catch(err){
        return err
    }


}

function saveGetJsDirectory(programDir){

    let getJsDir = `${programDir}GetJs/`;

    if( fs.existsSync(getJsDir) ){
        console.log('GetJs Directory Exists.');
    } else { 
        shell.exec(`mkdir ${getJsDir}`)
    }

    return getJsDir;
}


function executeGetJs(getJs, getJsName){

    //getJs.link, getJs.getjsDirectory

    

    //syntax = "getJS -input=./results/PayPal/Httprobe/httprobe-xoom.com-2020-04-05-19-54.txt -complete -resolve -output=./results/PayPal/GetJs/getJs-www.xoom.com-2020-04-05-20-29.txt";
    //syntax = `~/go/bin/getJS -url=${link}`;
    // syntax = `~/go/bin/getJS -url=${link} -complete -resolve -output=${getJsDir}getJs-${getJsName}-${date}.txt`;
    // syntax = '~/go/bin/getJS -url='+link+' -complete -resolve -output='+getJsDir+'getJs-'+getJsName+date+'.txt';

    try{

        let syntax = String;
        let getJsFile = `${getJs.getjsDirectory}getJs-${getJsName}-${date}.txt`;

        syntax = `~/go/bin/getJS -url=${getJs.link} -complete -resolve -output=${getJsFile}`;

        shell.exec("echo " + syntax);
        return syntax;

    }
    catch(err){
        console.log(err);
        return err;
    }


}

module.exports = {
    testGetJs,
    getGetJsFiles,
    getJsLinks,
    callGetJs
}