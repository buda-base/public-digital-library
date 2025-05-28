// Core
import React, { useEffect, useState } from "react";

// hooks
import { useRefinementList } from "react-instantsearch";

// API
import { fetchLabels } from "../api/LabelAPI";

const LANGUAGE = "bo-x-ewts";

const getItem = (collection, id) => {
  return collection.find((_item) => _item.id === id);
};

function CustomRefinementList(props) {
  const { attribute } = props;

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
    const itemIds = items.map((_item) => _item.value);

    if (!sessionStorage.getItem(attribute)) {
      sessionStorage.setItem(attribute, JSON.stringify([]));
    }

    let storage = JSON.parse(sessionStorage.getItem(attribute));

    // const storedItemIds = storage.map((_storedItem) => _storedItem.id);

    const missingIds = itemIds.filter(
      (_id) =>
        !storage.find(
          (_storedItem) =>
            _storedItem.id === _id && _storedItem.lang === LANGUAGE
        )
    );

    if (missingIds.length > 0) {
      fetchLabels(missingIds, attribute, LANGUAGE)
        .then((response) => {
          console.log("resp:", attribute, response) 

          const newItems = Object.entries(response).map(([id, label]) => {
            return { id:id.replace(/bdr:/,""), label, lang: LANGUAGE };
          });

          storage = [...storage, ...newItems];
          const newCurrentItems = storage.filter((_item) =>
            itemIds.includes(_item.id)
          );

          setCurrentItems(newCurrentItems);
          sessionStorage.setItem(attribute, JSON.stringify(storage));
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      const alreadyKnownItem = JSON.parse(sessionStorage.getItem(attribute));
      const newItems = items.map((_item) => ({
        id: _item.value,
        label: getItem(alreadyKnownItem, _item.value).label,
      }));

      setCurrentItems(newItems);
    }
  }, [attribute, items]);

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
