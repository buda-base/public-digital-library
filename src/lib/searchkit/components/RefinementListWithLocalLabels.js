// Core
import React, { useEffect, useState } from "react";
import I18n from 'i18next';

// hooks
import { useRefinementList } from "react-instantsearch";

// API
import { fetchLabels } from "../api/LabelAPI";

import { getPropLabel, fullUri } from '../../../components/App'

const LANGUAGE = "bo-x-ewts";

const getItem = (collection, id) => {
  return collection.find((_item) => _item.id === id);
};

function CustomRefinementList(props) {
  const { attribute, that, I18n_prefix } = props;

  const [currentItems, setCurrentItems] = useState([]);

  const {
    items,
    refine,
    // searchForItems,
    canToggleShowMore,
    isShowingMore,
    toggleShowMore,
  } = useRefinementList(props);

  useEffect(() => {

    
    const newItems = items.map((_item) => ({
      id: _item.value,
      label: attribute === "associatedCentury" 
        ? <span>{I18n.t("misc.ord",{num: _item.value})}</span>
        : getPropLabel(that, fullUri("bdr:"+_item.value), true, false, I18n_prefix ? I18n_prefix+"."+_item.value.toLowerCase() : ""),
    }));

    console.log("items:",attribute, items, that, newItems)

    setCurrentItems(newItems);
  
  }, [attribute, items, that.props.dictionary, that.props.locale, that.props.langPreset]);

  
  return (
    <div className="ais-RefinementList">
      {/* <input
        type="search"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        maxLength={512}
        onChange={(event) => searchForItems(event.currentTarget.value)}
      /> */}
      <ul className="ais-RefinementList-list">
        {items.map((item) => (
          <li
            key={item.label}
            className={`ais-RefinementList-item ${
              item.isRefined && "ais-RefinementList-item--selected"
            }`}
          >
            <label className="ais-RefinementList-label">
              <input
                type="checkbox"
                className="ais-RefinementList-checkbox"
                checked={item.isRefined}
                onChange={() => refine(item.value)}
              />
              <span className="ais-RefinementList-labelText">
                {getItem(currentItems, item.value)?.label || item.label}
              </span>
              <span className="ais-RefinementList-count">{item.count}</span>
            </label>
          </li>
        ))}
      </ul>
      { items.length >= 10 &&
        <button
          className="ais-RefinementList-showMore"
          onClick={toggleShowMore}
          disabled={!canToggleShowMore}
        >
          {isShowingMore ? "Show less" : "Show more"}
        </button>
      }
    </div>
  );
}

export default CustomRefinementList;
