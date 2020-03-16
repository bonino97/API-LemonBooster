///#############################################################################
/// TOOLS --> PASOS A SEGUIR PARA CONFIGURAR CORRECTAMENTE: 
//     1 - COLOCAR EL COMANDO EN YARGS.
//     2 - COLOCAR LA TOOL EN enumTools.
//     3 - COLOCAR LA TOOL EN EL SWITCH.
//     4 - COLOCAR LA FUNCION QUE DESEE EJECUTAR EN EL SWITCH
///#############################################################################

// const command = argv._[0];

// const enumTools = {
//     FINDOMAIN: 'findomain', 
//     WPSCAN: 'wpscan'
// }
 
///#############################################################################
//                   SWITCH CON TOOLS + FUNCIONES 
///#############################################################################
// switch(command){
//     case enumTools.FINDOMAIN: 
//             executeFindomain();
//         break;
//     case enumTools.WPSCAN: 
//             executeWpScan();
//         break;
//     default: 
//         console.log('Error: Invalid Command');
//         break;
// }

///#############################################################################
///                     FIN DE CONFIGURACION DE TOOLS
///#############################################################################



///##########################################################
/// FUNCIONES CON COMANDOS PARA EJECUTAR DESDE BASH 
///##########################################################


// function executeFindomain(){
//     shell.echo(`findomain -t ${argv.u}`);
// }

// function executeWpScan(){
//     shell.echo('wpscan --update');
//     shell.echo(`wpscan --url ${argv.u}`);
// }

// setTimeout(() => {
//     shell.echo('##### 1 #####');
// }, 3000);

// const nodeVersion = async() => {
//     shell.exec('node -v');
// }

// function executeCommand(comando){
//     setTimeout(() => {
//         shell.echo(comando);
//     }, 5000);
// }

// async function executeCommand2(comando){
//     setTimeout(() => {
//         shell.echo(comando);
//     }, 5000);
// }

// async function executeCommand3(comando){
//     setTimeout(() => {
//         shell.echo(comando);
//     }, 5000);
// }

// const theVersion = async () => {
//     const result = await nodeVersion().then(res => {
//         return result;
//     });
// }

// console.log();



// shell.exec('mkdir testing');
// shell.exec('cd testing && mkdir testing2 && cd .. && cd .. && ls');
// shell.exec('rm -r testing')