// Core
import React, { useEffect, useState } from "react";
import I18n from 'i18next';
import _ from "lodash"
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';
import InfoIcon from '@material-ui/icons/Info';
import Tooltip from '@material-ui/core/Tooltip';

// hooks
import { useRefinementList, useInstantSearch } from "react-instantsearch";

// API
import { fetchLabels } from "../api/LabelAPI";

import { searchClient } from "../pages/Search"
import { getPropLabel, fullUri } from '../../../components/App'


const LANGUAGE = "bo-x-ewts";

const getItem = (collection, id) => {
  return collection.find((_item) => _item.id === id);
};

function CustomRefinementList(props) {
  const { attribute, that, I18n_prefix, prefix, iri, sort, sortFunc, defaultItems, className, tooltips } = props;

  const [title, setTitle] = useState("")

  const searchStatus = useInstantSearch();
  const { indexUiState, status } = searchStatus

  useEffect(() => {
    setTitle(getPropLabel(that, fullUri(iri ?? (prefix ?? "bdo")+":"+attribute)))
  }, [ that.props.dictionary, that.props.locale ])

  const [currentItems, setCurrentItems] = useState([]);

  const {
    items,
    refine,
    // searchForItems,
    canToggleShowMore,
    isShowingMore,
    toggleShowMore,
  } = useRefinementList({...props, limit:8, showMoreLimit:10000});

  const current = (indexUiState?.refinementList?.[attribute] ?? []).filter(c => !items.find(i => i.value === c)).map(c => ({ 
    value:c, label:c, highlighted:c, isRefined:true, count:-1
  }))
  const tItems = items?.concat(!items.length 
      ? (defaultItems??[]).filter(i => !current.some(j => i.value === j.value)&&!items.some(j => i.value === j.value)) ?? [] 
      : [])
    .concat(current) ?? []

  useEffect(() => {        

    const updateItems = async () => {
      
      if (!sessionStorage.getItem(attribute)) {
        sessionStorage.setItem(attribute, JSON.stringify({}));
      }

      let storage = JSON.parse(sessionStorage.getItem(attribute));

      const renderItems = (items) => items.map((_item) => { 

        //console.log("item:", attribute, _item)

        const val = getPropLabel(that, fullUri("bdr:"+_item.value), true, false, I18n_prefix ? I18n_prefix+"."+_item.value?.toLowerCase() : "", 1, storage)

        return ({
          id: _item.value,
          label: attribute === "associatedCentury" 
            ? <span>{I18n.t("misc.ord",{num: _item.value})}</span>
            : val
        })

      });
      
      let newItems = renderItems(tItems)

      const missingIds = newItems.filter((item) => item.label === false).map(item => item.id)
      
      if (missingIds.length > 0) {
        try {

          const fetchedItems = await fetchLabels(missingIds, attribute)
          
          storage = {...storage, ...fetchedItems };

          sessionStorage.setItem(attribute, JSON.stringify(storage));

          newItems = newItems.filter(item => item.label != false).concat(renderItems(Object.keys(fetchedItems).map(it => ({ value: it }))))          

          //console.log("ni:", items, newItems, storage)
        }
        catch(error) {
          console.error(error);
        };
      }

      setCurrentItems(newItems);

    }
    
    updateItems()

  }, [attribute, items, indexUiState?.refinementList, that.props.dictionary, that.props.locale, that.props.langPreset, searchClient.cache, isShowingMore]);

  //console.log("render:", attribute, props, currentItems, items, tItems, indexUiState)
  
  if(!defaultItems && (items.length === 0 || items.filter((item) => item.count > 0).length === 0)) return null

  const useItems = sort ? _.orderBy(tItems,sortFunc??["value"],["desc"]) : tItems

  return (
    <div className={"ais-RefinementList "+(className??"")}  data-id={attribute}>
      <div className="filter-title"><p>{title}</p></div>
      {/* <input
        type="search"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        maxLength={512}
        onChange={(event) => searchForItems(event.currentTarget.value)}
      /> */}
                
      <SimpleBar>
      <ul className="ais-RefinementList-list">
        {useItems.map((item) => (

          (item.count > 0 || item.count === -1) 
          ? 
            <li
              key={item.label}
              className={`ais-RefinementList-item ${
                item.isRefined && "ais-RefinementList-item--selected"
              }`}
            >
              <label className="ais-RefinementList-label" data-id={item.value}>
                <input
                  type="checkbox"
                  className="ais-RefinementList-checkbox"
                  checked={item.isRefined}
                  onChange={() => refine(item.value)}
                />
                <span className="ais-RefinementList-labelText">
                  {currentItems.find((_item) => _item.id === item.value)?.label || item.label}
                </span>
                {tooltips && tooltips[item.value] && <Tooltip id="info-tooltip-etext-quality" title={tooltips[item.value]}><InfoIcon className="info-icon" /></Tooltip>}
                {item.count > 0 && <span className="ais-RefinementList-count">{item.count}</span>}
              </label>
            </li>
          : defaultItems 
            ? 
            <li
              key={item.label}
              className={`ais-RefinementList-item ${
                indexUiState?.refinementList?.[attribute]?.includes(item.value) && "ais-RefinementList-item--selected"
              }`}
            >
              <label className="ais-RefinementList-label" data-id={item.value}>
                <input
                  type="checkbox"
                  className="ais-RefinementList-checkbox"
                  checked={indexUiState?.refinementList?.[attribute]?.includes(item.value) ?? false}
                  onChange={() => refine("true") } 
                />
                <span className="ais-RefinementList-labelText">
                  {currentItems.find((_item) => _item.id === item.value)?.label || item.label}
                </span>
              </label>
            </li>

            : null)
        )}
      </ul>                
      </SimpleBar>
      { tItems.length >= 8 && 
        <button
          className="ais-RefinementList-showMore"
          onClick={toggleShowMore}
          //disabled={!canToggleShowMore}
        >
          {isShowingMore ? "Show less" : "Show more"}
        </button>
      }
    </div>
  );
}

export default CustomRefinementList;
