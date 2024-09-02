import React, { useState } from "react"
import I18n from 'i18next';

import IconButton from '@material-ui/core/IconButton';
import ChevronUp from '@material-ui/icons/KeyboardArrowUp';
import ChevronDown from '@material-ui/icons/KeyboardArrowDown';

export default function EtextSearchBox(props) {

  const { that } = props

  const [query, setQuery] = useState("")

  return <div class="etext-search">
    <input value={query} 
      placeholder={I18n.t("resource.searchT",{type:I18n.t("resource.text")})}
      onChange={(event) => {
        const newQuery = event.currentTarget.value;
        setQuery(newQuery);
      }}    
    />
    <IconButton disabled={!query}><ChevronUp />{I18n.t("resource.prev")}</IconButton>
    <IconButton disabled={!query}><ChevronDown />{I18n.t("resource.showNnodes")}</IconButton>
  </div>   
}