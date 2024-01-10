// modulos externos
import inquirer from 'inquirer';
import chalk from 'chalk';

// modulos internos (core modules)
import fs from 'fs';

// console.log("Iniciando o Accounts");

//NOTE - A função operation() tem o comportamento de "hoisting" apenas e exclusivamente pela forma de declaração usando apenas a palavra function, se fosse uma function expression isso (a ordem que está escrito = hoisting) retornaria undefined
operation();
function operation() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: `${chalk.bgCyanBright.bold('\r\n Bem-vindo(a) ao Thybank ')}\r\nO que você deseja Fazer?`,
            choices: ['Criar Conta', 'Consultar Saldo', 'Depositar', 'Sacar', `${chalk.red.bold('Sair')}`],
        },
    ]).then(( answer => {
        const action = answer['action']

        switch (action) {
            case 'Criar Conta':
                createAccount();
                break;

            case 'Consultar Saldo':
                getAccountBalance();
                break;

            case 'Depositar':     
                deposit();   
                break;

            case 'Sacar':
                withdraw();
                break; 

            default:    
                console.log(chalk.bgBlue('\r\n Obrigado por usar o Accounts! - by Thybank \r\n'));
                /* 
                    Se essa lógica fosse feita com IF-ELSE ao invés de SWITCH-CASE
                    Para encerrar o programa na opção 'Sair' seria da forma abaixo:
                        process.exit()
                    Dessa maneira o programa é encerrado (o processo do programa)
                */
                break;
        }


    })).catch((e) => console.log(e))
}

//criação de conta - create an account
const createAccount = () => {
    console.log(chalk.bgGreenBright.black('\r\n Parabéns por escolher o nosso banco! '));
    console.log(chalk.greenBright('Defina as opções da sua conta a seguir'));
    buildAccount()
}
// Passos para a criação da conta
const buildAccount = () => {
    inquirer.prompt([
        {
            name: 'accountName',
            message: `Digite um nome para a sua conta:`,
        },
    ]).then (answer => {

        // trim() serve para remover os espaços em branco no começo e no fim
        const accountName = answer['accountName'].trim()
        const objString = JSON.stringify(answer); // convertendo o objeto para uma string JSON

        //verificar se o nome da conta é vazio, se for fica perguntando a té digitar
        if(accountName === ''){
            buildAccount(); // chamada recursiva
            return
        } 
        else {

            //verificar se o diretorio accounts existe se não existir criar ele
            if(!fs.existsSync('accounts')) fs.mkdirSync('accounts');
            
            //verificar se o arquivo de usuario existe no diretorio accounts se não existir, criar ele
            if(fs.existsSync(`./accounts/${accountName}.json`)){
                console.log(
                    chalk.bgRed.white('\r\n Esta conta já existe, escolha outro nome! \r\n'),
                );
                buildAccount(); // chamada recursiva 
            } else {
                // o objString.slice(1, -1) remove o símbolo das chaves do começo e do final da String
                fs.writeFileSync(
                    `./accounts/${accountName}.json`, 
                    `{\r\n \t${objString.slice(1, -1)},\r\n \t"balance":0 \r\n}`, 
                    (err) => {
                        console.log(err)
                    },
                )
                console.log(chalk.black.bgGreenBright('\r\n Parabéns! Sua conta foi criada! \r\n'))

                operation();// volta para o menu, após a criação da conta
            }          
        }
    }).catch ((error) => {console.log(error);})
}

//  depositar - add an amount to user account
const deposit = () =>{
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?'
        },
    ]).then( answer => {
        const accountName = answer['accountName'].trim()
        
        //se a conta/arquivo não existe:
        if(!checkAccount(accountName)){
            return deposit()
        }

        inquirer.prompt([
            {
                name: 'amount',
                message: 'Quanto você deseja depositar?'
            },
        ]).then(answer => {

            // {amount:<valorDigitado>} -> answer['amount'] = <valorDigitado>
            const amount = answer['amount'].replace(',','.').trim()

            // add an amount
            addAmount(accountName, amount)          
        }).catch(e => console.log(e))

    }).catch(e => console.log(err))
}  

// sacar - withdraw an amount from user account
function withdraw(){
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?'
        },
    ]).then( answer => {
        const accountName = answer['accountName'].trim()
        
        //verifica se a conta/arquivo não exite e se não existir pergunta o nome da conta novamente
        if(!checkAccount(accountName)){
            return withdraw()
        }

        inquirer.prompt([
            {
                name: 'amount',
                message: 'Quanto você deseja sacar?'
            },
        ]).then(answer => {
            // {amount:<valorDigitado>} -> answer['amount'] = <valorDigitado>
            const amount = answer['amount'].replace(',','.').trim();

            // add an amount
            removeAmount(accountName, amount);
        }).catch(e => console.log(e))

    }).catch(e => console.log(e))
}

