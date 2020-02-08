///##########################################################
/// ARGUMENTOS POR CONSOLA
///##########################################################

const argv = require('yargs')
                .command('findomain', 'Subdomain Enumeration', { // command('COMANDO','LO QUE HACE')
                    url: {
                        demand: true,
                        alias: 'u',
                        desc: 'Escanea y enumera Subdominios automaticamente, y los guarda en subdomains/url.com'
                    }
                })
                .command('wpscan', 'CMS Scanner', {
                    url: {
                        demand: true,
                        alias: 'u',
                        desc: 'Escaner de Wordpress'
                    }
                })
                .help()
                .argv; 

///##########################################################
/// FIN ARGUMENTOS POR CONSOLA
///##########################################################


module.exports = {
    argv
}