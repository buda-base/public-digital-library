// Core
import React, { useEffect, useState } from "react";
import I18n from 'i18next';
import _ from "lodash"

// hooks
import { Configure, useNumericMenu } from "react-instantsearch";

// API
import { searchClient } from "../pages/Search"
import { getPropLabel, fullUri } from '../../../components/App'


const LANGUAGE = "bo-x-ewts";

const getItem = (collection, id) => {
  return collection.find((_item) => _item.id === id);
};

function CustomNumericList(props) {
  const { attribute, that, I18n_prefix, prefix, iri, sort } = props;

  const [title, setTitle] = useState("")

  const numProps = useNumericMenu(props);
  const { items, refine } = numProps

  useEffect(() => {
    setTitle(getPropLabel(that, fullUri(iri ?? (prefix ?? "bdo")+":"+attribute)))
  }, [ that.props.dictionary ])

  console.log("render:", attribute, numProps, items)
  
  if(items.length === 0) return null

  const useItems = sort ? _.orderBy(items,["value"],["desc"]) : items

  return (
    <div className="ais-RefinementList">
      <div className="filter-title"><p>{title}</p></div>
      <ul className="ais-RefinementList-list">
        {useItems.map((item) => (
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
                onChange={(ev) => refine(item.value)}
              />
              <span className="ais-RefinementList-labelText">
                {/*currentItems.find((_item) => _item.id === item.value)?.label ||*/ item.label}
              </span>
              <span className="ais-RefinementList-count">{item.count}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CustomNumericList;
