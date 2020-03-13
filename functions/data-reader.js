const fs = require('fs');

fs.readFile('./test/dicc.txt', 'utf-8', (error, data)=>{
    
    if(error){
        throw error;
    }

    console.log(data);

})