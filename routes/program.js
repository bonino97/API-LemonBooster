const express = require('express');
const app = express();

//CONTROLLERS

const ProgramController = require('../controllers/programController');

//GET PROGRAMS
app.get('/', ProgramController.getPrograms);

//GET PROGRAM BY ID
app.get('/:id', ProgramController.getProgram);

//ADD PROGRAM
app.post('/', ProgramController.addProgram);

//DELETE PROGRAM BY ID
app.delete('/:id', ProgramController.deleteProgram);

//UPDATE PROGRAM
app.put('/:id', ProgramController.updateProgram);


module.exports = app;
