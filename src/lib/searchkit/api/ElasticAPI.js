

import {
  HIGHLIGHT_FIELDS
} from "../constants/fields";

const DATE_RANGE_FIELDS = ["firstScanSyncDate"];


const RANGE_FIELDS = { 
  "etext_quality": [
    { "from":0,    "to":0.95 },
    // { "from":0,    "to":0.8  },
    // { "from":0.8,  "to":0.95 },
    { "from":0.95, "to":1.01 },
    { "from":1.99, "to":4.01 },
    // { "from":2.99, "to":3.01 },
    // { "from":3.99, "to":4.01 }
  ],
  "scans_quality": [
    { "from":0,    "to":0.33 },
    { "from":0.33, "to":0.66 },
    { "from":0.66, "to":1.01 }
  ]
};

const HIT_RANGE_FIELDS = { ...RANGE_FIELDS,
  "etext_quality": [
    { "from":0,    "to":0.8  },
    { "from":0.8,  "to":0.95 },
    { "from":0.95, "to":1.01 },
    { "from":1.99, "to":2.01 },
    { "from":2.99, "to":3.01 },
    { "from":3.99, "to":4.01 }
  ]
};

const forgeFacetFilters = (facetFilters, filters) => {
  let allFilters = [];
  if (facetFilters.length > 0) {
    allFilters = [...allFilters, ...facetFilters];
  }
  if (filters) {
    allFilters = [...allFilters, [filters]];
  }
  
  let queryFilters = [] 
  
  allFilters.map((group) => { 

    //console.log("group:",group)

    // DONE: handle AND
    for(const and of group) {

      and = and.includes("AND") ? and.split(" AND ") : [ and ] 
      
      for(const facet of and) {
        
        const should = []

        // DONE: handle OR
        const facets = facet.includes("OR") ? facet.split(" OR ") : [ facet ] 
    
        for(const f of facets) {
          const [field, value] = f.split(":");
          if (DATE_RANGE_FIELDS.includes(field)) {
            should.push({ range: { [field]: createDateRangeQuery(value) } });
            continue;
          }
          if (RANGE_FIELDS[field]) {
            should.push({ range: { [field]: createRangeQuery(value, field) } })
            continue;
          }        
          should.push({ term: { [field]: value } });
        }
        
        queryFilters.push({
          bool: {
            should,
          },
        })
      }
    }
  });

  return queryFilters;
};

const forgeUserAggregateFacets = (facets, size) => {
  const fields = Array.isArray(facets) ? facets : [facets];
    
  return fields.reduce((acc, field) => {
    let ranges
    if(RANGE_FIELDS[field]) { 
      acc[field] = { 
        "range":{
          field,
          ranges: RANGE_FIELDS[field]
        }
      }
    } else {
      acc[field] = {
        "terms": {
          field: field,
          size: size
        },
      }
    };
    return acc;
  }, {});
};


function createRangeQuery(rangeString, field) {
  const regex = /^(.*)-(.*)$/;
  const matches = rangeString.match(regex);

  if (!matches) {
    throw new Error("Invalid range string");
  }

  let [, gte, lte] = matches

  if(gte === "*") gte = null
  if(lte === "*") lte = null
  
  return ({gte, lte})
}

function createDateRangeQuery(dateRangeString) {
  const regex = /\[(.*) TO (.*)\]/;
  const matches = dateRangeString.match(regex);

  if (!matches) {
    throw new Error("Invalid date range string");
  }

  const [, startDate, endDate] = matches;

  const query = {};

  if (startDate !== "*") {
    query.gte = startDate;
  }

  if (endDate !== "*") {
    query.lte = endDate;
  }

  return query;
}

const getCustomQueryPart = (query, filter, field) => {
  const res = ({
    bool: {
      filter: filter
    }
  })
  /* // WIP: query format
  if(field === "bdrc-query") { 
    if(!res.bool.filter.length) delete res.bool.filter
    res.bool["bdrc-query"] = query
  }
  else 
  */
  res.bool.must = [
    {
      multi_match: {
        type: "phrase",
        query: query,
        fields: [
          "seriesName_bo_x_ewts^0.1",
          "seriesName_en^0.1",
          "authorshipStatement_bo_x_ewts^0.005",
          "authorshipStatement_en^0.005",
          "publisherName_bo_x_ewts^0.01",
          "publisherLocation_bo_x_ewts^0.01",
          "publisherName_en^0.01",
          "publisherLocation_en^0.01",
          "prefLabel_bo_x_ewts^1",
          "prefLabel_en^1",
          "comment_bo_x_ewts^0.0001",
          "comment_en^0.0001",
          "altLabel_bo_x_ewts^0.6",
          "altLabel_en^0.6",
        ],
      },
    }
  ]
  return res
}

