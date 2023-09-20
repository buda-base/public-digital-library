
import React, { Component } from 'react';
import {shortUri,fullUri} from '../components/App'

import logdown from 'logdown'

const loggergen = new logdown('gen', { markdown: false });

const uuid = require('uuid/v1')

const bdgu  = "http://purl.bdrc.io/graph-nc/user/" ;
const bdgup = "http://purl.bdrc.io/graph-nc/user-private/" ;
const bdou  = "http://purl.bdrc.io/ontology/ext/user/" ;
const foaf  = "http://xmlns.com/foaf/0.1/" ;
const rdf   = "http://www.w3.org/1999/02/22-rdf-syntax-ns#" ;
const rdfs  = "http://www.w3.org/2000/01/rdf-schema#" ;
const skos  = "http://www.w3.org/2004/02/skos/core#";
const tmp   = "http://purl.bdrc.io/ontology/tmp/" ;
const xsd   = "http://www.w3.org/2001/XMLSchema#" ;

export const basePublicProps = [ skos+"prefLabel", bdou+"image" ] 

function getPatchValue(tag:string, value:any, dict:{}, locale:string, oldT?:string) {
    
    loggergen.log("prop:",tag,value,dict,locale)

    let prop, T, start='', end=''
    prop = dict[tag]
    if(prop) {
        T = prop[rdfs+"range"]

        loggergen.log("range:",T)        

        if(T && T.length) {
            if(T[0].value === rdf+"langString") { start = '"' ; end = '"' ; if(locale && T[0].lang) end+="@"+locale; }     
            else if(T[0].value === rdf+"PlainLiteral") { start = '"' ; end = '"' ; }                
            else if(T[0].value === xsd+"anyURI" || T[0].type === "uri" /*|| tag === bdou+"mainResidenceArea"*/ ) { start = "<" ; end = ">" ; }
        }
    }
    else if(tag === foaf+"mbox" || tag === tmp+"agreeEmail" || tag === tmp+"otherInterest") { start = '"' ; end = '"' ;  if(locale && tag === tmp+"otherInterest") end+="@"+locale; }
    let vals = value
    if(vals.value) vals = vals.value
    if(!Array.isArray(vals)) vals = [ vals ]
    if(!oldT) return vals.map(v => start + fullUri(v) + end)
    else return vals.map( (v,i) => {
        if(start === '"' && oldT[i] === "uri") return "<" + fullUri(v) + ">"
        if(start === '<' && oldT[i] === "literal") return '"' + fullUri(v) + '"'
        else return start + fullUri(v) + end 
    })
}

function getPatch(iri, updates, resource, tag:string, id:string, dict:{}, locale:string) {

    //loggergen.log("getP",iri,updates,resource,tag,graph,dict)

    let graph = bdgu+id
    let graphP = bdgup+id
        
    let str = '' 
    for(let u in updates[tag]) {

        loggergen.log("u:",u,updates[tag][u])

        let pub = basePublicProps.indexOf(tag) !== -1
        let uv = updates[tag][u].value
        if(!Array.isArray(uv)) uv = [ uv ]
        let rv = [], toDel =  [], toAdd = [ ...uv ], toDelT = []
        if(resource[tag]) {
            rv = resource[tag].map(v => v.value)
            toDel = [ ...rv.filter(v => !uv.includes(v) ) ]
            toDelT = resource[tag].filter(v => !uv.includes(v.value)).map(v => v.type)
            toAdd = toAdd.filter(v => v && !rv.includes(v)) 
        }
        loggergen.log("add/del:",toAdd,toDel,toDelT)
        let diff = ( rv.length != uv.length || toDel.length || toAdd.length)

        //if(str !== '') str += "\n"            
        if( !resource[tag] || !resource[tag][u] || ( diff ) ) { // TODO more generic test (lang etc.)
            let vals
            if( toDel.length )  { 
                vals = getPatchValue(tag, toDel, dict, locale, toDelT)
                for(let val of vals) {
                    str += `D  <${ iri }> <${ tag }> ${ val } <${ graphP }> .\n`
                    if(pub) str += `D  <${ iri }> <${ tag }> ${ val } <${ graph }> .\n`
                }
            }
            vals = getPatchValue(tag, toAdd, dict, locale)
            for(let val of vals) {
                str += `A  <${ iri }> <${ tag }> ${ val } <${ graphP }> .\n`  
                if(pub) str += `A  <${ iri }> <${ tag }> ${ val } <${ graph }> .\n`  
            }
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

        let locale = that.props.locale

        let graph = bdgu+id
        let graphP = bdgup+id

        loggergen.log("patch",mods,res,upd,iri,dict,locale)

        let patch = mods.map(k => getPatch(iri, upd, res, k, id, dict, locale)).join("")

// H  id      "${ that._uuid }"

        if(patch) return (`\
H  graph   "${ graph },${ graphP }" .
H  mapping "${ graph }-user,${ graphP }-user" .
H  scope   "${ graph }-public,${ graphP }-private" . 
TX . 
${ patch }\
TC . ` )
    }
}

export default renderPatch ;