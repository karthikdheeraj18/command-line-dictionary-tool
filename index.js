#!/usr/bin/env node

require('dotenv').config();
const fetch = require('node-fetch')

var MongoClient = require('mongodb').MongoClient;

const api_host = process.env.API_HOST
const api_key = process.env.API_KEY
const mongodb_connect = process.env.MONGODB_CONNECT
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
    .catch((error) => { console.log(error) })
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

async function GetAllWordsAPI(api_host,api_key) {

    const allWords = []
    while (allWords.length < 42){
        const response = await fetch(`${api_host}/words/randomWord?api_key=${api_key}`)
        const result = await response.json()
        console.log(result)
        if (!allWords.includes(result.word))
            allWords.push(result.word)
        console.log(allWords.length)
    }
    //console.log(allWords)

    const MongoClient = require('mongodb').MongoClient;
    const uri = mongodb_connect;
    //mongodb_connect;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    
    await client.connect(async err => {
        if(err) { return console.dir(err); }

        const collection = await client.db("command-line-dictionary-db").collection("dictionary");

        allWords.map(async d => {
            const response2= await fetch(`${api_host}/word/${d}/definitions?api_key=${api_key}`)
            const result_defn_data = await response2.json()
            const response3= await fetch(`${api_host}/word/${d}/examples?api_key=${api_key}`)
            const result_ex_data = await response3.json()
            const response4= await fetch(`${api_host}/word/${d}/relatedWords?api_key=${api_key}`)
            const result_rw_data = await response4.json()
    
            let defns = result_defn_data.map(d => d.text)
            let exs = result_ex_data.examples.map(d => d.text)
            let syns = []
            let ants = []
    
            if (result_rw_data[0].relationshipType === 'synonym')
                syns = result_rw_data[0].words
            if (result_rw_data[0].relationshipType === 'antonym')
                ants = result_rw_data[0].words
            
            obj = {"word":d,"definitions":defns,"synonyms":syns,"antonyms":ants,"examples":exs}
            dictionary_store.push(obj)

            await collection.insertOne(obj, {w:1});
            //console.log(dictionary_store.length)
        })   
    });
    client.close();
}

function ResolveDefinitionTypes(defn_type, word, api_host, api_key) {
    const types = ["defn", "syn", "ant", "ex", "play"];

    //GetAllWordsAPI(api_host,api_key)
    
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
            null//CheckPlayAPI(word,api_host,api_key);
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