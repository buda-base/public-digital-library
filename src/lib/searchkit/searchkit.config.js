import Searchkit,{ ESTransporter } from "searchkit";
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

class MyTransporter extends ESTransporter {
  async performNetworkRequest(requests) {

    let body = this.createElasticsearchQueryFromRequest(requests)      

    // choose host dependening on keyword on not
    const useMod = body.includes('"type":"phrase","query":"')
    let host = process.env.REACT_APP_ELASTICSEARCH_HOST_MOD
    if(!useMod) host = process.env.REACT_APP_ELASTICSEARCH_HOST
    else {
      /* // no need anymore
      // adapt to required format
      body = body.split("\n")[1] 
      */
    }    

    // you can use any http client here
    return fetch(host, {
      headers: {
        // Add custom headers here        
        Authorization: `Basic ${process.env.REACT_APP_ELASTICSEARCH_BASIC_AUTH}`,
        "Content-Type": "application/json"
      },
      body,
      method: 'POST'
    })
  }

  async msearch(requests): Promise {
    try {
      const response = await this.performNetworkRequest(requests)
      let responses = await response.json(), useMod = false
      if(!responses.status && !responses.responses && !Array.isArray(responses)) { 
        responses = { responses : [ responses ] }
      }

      if (this.settings?.debug) {
        console.log('Elasticsearch response:')
        console.log(JSON.stringify(responses))
      }

      if (responses.status >= 500) {
        console.error(JSON.stringify(responses))
        throw new Error(
          'Elasticsearch Internal Error: Check your elasticsearch instance to make sure it can recieve requests.'
        )
      } else if (responses.status === 401) {
        console.error(JSON.stringify(responses))
        throw new Error(
          'Cannot connect to Elasticsearch. Check your connection host and auth details (username/password or API Key required). You can also provide a custom Elasticsearch transporter to the API Client. See https://www.searchkit.co/docs/guides/setup-elasticsearch#connecting-with-usernamepassword for more details.'
        )
      } else if (responses.responses?.[0]?.status === 403) {
        console.error(JSON.stringify(responses))
        throw new Error(
          'Auth Error: You do not have permission to access this index. Check you are calling the right index (specified in frontend) and your API Key permissions has access to the index.'
        )
      } else if (responses.status === 404 || responses.responses?.[0]?.status === 404) {
        console.error(JSON.stringify(responses))
        throw new Error(
          'Elasticsearch index not found. Check your index name and make sure it exists.'
        )
      } else if (responses.status === 400 || responses.responses?.[0]?.status === 400) {
        console.error(JSON.stringify(responses))
        throw new Error(
          `Elasticsearch Bad Request.

          1. Check your query and make sure it is valid.
          2. Check the field mapping. See documentation to make sure you are using text types for searching and keyword fields for faceting
          3. Turn on debug mode to see the Elasticsearch query and the error response.
          `
        )
      }

      console.log("responses:",responses)

      const nonEmpty = responses.responses.filter(r => r.status === 200 && r.hits?.hits?.length)
      if(nonEmpty.length) return nonEmpty
      return responses.responses

    } catch (error) {
      throw error
    }
  }

}

// Create a Searchkit client
// This is the configuration for Searchkit, specifying the fields to attributes used for search, facets, etc.
const SearchkitConfig = new Searchkit({

  connection: new MyTransporter(),
  //connection: CONNECTION,

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
}, );

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
    createURL({ qsModule, location, routeState }) {
      
      let { origin, pathname, hash, search } = location, url;
      if(!pathname.endsWith("/search") && !pathname.startsWith("/show/")) pathname = "/osearch/search"
      
      const indexState = routeState['instant_search'] || {};
      const queryString = qsModule.stringify({...qsModule.parse(search.replace(/^\?/,""))??{}, ...routeState});

      url = `${origin}${pathname}?${queryString}${hash}`;      
      
      //console.log("cURL:", search, qsModule.parse(search), queryString, url, location, routeState, indexState, search)

      return url
  
    }
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
