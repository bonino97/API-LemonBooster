'use strict'

//LIBRARIES 

const shell = require('shelljs');
const dateFormat = require('dateformat');
const fs = require('fs');

//MODELS
const Program = require('../models/program');
const GoSpider = require('../models/gospider');

//CONSTS

const date = dateFormat(new Date(), "yyyy-mm-dd-HH-MM");
const goDir = `~/go/bin/`;

//=====================================================================
// TEST ENDPOINTS
//=====================================================================

function TestGoSpider(req,res){
    res.json('GET GoSpider - Web Scan Enabled.');
}

//=====================================================================
// OBTAIN GOSPIDER PROGRAM WITH PROGRAMID
//=====================================================================

function GetGospiderFiles(req,res){
    let id = req.params.id;

    try{
        Program.findById(id, (err, program) => {

            let httprobeDir = `${program.programDir}Httprobe/`;
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
    
            files = GetHttprobeFiles(httprobeDir);
            
            if(!files){
                return res.status(500).json({
                    ok: false,
                    message: 'Execute Httprobe first.',
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
// CALL GOSPIDER EXECUTE FUNCTION
//=====================================================================

function CallGospider(req,res){

    var body = req.body;

    var gospider = new GoSpider({
        program: body.program,
        url: body.url,
        httprobeFile: body.httprobeFile
    });

    try {

        Program.findById(gospider.program, (err,program) => {
            if(err){
                return res.status(400).json({
                    ok: false,
                    message: 'Error getting Program.',
                    errors: err 
                });
            }

            let programDir = program.programDir;  

            gospider.gospiderDirectory = SaveGoSpiderDirectory(programDir);


            console.log('##################################################');
            console.log('###############-GOSPIDER STARTED.-################');
            console.log('##################################################');

            gospider.syntax = ExecuteGoSpider(gospider.httprobeFile, programDir, gospider);

            
            console.log('#################################################');
            console.log('###############- GOSPIDER FINISH.-###############');
            console.log('#################################################');


            gospider.save( (err, gospiderSaved) => {
                if(err){
                    return res.status(400).json({
                        ok: false,
                        message: 'Error executing GoSpider.',
                        errors: err 
                    });
                }

                if(!gospider){
                    return res.status(400).json({
                        ok: false,
                        message: 'GoSpider doesnt exists.',
                        errors: {message: 'GoSpider doesnt exists.'}
                    });
                }

                res.status(200).json({
                    ok: true,
                    message: 'GoSpider Executed Correctly.',
                    gospider: gospiderSaved
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

function GetHttprobeFiles(httprobeDir){
    
    try{
        let httprobeArray = [];

        fs.readdirSync(httprobeDir).forEach(files => {
            httprobeArray.push(files);
        });
    
        return(httprobeArray);
    }   
    catch(err){
        return false;
    }
}

function SaveGoSpiderDirectory(programDir){

    let gospiderDir = `${programDir}GoSpider/`;

    if( fs.existsSync(gospiderDir) ){
        console.log('GoSpider Directory Exists.');
    } else { 
        shell.exec(`mkdir ${gospiderDir}`)
    }

    return gospiderDir;

}

function ExecuteGoSpider(httprobeFile, programDir, gospider){

    let syntax = '';
    let httprobeDir = `${programDir}Httprobe/`;

    try{
        syntax = `${goDir}gospider -S ${httprobeDir}${httprobeFile} -d 0 -t 3 --sitemap -o ${gospider.gospiderDirectory}gospider-${gospider.url}-${date}`;

        shell.exec(syntax);
    }
    catch(err){
        console.log(err);
    }

    return syntax;
}


module.exports = {
    TestGoSpider,
    GetGospiderFiles,
    CallGospider
}