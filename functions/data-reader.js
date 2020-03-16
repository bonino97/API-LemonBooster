const fs = require('fs');

// fs.readFile('./test/dicc.txt', 'utf-8', (error, data)=>{
    
//     if(error){
//         throw error;
//     }

//     console.log(data);

// })
const testDir = '../results/findomain/'
fs.readdir(testDir, (err, files) => {
    files.forEach(file => {
      console.log(file);
    });
  });