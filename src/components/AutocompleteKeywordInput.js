
import React, { useState, useEffect } from "react"
import HTMLparse from "html-react-parser";
import { Link } from "react-router-dom"
import I18n from 'i18next';
import $ from "jquery"

import { keywordtolucenequery, lucenequerytokeyword } from "./App"

let timer;
const debounce = (func, timeout = 300) => {
   return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => { func.apply(this, args); }, timeout);
   };
}       

export default function AutocompleteKeywordInput(props) {

   const { that } = props
   const [keyword,setKeyword] = useState("")
   const [suggest,setSuggest] = useState([])

   useEffect(() => {
    const kw = that?.state.keyword ?? that?.props.keyword ? lucenequerytokeyword(that?.state.keyword ?? that?.props.keyword) : ""
    if(keyword != kw) setKeyword(kw)
   }, [ that?.props.keyword, that?.state.keyword ])

   const getAutocomplete = async (e)  => {

    const searchString = e.target.value, server = that.props.config.autocomplete;  

    //console.log("auto:", searchString, server)
    
    if (searchString.length > 0) {
            
      try {

        const response = await fetch(server.endpoints[server.index]+'/autosuggest', { // ADJUST PORT IF NECESSARY
        method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({query: searchString})
        })
        const data = (await response.json()).filter(d => d.res)
        
        //console.log("suggest:", data)

        setSuggest(data)
        

      }
      catch(error) { 
        console.error('Error fetching suggestions:', error);
      }
      
      that.setState({keyword:searchString})

    } else {

        //document.getElementById('suggestions').style.display = 'none'; // Hide if input is cleared
      setSuggest([])
    }    
  }
   
   const changeKeyword = (ev) => {
      ev.persist()
      //console.log("change:", ev)
      setKeyword(ev.target.value)      
      debounce(getAutocomplete)(ev)
   }

   const removeSuggestions = () => { 
    setTimeout(() => setSuggest([]), 150)
   }

   return <>
    <input placeholder="Search" type="text" value={keyword ?? ""} onChange={changeKeyword} onFocus={changeKeyword} onBlur={removeSuggestions}
      />
      { suggest?.length > 0 && <>
        <div class="suggest-bg" onClick={removeSuggestions}></div>
        <div class="suggestions">
          { suggest.map(s => <span>
              <Link to={"/search?q="+keywordtolucenequery(s.res.replace(/<[^>]+>/g,""), s.lang)+"&lg="+s.lang+"&t="+(s.category ? s.category : "Instance")}>
                <span class="suggest-str">{HTMLparse(s.res)}</span>
                { s.category && <>
                  <span class="suggest-in">in</span>
                  <span class="suggest-types">{I18n.t("types."+s.category.toLowerCase(), { count:2 })}<img src={"/icons/search/"+s.category.toLowerCase()+".svg"}/></span>
                </>}
              </Link>
            </span> ) }
        </div> 
      </>}  
      { that.state.filters 
        ? <a style={{cursor: "pointer"}} onClick={() => that.props.onAdvancedSearch(true)}>Advanced search</a>
        : <Link to="/" onClick={(ev) => { 
          that.props.onAdvancedSearch(true)
          that.props.history.push({pathname:"/",search:""}); 
          if(that.props.keyword) { that.props.onResetSearch();}
          if(window.innerWidth > 800 && !that.state.filters)  setTimeout(() => {
             $("#search-bar input").click()
             document.querySelector("#search-bar input").focus()
             document.querySelector("#search-bar").scrollIntoView({block: "start", inline: "nearest", behavior:"smooth"})
          },500)
          ev.preventDefault()
          ev.stopPropagation()          
       }}>Advanced search</Link>}
   </>
}
