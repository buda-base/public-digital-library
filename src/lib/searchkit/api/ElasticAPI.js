const DATE_RANGE_FIELDS = ["firstScanSyncDate"];

const forgeFacetFilters = (facetFilters, filters) => {
  let allFilters = [];
  if (facetFilters.length > 0) {
    allFilters = [...allFilters, ...facetFilters];
  }
  if (filters) {
    allFilters = [...allFilters, [filters]];
  }

  let queryFilters = allFilters.map((group) => ({
    bool: {
      should: group.map((facet) => {
        const [field, value] = facet.split(":");
        if (DATE_RANGE_FIELDS.includes(field)) {
          return { range: { [field]: createDateRangeQuery(value) } };
        }
        return { term: { [field]: value } };
      }),
    },
  }));

  return queryFilters;
};

const forgeUserAggregateFacets = (facets, size) => {
  const fields = Array.isArray(facets) ? facets : [facets];

  return fields.reduce((acc, field) => {
    acc[field] = {
      terms: {
        field: field,
        size: size,
      },
    };
    return acc;
  }, {});
};

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

const getCustomQuery = (query, filter) => {
  return {
    function_score: {
      script_score: {
        script: {
          id: "bdrc-score",
        },
      },
      query: {
        bool: {
          filter: filter,
          must: [
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
            },
            {
              multi_match: {
                type: "phrase_prefix",
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
            },
          ],
        },
      },
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
      fields: {
        prefLabel_bo_x_ewts: {},
        altLabel_bo_x_ewts: {},
        seriesName_bo_x_ewts: {},
        seriesName_en: {},
        content_en: {},
      },
    },
    query:
      userInput !== ""
        ? getCustomQuery(userInput, userQueryFacetFilters)
        : getDefaultQuery(userQueryFacetFilters),
  };

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
  getCustomizedBdrcIndexRequest,
  getAutocompleteElasticRequest,
  createDateRangeQuery,
};
