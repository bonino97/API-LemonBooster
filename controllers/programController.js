'use strict'

//MODELS 

const Program = require('../models/program');


//=====================================================================
// Obtain all Programs
//=====================================================================

function getPrograms(req,res){
    Program.find({})
    .exec((err,programs) => {
        if(err){
            return res.status(400).json({
                ok: false,
                mensaje: 'Error loading programs.',
                errors: err
            });
        }

        return res.status(200).json({
            ok:true,
            programs
        })
    });
}

//=====================================================================
// Obtain one Program
//=====================================================================


function getProgram(req,res){
    let id = req.params.id;

    Program.findById(id, (err, program) => {
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

        return res.status(200).json({
            ok:true,
            program: program
        });
    });
}

//=====================================================================
// Add new Program
//=====================================================================

function addProgram(req,res){
    var body = req.body;

    var program = new Program({
        name: body.name,
        domain: body.domain,
        scope: body.scope
    });

    program.save((err,programSaved)=>{
        
        if(err){
            throw err;
        }

        res.status(200).json({
            ok:true,
            program: programSaved
        });
    });
}

//=====================================================================
// Delete Program By Id
//=====================================================================

function deleteProgram(req,res){
    var id = req.params.id;
    
    Program.findByIdAndRemove(id, (err,removedProgram) => {
        
        if(err){
            return res.status(400).json({
                ok: false,
                message: 'Error removing program.',
                errors: err 
            });
        }

        if(!removedProgram){
            return res.status(500).json({
                ok: false,
                message: 'Doesnt exist a program with this id.' ,
                error: { message: 'Doesnt exist a program with this id.' }
            });
        }

        res.status(200).json({
            ok: true,
            program: removedProgram
        });
    });
}

//=====================================================================
// Update Program By Id
//=====================================================================

function updateProgram(req, res){
    var body = req.body;
    var id = req.params.id;

    Program.findById(id, (err, program) => {
        if(err){
            return res.status(400).json({
                ok: false,
                message: 'Error updating program.',
                errors: err 
            });
        }

        if(!program){
            return res.status(500).json({
                ok: false,
                message: 'Doesnt exist a program with this id.' ,
                error: { message: 'Doesnt exist a program with this id.' }
            });
        }

        program.name = body.name;
        program.domain = body.domain;
        program.scope = body.scope;

        console.log(program);
        
        program.save((err, updatedProgram) => {
            if(err){
                return res.status(400).json({
                    ok: false,
                    message: 'Error saving program.',
                    errors: err 
                });
            }
            res.status(200).json({
                ok:true,
                program: updatedProgram
            });
        });
    });
}

module.exports = {
    getPrograms,
    getProgram,
    addProgram,
    deleteProgram,
    updateProgram
}