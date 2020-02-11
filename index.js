#!/usr/bin/env node


require('dotenv').config();
const fetch = require('node-fetch')

//configuring data from .env
const api_host = process.env.API_HOST
const api_key = process.env.API_KEY
//getting data from command line arguments
const defn_type = process.argv[2] || null;
const word = process.argv[3] || null;

//for debugging
//console.log(defn_type,word)

//prints status on command line
function printStatus(type){
    if (type==='success')
        console.log('\n---------------------------------------SUCCESS!!---------------------------------------')
    else if(type==='end')
        console.log('------------------------------------END OF RESULT!!------------------------------------\n')
    else if(type==='divider')
        console.log('---------------------------------------------------------------------------------------')
    else if(type==='dict')
        console.log('\n-------------------------------------DICTIONARY!!--------------------------------------')
}

//getting data from definition's API
function CheckDefnAPI(word,api_host,api_key) {
    const info = fetch(`${api_host}/word/${word}/definitions?api_key=${api_key}`)
    .then(response => {
        //console.log(response.ok,response.status)
        if (!response.ok) { throw response }
            return response.json()
    });

    info.then(result => {
        printStatus('dict')
        console.log('WORD: ',word.toUpperCase())
        printStatus('divider')
        console.log('DEFINITIONS')
        result.map( (d,idx) => { 
            console.log(`Definition ${idx+1}: `,d.text) 
        })
        printStatus('divider')
    })
    .catch((error) => { console.log('\nWord Not Found!!\n') })
}

//getting data from relatedWords's API for synonyms
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
                printStatus('dict')
                console.log('WORD: ',word.toUpperCase())
                printStatus('divider')
                console.log('SYNONYMS')
                d.words.map( (data,idx) => {
                    console.log(`Synonym ${idx+1}: `,data)
                })
                printStatus('divider')
            }
        })
    })
    .catch((error) => { console.log('\nWord Not Found!!\n') })
}

//getting data from relatedWords's API for antonyms
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
                printStatus('dict')
                console.log('WORD: ',word.toUpperCase())
                printStatus('divider')
                console.log('ANTONYMS')
                d.words.map( (data,idx) => {
                    console.log(`Antonym ${idx+1}: `,data)
                })
                printStatus('divider')
            }
        })
    })
    .catch((error) => { console.log('\nWord Not Found!!\n') })
}

//getting data from example's API
function CheckExAPI(word,api_host,api_key) {
    const info = fetch(`${api_host}/word/${word}/examples?api_key=${api_key}`)
    .then(response => {
        //console.log(response.ok,response.status)
        if (!response.ok) { throw response }
            return response.json()
    });

    info.then(result => {
        //console.log(result)
        printStatus('dict')
        console.log('WORD: ',word.toUpperCase())
        result.examples.map((d,idx) => { 
            printStatus('divider')
            console.log(`Example ${idx+1}:\n\n`,d.text)
        })
        printStatus('divider')
    })
    .catch((error) => { console.log('\nWord Not Found!!\n') })
}

//getting data from randomWord's API
function CheckRandomAPI(api_host,api_key) {
    const info = fetch(`${api_host}/words/randomWord?api_key=${api_key}`)
    .then(response => {
        //console.log(response.ok,response.status)
        if (!response.ok) { throw response }
            return response.json()
    });

    info.then(result => {
        //console.log(result)
        GetFullDict(result.word,api_host,api_key);
    })
    .catch((error) => { console.log(error) })
}

