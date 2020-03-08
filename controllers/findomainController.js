'use strict'

//LIBRARIES

const dateFormat = require('dateformat');
const shell = require('shelljs');
const fs = require('fs');


//MODELS 

const Findomain = require('../models/findomain');
const Program = require('../models/program');

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


        /// SEGUIR ACA CON EL CREADO DE LA CARPETA  + GUARDADO DE ARCHIVOS.
        /// USAR FS PARA VERIFICAR LA EXISTENCIA DE LA CARPETA O PARA CREAR UNA NUEVA 
        /// 

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

function executeFindomain(url, resolvable){

    let syntax = String;
    
    try{

        if(resolvable){
            syntax = `findomain -t ${url} -r -u ./results/findomain/findomain-${url}-${date}.txt`;
        } else {
            syntax = `findomain -t ${url} -u ./results/findomain/findomain-${url}-${date}.txt`;
        }

        shell.echo(syntax);
    }
    catch(err){
        console.log(err);
    }
    return syntax.toString();
}

module.exports = {
    getFindomain,
    callFindomain
}