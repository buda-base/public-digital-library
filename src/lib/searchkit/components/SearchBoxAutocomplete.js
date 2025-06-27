import React, { useState, useRef, useCallback, useEffect } from "react";
import _ from "lodash"
import SearchIcon from '@material-ui/icons/Search';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import qs from "query-string"
import I18n from 'i18next';
import { Trans } from 'react-i18next'
import Paper from '@material-ui/core/Paper';

// hooks
import { useSearchBox, useInstantSearch, useClearRefinements } from "react-instantsearch";
import { useNavigate, useLocation } from "react-router-dom"

// utils
import { debounce } from "../helpers/utils";
//import history from "../../../history"
//import { routingConfig } from "../searchkit.config"
import { lucenequerytokeyword } from "../../../components/App"

// api
import { getAutocompleteRequest } from "../api/AutosuggestAPI";


export function updateHistory(query, pageFilters) {
  // #895
  const latest = JSON.parse(localStorage.getItem('latest_searches') ?? "{}")
  const date = Date.now()
  latest[query] = { query, pageFilters, date }
  localStorage.setItem('latest_searches', JSON.stringify(latest))
}
  

const redirect = (refine, query, pageFilters, navigate, location, forceSearch) => {
  //console.warn("redir:", query, pageFilters)
  updateHistory(query, pageFilters)
  
  //refine(query)

  
  const loca = location  
  if(loca.pathname.startsWith("/search") 
    || !loca.pathname.endsWith("/search") && !loca.pathname.endsWith("/show/")  // && !loca.pathname.startsWith("/tradition/") 
       && !pageFilters && !forceSearch){          
             
      
    /*
    window.postRefine = () => {
      console.warn("REFINE:",query)        
      delete window.postRefine
      refine(query)
    } 
    */   
      
    //refine(query)
    navigate("/osearch/search?q="+encodeURIComponent(query))
    //routingConfig.router._push("/osearch/search?q="+encodeURIComponent(query))

    console.log("NAV:","/osearch/search?q="+encodeURIComponent(query))

  } else {
    refine(query)
  }
  
  
}

const MAX_ITEMS = 8, MAX_ITEMS_HISTO = 3 

const SearchBoxAction = ({ inputValue, isSearchStalled, refine, pageFilters, onReset, forceSearch }) => {

  const navigate = useNavigate()
  const location = useLocation()

  return (
    <>
      <button type="submit" className="ais-SearchBox-submit" 
        onClick={()=> redirect(refine, inputValue, pageFilters, navigate, location, forceSearch)}>
          Submit
      </button>
      <button
        className="ais-SearchBox-reset"
        type="reset"
        title="Clear the search query"
        hidden={inputValue.length === 0 || isSearchStalled}
        onClick={onReset}
      >
        <svg
          className="ais-SearchBox-resetIcon"
          viewBox="0 0 20 20"
          width="10"
          height="10"
          aria-hidden="true"
        >
          <path d="M8.114 10L.944 2.83 0 1.885 1.886 0l.943.943L10 8.113l7.17-7.17.944-.943L20 1.886l-.943.943-7.17 7.17 7.17 7.17.943.944L18.114 20l-.943-.943-7.17-7.17-7.17 7.17-.944.943L0 18.114l.943-.943L8.113 10z"></path>
        </svg>
      </button>
      <span hidden={!isSearchStalled}>
        <span className="ais-SearchBox-loadingIndicator" hidden="">
          <svg
            width="16"
            height="16"
            viewBox="0 0 38 38"
            stroke="#444"
            className="ais-SearchBox-loadingIcon"
            aria-hidden="true"
          >
            <g fill="none" fillRule="evenodd">
              <g transform="translate(1 1)" strokeWidth="2">
                <circle strokeOpacity=".5" cx="18" cy="18" r="18"></circle>
                <path d="M36 18c0-9.94-8.06-18-18-18">
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 18 18"
                    to="360 18 18"
                    dur="1s"
                    repeatCount="indefinite"
                  ></animateTransform>
                </path>
              </g>
            </g>
          </svg>
        </span>
      </span>
    </>
  );
};

