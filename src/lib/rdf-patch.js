
import React, { Component } from 'react';

const uuid = require('uuid/v1')

const rdf   = "http://www.w3.org/1999/02/22-rdf-syntax-ns#" ;
const rdfs  = "http://www.w3.org/2000/01/rdf-schema#" ;
const xsd   = "http://www.w3.org/2001/XMLSchema#" ;

function getPatchValue(tag:string, value:any, dict:{}) {
    
    console.log("prop",prop,value)

    let prop, T, start='', end=''
    prop = dict[tag]
    if(prop) {
        T = prop[rdfs+"range"]
        

        if(T && T.length) {
            if(T[0].value === xsd+"anyURI") { start = "<" ; end = ">" ; }
            else if(T[0].value === rdf+"PlainLiteral") { start = '"' ; end = '"' ; }                
        }
    }
    return start + (value.value?value.value:value) + end
}

function getPatch(iri, updates, resource, tag:string, graph:string, dict) {
    let str = '' 
    for(let u in updates[tag]) {
        if(str !== '') str += "\n"            
        if( !resource[tag] || !resource[tag][u] || resource[tag][u].value !== updates[tag][u].value) { // TODO more generic test (lang etc.)
            if( resource[tag] && resource[tag][u] )  str += `D  <${ iri }> <${ tag }> ${ getPatchValue(tag, resource[tag][u].value, dict) } <${ graph }> .\n`
            str += `A  <${ iri }> <${ tag }> ${ getPatchValue(tag, updates[tag][u].value, dict) } <${ graph }> .`  
        }
    }
    return str ;
}

function renderPatch(that, mods, graph) {

    if(mods && mods.length) {
    
        // TODO change uuid after patch sent or canceled
        if(!that._uuid) that._uuid = uuid()

        let res = that.state.resource
        let upd = that.state.updates
        let iri = that.props.IRI
        let dict = that.props.dictionary

        console.log("patch",res,upd,iri,dict)

        let patch = mods.map(k => getPatch(iri, upd, res, k, graph, dict)).join("\n")

        if(patch) return (
            <pre id="patch" contentEditable="true">
            { `\
H  id      "${ that._uuid }"
H  graph   "${ graph }"
H  mapping "${ graph }-user" .
TX . 
${ patch }
TC . `          } 
            </pre>
        )
    }
}

export default renderPatch ;