/*********************************************************************/

// Verifica a existência ou inexistência do arquivo/conta
function checkAccount(accountName){
    // se o arquivo não existe
    if(!fs.existsSync(`./accounts/${accountName}.json`)){
        console.log(chalk.bgRed('\r\nEsta conta não existe, tente novamente!\r\n'));
        return false;
    }
    return true;
}

// adiciona valor na chave balance
function addAmount (accountName, amount){

    const accountData = getAccount(accountName) //objeto js
    
    // verifica se o valor a ser depositado foi digitado
    if(!amount) {
        console.log(chalk.bgYellowBright.black('Ocorreu um erro! Tente novamente mais tarde.'));
        return deposit()
    }
    
    // adiciona o valor digitado ao valor existente na chave balance
    accountData.balance = Number((parseFloat(accountData.balance) + parseFloat(amount)).toFixed(2))


    // escreve o que foi alterado no arquivo .json, ou seja, atualiza o valor da chave balance
    fs.writeFileSync(`./accounts/${accountName}.json`,
        JSON.stringify(accountData), //transforma o obj js em texto válido para JSON 
        /* Para o arquivo ser atualizado com o valor digitado, deve-se passar o objeto inteiro obtido no começo
            e será atualizado na escrita, o que foi mudado no objeto, mas de toda forma o que acaba acontecendo 
            é uma reescrita no arquivo, apagando tudo estava antes e atualizando ele por completo (não só o valor 
            que foi digitado, mas também os valores e as chaves que já estavam no arquivo)
        */
        (e) => console.log(e)
    )
    console.log(chalk.green(`Foi depositado o valor de R$${amount} na sua conta!`));
    operation();
}

//Pega o arquivo e converte o json para obj js
function getAccount(accountName){
    // deixa o arquivo disponível para leitura de acordo com o nosso padrão de encoding e com a flag de read (r), e retorna o que foi lido para a variável accountJSON
    const accountJSON = fs.readFileSync(`./accounts/${accountName}.json`, {
        encoding: 'utf-8',
        flag:'r'
    })

    // retorna a conversão do conteúdo do arquivo, outrora .json, em objeto javascript
    return JSON.parse(accountJSON)
}

// show account balance - Verificar saldo
function getAccountBalance() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?'
        },
    ]).then(answer => {
        const accountName = answer['accountName'].trim()

        //verifica se a conta não exite e se não existir faz o que tem dentro do if 
        if(!checkAccount(accountName)){
            //Volta a perguntar o nome da conta
            return getAccountBalance();
        }

        const accountData = getAccount(accountName)// passando o valor do arquivo convertido em objeto js

        let balance = accountData.balance
        
        console.log(`\r\nA conta "${String(accountData.accountName).toUpperCase()}", possui um saldo de ${balance > 0 ? chalk.green('R$'+balance) : chalk.red('R$'+balance)}\r\n`)
        operation()
    }).catch(e => console.log(e))

}

// remove valor na chave balance
function removeAmount(accountName, amount){

    const accountData = getAccount(accountName) //objeto js
    
    // verifica se o valor a ser sacado foi digitado
    if(!amount) {
        console.log(chalk.bgYellowBright.black('Ocorreu um erro! Tente novamente mais tarde.'),);
        return withdraw();
    }
    
    if(accountData.balance < amount){
        console.log(chalk.bgRed('Valor indisponível!'),);
        return withdraw();
    }
    // remove o valor digitado ao valor existente na chave balance
    accountData.balance = Number((parseFloat(accountData.balance) - parseFloat(amount)).toFixed(2))

    // escreve o que foi alterado no arquivo .json, ou seja, atualiza o valor da chave balance
    fs.writeFileSync(`./accounts/${accountName}.json`,
        JSON.stringify(accountData), //transforma o obj js em texto válido para JSON 
        /* Para o arquivo ser atualizado com o valor digitado, deve-se passar o objeto inteiro obtido no começo
            e será atualizado na escrita, o que foi mudado no objeto, mas de toda forma o que acaba acontecendo 
            é uma reescrita no arquivo, apagando tudo estava antes e atualizando ele por completo (não só o valor 
            que foi digitado, mas também os valores e as chaves que já estavam no arquivo)
        */
        (e) => console.log(e)
    )
    console.log(chalk.blue(`Foi realizado um saque no valor de R$${amount} da sua conta!`));
    operation();
}