export const SuggestsList = ({ items, onClick, isVisible, selected, query, pageFilters, setIsFocused, setActualLength, setActualList }) => {

  const [histo, setHisto] = useState([])
  const [noDup, setNoDup] = useState(items)

  useEffect(() => {
    const latest = _.orderBy(
      (Object.values(JSON.parse(localStorage.getItem('latest_searches') ?? "{}"))??[])
        .filter(t => (!pageFilters && !t.pageFilters || pageFilters === t.pageFilters) && (!query || t.query.startsWith(query))),
        [ "date" ],
        [ "desc" ]
      )
      
    const newNoDup = items.filter(i => ![0,1,2,3].includes(latest.findIndex(l => l.query === i.res.replace(/<[^>]+>/g,""))))    
    const newHisto = latest.slice(0,MAX_ITEMS-Math.min(newNoDup.length,MAX_ITEMS)+MAX_ITEMS_HISTO).map(t => ({ fromHisto:true, res:query+"<suggested>"+t.query?.substring(query?.length)+"</suggested>"}))
    setHisto(newHisto)

    const list = newHisto.concat(newNoDup).slice(0,MAX_ITEMS)
    if(setActualLength) setActualLength(list.length) //Math.min(10, newHisto.length + items.length))
    if(setActualList) setActualList(list)

    setNoDup(newNoDup)
    //console.log("histo:", latest, query, newHisto)
    

  }, [items, query, isVisible])

  const removeHisto = useCallback((ev,idx) => {  
    const latest = JSON.parse(localStorage.getItem('latest_searches') ?? "{}")    
    delete latest[histo[idx].res.replace(/<[^>]+>/g,"")]
    localStorage.setItem('latest_searches', JSON.stringify(latest))
    
    setIsFocused(false)
    setHisto([...histo].filter((h,i) => i != idx))

    setTimeout(() => setIsFocused(true), 350)
  }, [histo])

  return (
    <ul className="search-result-wrapper suggestions" hidden={!isVisible}>
      {histo.concat(noDup).slice(0,MAX_ITEMS).map((_suggest, _index) => (
        <li
          key={_index}
          className={"search-result-item "+(selected === _index ? "selected ":"")+(_suggest.fromHisto ? "fromHisto ":"")}          
        >
          <span  onClick={() => onClick(_suggest)}>
            { _suggest.fromHisto 
            ? <AccessTimeIcon /> 
            : <SearchIcon /> }
            <span className="search-result-item-lang" >{_suggest.lang}</span>
            <span
              onClick={() => onClick(_suggest)}
              className="search-result-item-res"
              dangerouslySetInnerHTML={{ __html: _suggest.res }}
              ></span>
            <span className="search-result-item-category">
              {_suggest.category}
            </span>
            </span>
          { _suggest.fromHisto  && <IconButton onClick={(ev) => removeHisto(ev, _index)}>
              <CloseIcon />
            </IconButton> }
        </li>
      ))}
    </ul>
  );
};

export const formatResponseForURLSearchParams = (query) => {
  return query.split("<suggested>").join("").split("</suggested>").join("");
};

