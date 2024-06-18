import Searchkit from "searchkit";
import { history } from "instantsearch.js/es/lib/routers";

// Constant
import {
  SEARCH_FIELDS,
  RESULT_FIELDS,
  HIGHLIGHT_FIELDS,
} from "./constants/fields";

import { FACET_ATTRIBUTES } from "./constants/facets";

const CONNECTION = {
  host: process.env.REACT_APP_ELASTICSEARCH_HOST,
  headers: {
    // optional headers sent to Elasticsearch or elasticsearch proxy
    Authorization: `Basic ${process.env.REACT_APP_ELASTICSEARCH_BASIC_AUTH}`,
  },
};
// Create a Searchkit client
// This is the configuration for Searchkit, specifying the fields to attributes used for search, facets, etc.
const SearchkitConfig = new Searchkit({
  connection: CONNECTION,
  search_settings: {
    search_attributes: SEARCH_FIELDS.filter(
      (_field) => _field.highlightable
    ).map((_field) => _field.label),
    result_attributes: RESULT_FIELDS.map((_field) => _field.label),
    highlight_attributes: HIGHLIGHT_FIELDS.filter(
      (_field) => _field.highlightable
    ).map((_field) => _field.label),
    facet_attributes: FACET_ATTRIBUTES,
    filter_attributes: [
      {
        attribute: "firstScanSyncDate",
        field: "firstScanSyncDate",
        type: "date",
      },
    ],
    sorting: {
      default: {
        field: "bdrc_prod",
        order: "desc",
      },
      firstScanSyncDate_desc: {
        field: "firstScanSyncDate",
        order: "desc",
      },
      publicationDate_desc: {
        field: "publicationDate",
        order: "desc",
      },

      publicationDate_asc: {
        field: "publicationDate",
        order: "asc",
      },
    },
  },
});

const formatFirstScanSyncDateRangeFromUiState = (uiState) => {
  const { configure = {} } = uiState;

  let result = {};

  if (configure.filters) {
    const attribute = configure.filters.split(":")[0];

    const filters = configure.filters.split(":")[1];

    const [beforeDate, afterDate] = filters
      .replace(/[\[\]]/g, "")
      .split(" TO ");
    if (beforeDate !== "*") result[`${attribute}_before`] = beforeDate;
    if (afterDate !== "*") result[`${attribute}_after`] = afterDate;
  }

  return result;
};

const routingConfig = {
  router: history({
    cleanUrlOnDispose: false,
  }),
  stateMapping: {
    stateToRoute(uiState) {
      const indexUiState = uiState[process.env.REACT_APP_ELASTICSEARCH_INDEX];
      const firstScanSyncDate =
        formatFirstScanSyncDateRangeFromUiState(indexUiState);

      const { firstScanSyncDate_before, firstScanSyncDate_after } =
        firstScanSyncDate;

      return {
        q: indexUiState.query,
        ...FACET_ATTRIBUTES.reduce(
          (obj, item) =>
            Object.assign(obj, {
              [item.attribute]: indexUiState.refinementList?.[item.attribute],
            }),
          {}
        ),
        sortBy: indexUiState.sortBy,
        firstScanSyncDate_before,
        firstScanSyncDate_after,
        page: indexUiState.page,
      };
    },
    routeToState(routeState) {
      const { firstScanSyncDate_before, firstScanSyncDate_after } = routeState;
      return {
        [process.env.REACT_APP_ELASTICSEARCH_INDEX]: {
          query: routeState.q,
          refinementList: {
            ...FACET_ATTRIBUTES.reduce(
              (obj, item) =>
                Object.assign(obj, {
                  [item.attribute]: routeState?.[item.attribute],
                }),
              {}
            ),
          },
          sortBy: routeState.sortBy,
          page: routeState.page,
          firstScanSyncDate_before,
          firstScanSyncDate_after,
          filters: `firstScanSyncDate:[${firstScanSyncDate_before || "*"} TO ${
            firstScanSyncDate_after || "*"
          }]`,
        },
      };
    },
  },
};

export default SearchkitConfig;
export { routingConfig };
