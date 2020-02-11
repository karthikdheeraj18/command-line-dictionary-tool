#!/usr/bin/env node

require('dotenv').config();
const fetch = require('node-fetch')

const api_host = process.env.API_HOST
const api_key = process.env.API_KEY
const defn_type = process.argv[2] || null;
const word = process.argv[3] || null;

const dictionary_store = []

//console.log(defn_type,word)

function printStatus(type){
    if (type==='success')
        console.log('\n---------------------------------------SUCCESS!!---------------------------------------')
    else if(type==='end')
        console.log('------------------------------------END OF RESULT!!------------------------------------\n')
    else if(type==='divider')
        console.log('---------------------------------------------------------------------------------------')
}

function CheckDefnAPI(word,api_host,api_key) {
    const info = fetch(`${api_host}/word/${word}/definitions?api_key=${api_key}`)
    .then(response => {
        //console.log(response.ok,response.status)
        if (!response.ok) { throw response }
            return response.json()
    });

    info.then(result => {
        printStatus('success')
        console.log("WORD: ",word.toUpperCase())
        result.map(d => { 
            printStatus('divider')
            console.log('Definition: ',d.text) 
        })
        printStatus('end')
    })
    .catch((error) => { console.log("\nWord Not Found!!\n") })
}

function CheckSynAPI(word,api_host,api_key) {
    const info = fetch(`${api_host}/word/${word}/relatedWords?api_key=${api_key}`)
    .then(response => {
        //console.log(response.ok,response.status)
        if (!response.ok) { throw response }
            return response.json()
    });

    info.then(result => {
        result.map(d => { 
            if (d.relationshipType === 'synonym'){
                //console.log(d.words)
                printStatus('success')
                console.log("WORD: ",word.toUpperCase())
                d.words.map(data => {
                    printStatus('divider')
                    console.log('Synonym: ',data)
                })
                printStatus('end')
            }
        })
    })
    .catch((error) => { console.log("\nWord Not Found!!\n") })
}

function CheckAntAPI(word,api_host,api_key) {
    const info = fetch(`${api_host}/word/${word}/relatedWords?api_key=${api_key}`)
    .then(response => {
        //console.log(response.ok,response.status)
        if (!response.ok) { throw response }
            return response.json()
    });

    info.then(result => {
        result.map(d => { 
            if (d.relationshipType === 'antonym'){
                //console.log(d.words)
                printStatus('success')
                console.log("WORD: ",word.toUpperCase())
                d.words.map(data => {
                    printStatus('divider')
                    console.log('Antonym: ',data)
                })
                printStatus('end')
            }
        })
    })
    .catch((error) => { console.log("\nWord Not Found!!\n") })
}

function CheckExAPI(word,api_host,api_key) {
    const info = fetch(`${api_host}/word/${word}/examples?api_key=${api_key}`)
    .then(response => {
        //console.log(response.ok,response.status)
        if (!response.ok) { throw response }
            return response.json()
    });

    info.then(result => {
        //console.log(result)
        printStatus('success')
        console.log("WORD: ",word.toUpperCase())
        result.examples.map((d,idx) => { 
            printStatus('divider')
            console.log(`Example ${idx}:\n\n`,d.text)
        })
        printStatus('end')
    })
    .catch((error) => { console.log("\nWord Not Found!!\n") })
}

function CheckRandomAPI(api_host,api_key) {
    const info = fetch(`${api_host}/words/randomWord?api_key=${api_key}`)
    .then(response => {
        //console.log(response.ok,response.status)
        if (!response.ok) { throw response }
            return response.json()
    });

    info.then(result => {
        //console.log(result)
        CheckDefnAPI(result.word,api_host,api_key);
    })
    .catch((error) => { console.log(error) })
}