const SearchBoxAutocomplete = (props) => {
  const { query, refine  } = useSearchBox(props);
  const { status, setUiState, indexUiState, results, refresh } = useInstantSearch();
  const { loading, placeholder, pageFilters, routing, that, inner, forceSearch } = props

  const forceFocus = that?.state.forceFocus

  const [inputValue, setInputValue] = useState(query);
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const [selected, setSelected] = useState(-1)

  const inputRef = useRef(null);

  const isSearchStalled = status === "stalled";

  //const [suggestionLen, setSuggestionLen] = useState(0)
  const [actualList, setActualList] = useState([])

  //console.log("pF:", placeholder, pageFilters)

  const { refine: clearRefine } = useClearRefinements(props);

  const navigate = useNavigate()
  const location = useLocation()
  
  /*
  useEffect(() => {
    if(uiState && window.shouldUpdateRoute) console.log("routing:",
      routingConfig.stateMapping.stateToRoute(uiState),
      routingConfig.stateMapping.routeToState(qs.parse(history.location.search, {arrayFormat: 'index'}))
    )
  }, [status, routingConfig, uiState])
  */


  useEffect(() => {
    if(results.processingTimeMS && ["idle"].includes(status) && window.postRefine) {
      if(window.postRefine) {
        window.postRefine() 
      }
    }
  }, [status, results])
 
  useEffect(() => {
    if (query !== "") {
      getAutocompleteRequest(query, pageFilters).then((requests) => {
        setSuggestions(requests);
      });
    }    

    const handlePopState = (event) => {
      let { search } = routing.router.getLocation()
      const r = qs.parse(search, {arrayFormat: 'index'})
      const s = routing.stateMapping.routeToState(r)
      setInputValue(r.q ?? "")    
    }
    
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
    

  }, []);

  const setQuery = (newQuery) => {
    setInputValue(newQuery);
    if (newQuery.length === 0) {
      setSuggestions([]);
    }

    /* // disables search-as-you-type
    refine(newQuery);
    */
  };

  const debouncedHandleChange = useCallback(
    debounce((newValue) => {
      getAutocompleteRequest(newValue, pageFilters).then((requests) => {
        //console.log("debounced:", newValue, pageFilters)
        setSuggestions(requests);
      });
    }, 350),
    [ pageFilters ]
  );

  const debouncedHandleClick = useCallback(
    debounce((item) => {
      //console.log("debounced:",item)
      handleClick(item)
    }, 150),
    [ handleClick ]
  );
  const handleClick = useCallback((item) => {
    if(!inner) that.props.onAdvancedSearch(false, undefined)
    clearRefine([])
    const newQuery = formatResponseForURLSearchParams(item.res);
    setQuery(newQuery);
    setIsFocused(false);
    redirect(refine, newQuery, pageFilters, navigate, location, forceSearch);    
  }, [refine, pageFilters])

  const handleChange = useCallback((newQuery) => {
    setSelected(-1)
    setIsFocused(true);
    setQuery(newQuery);
    if (newQuery.length > 0) {
      debouncedHandleChange(newQuery);
    }
    if(newQuery && that.state.forceFocus) that.setState({forceFocus:false})
  }, [debouncedHandleChange])

  const advToSimpleFromSimple = useCallback(() => {
    if(inner) return
    //if(inputRef.current) inputRef.current.focus()
    const k = lucenequerytokeyword(that.props.advKeyword)
    if(k != inputValue) setQuery(k)
  }, [that?.props.advKeyword, handleChange, inputValue])

  useEffect(() => {
    if(inner) return
    if(that.props.advKeyword != undefined) advToSimpleFromSimple()
  }, [that?.props.advKeyword])

  const advToSimpleFromAdv = useCallback(() => {
    if(inner) return
    //if(inputRef.current) inputRef.current.focus()
    const k = lucenequerytokeyword(that.state.keyword)
    if(k != inputValue) setQuery(k)
  }, [that?.state.keyword, handleChange, inputValue])

  useEffect(() => {
    if(inner) return
    if(that.state.keyword != undefined) advToSimpleFromAdv()
  }, [that?.state.keyword])

  const suggLen = (actualList?.length ?? suggestions.length)

  const [howTo, setHowTo] = useState(false)

  useEffect(() => {
    that.setState({collapse:{...that.state.collapse, isFocused}})
  }, [isFocused])

  const ref = useRef()

  //console.log("sL:",suggLen, selected)

  return (
    <form
      action=""
      role="search"
      className="ais-SearchBox-form search-input"
      noValidate
      data-submit-hidden={isSearchStalled}
      onBlur={() => {
        setTimeout(() => {
          setIsFocused(false);
        }, 200);
      }}
      onSubmit={(event) => {
        clearRefine([])
        event.preventDefault();
        event.stopPropagation();

        if (inputRef.current) {
          inputRef.current.blur();
        }
      }}
      onReset={(event) => {
        event.preventDefault();
        event.stopPropagation();

        setQuery("");

        if (inputRef.current) {
          inputRef.current.focus();
        }
      }}
    >
      <h2>{I18n.t("topbar.placeHda")}</h2>
      <input
        ref={inputRef}
        className="ais-SearchBox-input"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        maxLength={512}
        type="search"
        value={inputValue}
        {...placeholder ? { placeholder} : { placeholder: I18n.t("topbar.placeHda") } }
        onFocus={(ev) => {
          setIsFocused(true);
          handleChange(inputValue)
        }}
        onClick={() => {
          if(that.state.forceFocus) that.setState({forceFocus:false})
        }}
        onBlur={() => {
          if(that.state.forceFocus) that.setState({forceFocus:false})
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setIsFocused(false);
            /* // no need (submit button already triggered by default when hitting enter)
            refine(inputValue);
            */
            // case when selection with keyboard
            if(selected != -1 && actualList?.[selected]) {
              debouncedHandleClick(actualList?.[selected])
              e.preventDefault()
              e.stopPropagation()
            }
          } else if(e.key === "ArrowDown") {
            if(!suggLen) return
            const newSel = (selected === -1 ? 0 : selected + 1) % suggLen
            setSelected(newSel)
          } else if(e.key === "ArrowUp") {
            if(!suggLen) return
            const newSel = (selected === -1 ? suggLen - 1 : selected - 1 + suggLen) % suggLen
            setSelected(newSel)
          } 
        }}
        onChange={(event) => handleChange(event.currentTarget.value)}
      />
      <SearchBoxAction
        inputValue={inputValue}
        isSearchStalled={isSearchStalled || loading}
        refine={refine}
        pageFilters={pageFilters}
        onReset={() => setQuery("")}      
        forceSearch={forceSearch}  
      />
      <SuggestsList
        {...{ selected, setIsFocused, pageFilters }}
        query={inputValue}
        items={suggestions}
        onClick={debouncedHandleClick}
        isVisible={isFocused && !forceFocus}
        //setActualLength={setSuggestionLen}
        setActualList={setActualList}
      />
      { !inner && <><div id="simple-search" ref={ref}>
          <a class="regular"><span class="new">{I18n.t("topbar.new")}</span><Trans i18nKey="topbar.phonetics" components={{ita:<i/>}}/></a>
          <a onClick={() => setHowTo(!howTo)}>{I18n.t("topbar.howToF")}</a>
          <a onClick={() => {
            that.setState({[that.state.filters?"keyword":"SKquery"]:lucenequerytokeyword(inputValue)})
            that.props.onAdvancedSearch(true)
          }}>{I18n.t("topbar.advanced")}
          </a>
        </div>
        { howTo && <>
          <div class="popHowTo bg" onClick={() => setHowTo(false)}></div>
          <Paper 
            id="popHowTo" 
            onBlur={() => alert("blur")}
          >
            <div>
              <IconButton onClick={() => setHowTo(false)}>
                <CloseIcon /> 
              </IconButton>{
              ["tibetan","codes","AND","chinese","sanskrit","khmer","scope"].map(k => <div>
                <p style={{margin:"1em 0"}}>
                  <b>{I18n.t("topbar.how."+k+".title")}</b>
                  <br/>
                  <Trans i18nKey={"topbar.how."+k+".body"} components={{ nl : <br />, ita: <i /> }}/>
                </p>
              </div>)
            }</div>
          </Paper>
        </> }
      </> 
    }
    </form>
  );
};

export default SearchBoxAutocomplete;