const getCustomQuery = (query, filter) => {
  return {
    function_score: {
      script_score: {
        script: {
          id: "bdrc-score",
        },
      },
      query: getCustomQueryPart(query, filter) 
    },
  };
};

const getCustomQueryNewAPI = (query, filter) => {
  return {
    function_score: {
      script_score: {
        script: {
          id: "bdrc-score",
        },
      },
      query: getCustomQueryPart(query, filter) //, "bdrc-query")
    },
  };
};

const getDefaultQuery = (filter) => {
  return {
    bool: {
      filter: filter,
      must: {
        rank_feature: {
          field: "pop_score_rk",
        },
      },
    },
  };
};

const getCustomizedBdrcIndexRequest = (request) => {
  let clonedRequest = Object.assign({}, request);
  const userInput = request?.request?.params?.query || "";
  const userPage = request?.request?.params?.page || 0;
  const userHitsPerPage = request?.request?.params?.hitsPerPage || 20;
  const userFacetFilters = request?.request?.params?.facetFilters || [];
  const userFacets = request?.request?.params?.facets || [];
  const userMaxValuePerFacets =
    request?.request?.params?.maxValuesPerFacet || 20;
  const userFilters = request?.request?.params?.filters;

  // Queries
  const userQueryFacetFilters = forgeFacetFilters(
    userFacetFilters,
    userFilters
  );
  const userAggregates = forgeUserAggregateFacets(
    userFacets,
    userMaxValuePerFacets
  );

  clonedRequest.body = {
    from: userPage * userHitsPerPage,
    size: userHitsPerPage,
    aggs: userAggregates,
    highlight: {
      fields: HIGHLIGHT_FIELDS.reduce((acc,f) => ({...acc, [f.label]:{
        ...["prefLabel", "altLabel"].some(l => f.label.startsWith(l))?{ fragment_size: 500 } : {}
      }}), {}),
    },
    query:
      userInput !== ""
        ? getCustomQueryNewAPI(userInput, userQueryFacetFilters)
        : getDefaultQuery(userQueryFacetFilters),
  };


  //console.log("userInput?", userInput, clonedRequest.body.query)

  return clonedRequest;
};


const getGenericRequest = (request) => {
  let clonedRequest = Object.assign({}, request);
  const userInput = request?.request?.params?.query || "";
  const userFacetFilters = request?.request?.params?.facetFilters || [];
  const userFacets = request?.request?.params?.facets || [];
  const userMaxValuePerFacets =
    request?.request?.params?.maxValuesPerFacet || 20;
  const userFilters = request?.request?.params?.filters;

  // Queries
  const userQueryFacetFilters = forgeFacetFilters(
    userFacetFilters,
    userFilters
  );
  const userAggregates = forgeUserAggregateFacets(
    userFacets,
    userMaxValuePerFacets
  );

  clonedRequest.body.aggs = userAggregates
  
  if(userInput) clonedRequest.body.query = getCustomQueryPart(userInput, userQueryFacetFilters) //, "bdrc-query")
  else clonedRequest.body.query.bool.filter = userQueryFacetFilters

  //console.log("userInput?", userInput, clonedRequest.body.query)

  return clonedRequest;
};


const formatAutosuggestReponse = (hits, source = "autosuggest") => {
  if (source === "opensearch") {
    return hits?.hits.map((_hit) => {
      return {
        lang: _hit._source.language && _hit?._source?.language[0],
        res: _hit?._source?.prefLabel_bo_x_ewts,
        category: "",
      };
    });
  }
  return hits;
};

const getAutocompleteElasticRequest = async (queryStr) => {
  const response = await fetch(
    `${process.env.REACT_APP_ELASTICSEARCH_HOST}/_search`,
    {
      headers: {
        Authorization: `Basic ${process.env.REACT_APP_ELASTICSEARCH_BASIC_AUTH}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: {
          match_phrase_prefix: {
            prefLabel_bo_x_ewts: {
              query: queryStr,
            },
          },
        },
      }),
      method: "POST",
    }
  );

  return formatAutosuggestReponse(response.json(), "opensearch");
  // return [];
};

export {
  RANGE_FIELDS,
  HIT_RANGE_FIELDS,
  getGenericRequest,
  getCustomizedBdrcIndexRequest,
  getAutocompleteElasticRequest,
  createDateRangeQuery,
};
