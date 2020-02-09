#!/usr/bin/env node

require('dotenv').config();
const fetch = require('node-fetch')

const api_host = process.env.API_HOST
const api_key = process.env.API_KEY
const defn_type = process.argv[2] || null;
const word = process.argv[3] || null;

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
    .catch((error) => { console.log(error) })
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
    .catch((error) => { console.log(error) })
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
    .catch((error) => { console.log(error) })
}

function ResolveDefinitionTypes(defn_type, word, api_host, api_key) {
    const types = ["defn", "syn", "ant", "ex", "play"];
    //var n = fruits.includes("Mango");

    if (word != null){
        if (defn_type === "defn")
            CheckDefnAPI(word,api_host,api_key);
        else if (defn_type === "syn")
            CheckSynAPI(word,api_host,api_key);
        else if (defn_type === "ant")
            CheckAntAPI(word,api_host,api_key);
        else if (defn_type === "ex")
            null//CheckExAPI(word,api_host,api_key);
    }
    else if (word == null){
        if (defn_type === "play")
            null//CheckPlayAPI(word,api_host,api_key);
        else if(!types.includes(defn_type))
            null//console.log(defn_type)
        else if(defn_type == null)
            null//console.log('no command')
        else{
            null//console.log("Test")
        }
    }
    
}

ResolveDefinitionTypes(defn_type, word, api_host, api_key)