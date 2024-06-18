import React, { useState, useEffect } from "react";
import { Configure } from "react-instantsearch";

const MyDateRange = (props) => {
  const { attribute } = props;

  const [beforeDate, setBeforeDate] = useState();
  const [afterDate, setAfterDate] = useState();
  const [request, setRequest] = useState();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    for (const p of searchParams) {
      console.log("p", p);
      if (p[0] === `${attribute}_before`) {
        setBeforeDate(p[1]);
      }
      if (p[0] === `${attribute}_after`) {
        setAfterDate(p[1]);
      }
    }
  }, []);

  useEffect(() => {
    let newRequest;

    if (beforeDate && afterDate) {
      newRequest = `${attribute}:[${beforeDate} TO ${afterDate}]`;
    } else if (beforeDate) {
      newRequest = `${attribute}:[${beforeDate} TO *]`;
    } else if (afterDate) {
      newRequest = `${attribute}:[* TO ${afterDate}]`;
    }

    setRequest(newRequest);
  }, [beforeDate, afterDate, attribute]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Configure attribute={attribute} filters={request} />
      <input
        type="date"
        value={beforeDate}
        max={afterDate || null}
        onChange={(e) => {
          setBeforeDate(e.target.value);
        }}
      />
      <input
        type="date"
        min={beforeDate || null}
        value={afterDate}
        onChange={(e) => {
          setAfterDate(e.target.value);
        }}
      />
    </>
  );
};

export default MyDateRange;
