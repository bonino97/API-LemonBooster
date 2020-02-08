const express = require('express');
const app = express();

//ROUTES

app.get('/', (req, res, next) => {

    res.status(200).json({
        ok: true,
        mensaje: 'Valid Route.'
    });
});

module.exports = app;