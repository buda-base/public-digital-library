
import React, { Component } from 'react';

const uuid = require('uuid/v1')

const bdgu  = "http://purl.bdrc.io/graph-nc/user/" ;
const bdgup = "http://purl.bdrc.io/graph-nc/user-private/" ;
const bdou  = "http://purl.bdrc.io/ontology/ext/user/" ;
const rdf   = "http://www.w3.org/1999/02/22-rdf-syntax-ns#" ;
const rdfs  = "http://www.w3.org/2000/01/rdf-schema#" ;
const skos  = "http://www.w3.org/2004/02/skos/core#";
const xsd   = "http://www.w3.org/2001/XMLSchema#" ;

export const basePublicProps = [ skos+"prefLabel", bdou+"image" ] 

function getPatchValue(tag:string, value:any, dict:{}) {
    
    //console.log("prop",prop,value)

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

function getPatch(iri, updates, resource, tag:string, id:string, dict) {

    //console.log("getP",iri,updates,resource,tag,graph,dict)

    let graph = bdgu+id
    let graphP = bdgup+id
        
    let str = '' 
    for(let u in updates[tag]) {

        //console.log("u",u,updates[tag][u])

        let pub = basePublicProps.indexOf(tag) !== -1

        //if(str !== '') str += "\n"            
        if( !resource[tag] || !resource[tag][u] || ( resource[tag][u].value !== updates[tag][u].value ) ) { // TODO more generic test (lang etc.)
            let val
            if( resource[tag] && resource[tag][u] )  { 
                val = getPatchValue(tag, resource[tag][u].value, dict)
                str += `D  <${ iri }> <${ tag }> ${ val } <${ graphP }> .\n`
                if(pub) str += `D  <${ iri }> <${ tag }> ${ val } <${ graph }> .\n`
            }
            val = getPatchValue(tag, updates[tag][u].value, dict)
            str += `A  <${ iri }> <${ tag }> ${ val } <${ graphP }> .\n`  
            if(pub) str += `A  <${ iri }> <${ tag }> ${ val } <${ graph }> .\n`  
        }
    }
    return str ;
}

function renderPatch(that, mods, id) {

    if(mods && mods.length) {
    
        // TODO change uuid after patch sent or canceled
        if(!that._uuid) that._uuid = uuid()

        let res = that.state.resource
        let upd = that.state.updates
        let iri = that.props.IRI
        let dict = that.props.dictionary

        let graph = bdgu+id
        let graphP = bdgup+id

        //console.log("patch",mods,res,upd,iri,dict)

        let patch = mods.map(k => getPatch(iri, upd, res, k, id, dict)).join("")

        if(patch) return (
            <pre id="patch" contentEditable="true">
            { `\
H  id      "${ that._uuid }"
H  scope   "${ graph }-public,${ graphP }-private" . 
H  graph   "${ graph },${ graphP }"
H  mapping "${ graph }-user,${ graphP }-user" .
TX . 
${ patch }\
TC . `          } 
            </pre>
        )
    }
}

export default renderPatch ;