//getting data from relatedWords's API for Command Line Game
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
        //declaring defitions,synonyms and antonyms variables for getting data dynamically(later)
        let randomDefn, randomSyn, randomAnt

        // Get process.stdin as the standard input object.
        var standard_input = process.stdin;

        // Set input character encoding.
        standard_input.setEncoding('utf-8');

        // Prompt user to input data in console.
        console.log('\nGuess the word with above information\n');
        process.stdout.write('Enter Input: ')

        // When user input data and click enter key.
        standard_input.on('data', function (data) {
            // User input exit.
            
            //trimming data for eliminating whitespaces before and after
            data = data.trim()

            if(data === d[0] || d[2].includes(data) ){
                //if user data matches with random api data, show success message
                console.log('\n\n\n\n');
                console.log('-------------------------------');
                console.log('------------SUCCESS------------');
                console.log('-------------------------------');
                console.log('\n\n\n\n');
                process.exit();
            } else if(data.trim() === '1'){
                //1. Try Again
                console.log('\nGuess the word with above information\n')
                process.stdout.write('Enter Input: ')
            } else if(data.trim() === '2'){
                //2. Hint

                //Deciding Hint options by random
                let which_hint = Math.floor(Math.random()*4)
                if(which_hint === 0){
                    var arr = d[0].split('');
                    arr.sort(() => (0.5 - Math.random()) );  
                    let res = arr.join('');
                    console.log('Hint(word shuffled): ',res,'\n')
                } else if(which_hint===2 && (randomSyn||null)!==null ) {
                    randomSyn  = d[2][Math.floor(Math.random() * d[2].length)]
                    console.log('Hint(synonym): ',randomSyn,'\n')
                } else if(which_hint===3 && (randomAnt||null)!==null) {
                    randomAnt  = d[3][Math.floor(Math.random() * d[3].length)]
                    console.log('Hint(antonym): ',randomAnt,'\n')
                } else{
                    randomDefn = d[1][Math.floor(Math.random() * d[1].length)]
                    console.log('Hint(definition): ',randomDefn,'\n')
                }
                process.stdout.write('Enter Input: ')
            } else if(data.trim() === '3'){
                //3. Quit
                const prom = GetFullDict(d[0],api_host,api_key)
                prom.then(()=>{
                    process.exit();
                })
            } else
            {
                //If user enters wrong input, show options

                console.log('\n1. Try again')
                console.log('2. Hint')
                console.log('3. Quit\n')
                process.stdout.write('Enter Command(1/2/3): ')
            }
        });
    })
    .catch((error) => { console.log(error) })
}

async function GetFullDict(word,api_host,api_key) {

    const response2= await fetch(`${api_host}/word/${word}/definitions?api_key=${api_key}`)
    const result_defn_data = await response2.json()
    const response3= await fetch(`${api_host}/word/${word}/examples?api_key=${api_key}`)
    const result_ex_data = await response3.json()
    const response4= await fetch(`${api_host}/word/${word}/relatedWords?api_key=${api_key}`)
    const result_rw_data = await response4.json()
        
    //Formatting data into arrays
    let defns = []
    if(Array.isArray(result_defn_data)===true)
        defns = result_defn_data.map(d => d.text)
    let exs = []
    if(Array.isArray(result_ex_data.examples)===true)
        exs = result_ex_data.examples.map(d => d.text)
    let syns = []
    let ants = []
    //console.log(result_rw_data)
    if(Array.isArray(result_rw_data)===true){
        result_rw_data.map(d => {
            if (d.relationshipType === 'synonym')
                syns = d.words
            if (d.relationshipType === 'antonym')
                ants = d.words
        })
    }

    
    if(defns.length==0 && syns.length==0 && ants.length==0 && exs.length==0)
        console.log('\nWord Not Found!!\n')
    else{
        //Printing Full Dictionary to console
        printStatus('dict')
        console.log('WORD: ',word.toUpperCase())

        if (defns.length>0) printStatus('divider'), console.log('DEFINITIONS')
        defns.map( (d,idx) => {
            console.log(`Definition ${idx+1}: `,d)
        })

        if (syns.length>0) printStatus('divider'), console.log('SYNONYMS')
        syns.map( (d,idx) => {
            console.log(`Synonym ${idx+1}: `,d)
        })

        if (ants.length>0) printStatus('divider'), console.log('ANTONYMS')
        ants.map( (d,idx) => {
            console.log(`Antonym ${idx+1}: `,d)
        })

        if (exs.length>0) printStatus('divider')
        exs.map( (d,idx) => {
            console.log(`Example ${idx+1}:\n\n`,d)
            printStatus('divider')
        })
    }

}

function ResolveDefinitionTypes(defn_type, word, api_host, api_key) {
    const types = ['defn', 'syn', 'ant', 'ex', 'play'];
    
    if (word !== null){
        //If word is entered(definition type entered included)

        if (defn_type === 'defn')
            CheckDefnAPI(word,api_host,api_key);
        else if (defn_type === 'syn')
            CheckSynAPI(word,api_host,api_key);
        else if (defn_type === 'ant')
            CheckAntAPI(word,api_host,api_key);
        else if (defn_type === 'ex')
            CheckExAPI(word,api_host,api_key);
    } else if (word === null){
        //If word is not entered(definition type entered/not entered/definition type as word)

        if (defn_type === 'play')
            //command line game
            CheckPlayAPI(api_host,api_key);
        else if(defn_type == null)
            //getting a random word definition
            CheckRandomAPI(api_host,api_key)
        else if(!types.includes(defn_type)){
            //defn_type here is a word entered
            GetFullDict(defn_type,api_host,api_key)
        } else{
            console.log('error')
        }
    }
    
}

ResolveDefinitionTypes(defn_type, word, api_host, api_key)