function CheckPlayAPI(api_host,api_key) {
    const info = fetch(`${api_host}/words/randomWord?api_key=${api_key}`)
    .then(response => {
        //console.log(response.ok,response.status)
        if (!response.ok) { throw response }
            return response.json()
    });

    info.then(async result => {
        //console.log(result.word)
        const response2= await fetch(`${api_host}/word/${result.word}/definitions?api_key=${api_key}`)
        const result_defn_data = await response2.json()
        const response3= await fetch(`${api_host}/word/${result.word}/examples?api_key=${api_key}`)
        const result_ex_data = await response3.json()
        const response4= await fetch(`${api_host}/word/${result.word}/relatedWords?api_key=${api_key}`)
        const result_rw_data = await response4.json()

        let defns = result_defn_data.map(d => d.text)
        let exs = result_ex_data.examples.map(d => d.text)
        let syns = []
        let ants = []

        if (result_rw_data[0].relationshipType === 'synonym')
            syns = result_rw_data[0].words
        if (result_rw_data[0].relationshipType === 'antonym')
            ants = result_rw_data[0].words

        //console.log(defns,exs,syns,ants)
        let randomDefn = defns[Math.floor(Math.random() * defns.length)]
        let randomSyn  = syns[Math.floor(Math.random() * syns.length)]
        let randomAnt  = ants[Math.floor(Math.random() * ants.length)]
        let randomEx   = exs[Math.floor(Math.random() * exs.length)]

        console.log()
        printStatus('divider')
        console.log('GUESS THE WORD!!!'), printStatus('divider')
        console.log('Definition: ',randomDefn), printStatus('divider')
        if ((randomSyn||null)!==null) console.log('Synonym: ',randomSyn), printStatus('divider')
        if ((randomAnt||null)!==null) console.log('Antonym: ',randomAnt), printStatus('divider')
        console.log('Example:\n',randomEx), printStatus('divider')

        return [result.word,defns,syns,ants]
    }).then(d => {
        let randomDefn, randomSyn, randomAnt

        // Get process.stdin as the standard input object.
        var standard_input = process.stdin;

        // Set input character encoding.
        standard_input.setEncoding('utf-8');

        // Prompt user to input data in console.
        console.log("\nGuess the word with above information\n");
        process.stdout.write('Enter Input: ')

        // When user input data and click enter key.
        standard_input.on('data', function (data) {
            data = data.trim()
            // User input exit.
            if(data === d[0]){
                console.log("\n\n\n\n");
                console.log("-------------------------------");
                console.log("------------SUCCESS------------");
                console.log("-------------------------------");
                console.log("\n\n\n\n");
                process.exit();
            }
            else if(data.trim() === '1'){
                console.log("\nGuess the word with above information\n")
                process.stdout.write('Enter Input: ')
            }
            else if(data.trim() === '2'){
                let which_hint = Math.floor(Math.random()*4)
                if(which_hint === 0){
                    var arr = d[0].split('');           // Convert String to array
                    arr.sort(() => (0.5 - Math.random()) );  
                    let res = arr.join('');
                    console.log('Hint(word shuffled): ',res,'\n')
                }
                else if(which_hint===2 && (randomSyn||null)!==null ) {
                    randomSyn  = d[2][Math.floor(Math.random() * d[2].length)]
                    console.log('Hint(synonym): ',randomSyn,'\n')
                }
                else if(which_hint===3 && (randomAnt||null)!==null) {
                    randomAnt  = d[3][Math.floor(Math.random() * d[3].length)]
                    console.log('Hint(antonym): ',randomAnt,'\n')
                }
                else{
                    randomDefn = d[1][Math.floor(Math.random() * d[1].length)]
                    console.log('Hint(definition): ',randomDefn,'\n')
                }
                process.stdout.write('Enter Input: ')
            }
            else if(data.trim() === '3'){
                console.log("\n\n\n\n");
                process.exit();
            }else
            {
                console.log('\n1. Try again')
                console.log('2. Hint')
                console.log('3. Quit\n')
                process.stdout.write('Enter Command(1/2/3): ')
            }
        });
    })
    .catch((error) => { console.log(error) })
}

function ResolveDefinitionTypes(defn_type, word, api_host, api_key) {
    const types = ["defn", "syn", "ant", "ex", "play"];
    
    if (word != null){
        if (defn_type === "defn")
            CheckDefnAPI(word,api_host,api_key);
        else if (defn_type === "syn")
            CheckSynAPI(word,api_host,api_key);
        else if (defn_type === "ant")
            CheckAntAPI(word,api_host,api_key);
        else if (defn_type === "ex")
            CheckExAPI(word,api_host,api_key);
    }
    else if (word == null){
        if (defn_type === "play")
            CheckPlayAPI(api_host,api_key);
        else if(defn_type == null)
            CheckRandomAPI(api_host,api_key)
        else if(!types.includes(defn_type)){
            CheckDefnAPI(defn_type,api_host,api_key)
            CheckSynAPI(defn_type,api_host,api_key);
            CheckAntAPI(defn_type,api_host,api_key);
            CheckExAPI(defn_type,api_host,api_key);
        }
        else{
            null//console.log("Test")
        }
    }
    
}

ResolveDefinitionTypes(defn_type, word, api_host, api_key)