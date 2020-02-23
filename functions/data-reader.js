const fs = require('fs');

fs.readFile('../lists/dicc.txt', 'utf-8', (error, data)=>{
    
    if(error){
        throw error;
    }

    console.log(data);

})