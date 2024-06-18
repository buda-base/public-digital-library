import React from "react";

import { Highlight } from "react-instantsearch";

import { RESULT_FIELDS } from "../constants/fields";

const Hit = ({ hit, label }) => {
  return (
    <>
      <b>{label} : </b>
      <Highlight hit={hit} attribute={label} />
    </>
  );
};

const CustomHit = ({ hit }) => {
  return (
    <ul>
      {RESULT_FIELDS.map(
        (_field, _key) =>
          !!hit[_field.label] && (
            <li key={_key}>
              {_field.highlightable ? (
                <Hit hit={hit} label={_field.label} />
              ) : (
                <>
                  <b>{_field.label} : </b>
                  {hit[_field.label]}
                </>
              )}
            </li>
          )
      )}
    </ul>
  );
};

export default CustomHit;
