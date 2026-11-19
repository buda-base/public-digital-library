
const getAutocompleteRequest = async (query, filters = "") => {
  console.log("auto:", query, filters);
  
  // Traitement des filtres
  let scope = undefined;
  if (filters) {
    // Séparer les différentes conditions (séparées par OR)
    const filterGroups = filters.split(" OR ").map(f => f.trim());
    
    // Extraire les valeurs pour chaque type de filtre
    const extractedScopes = filterGroups.map(filter => {
      const [type, value] = filter.split(":");
      if (type === "associated_res" && value) {
        return value;
      } else if (type === "language" || type === "script") {
        return value;
      }
      return null;
    }).filter(Boolean); // Éliminer les valeurs null
    
    // Si nous avons des scopes valides, les utiliser
    if (extractedScopes.length > 0) {
      scope = extractedScopes;
    }
  }

  const url = process.env.REACT_APP_AUTOSUGGEST_HOST;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, scope }),
  });
  return response.json();
};

/* Suggestions for the list of collections (/osearch/search?type[0]=Collection), where
   the box searches the collections only: the autosuggest service above completes any
   string of the catalogue and cannot be told a type, so these come from the search
   index itself, the collections whose name starts with what was typed. Same shape as
   the service's answer, the whole name as the suggested part. Picking one searches
   that name, as everywhere else. (Known issue, for the index: a phrase search on a
   name holding a code, "… (EAP1490)" or "EAP 1034-2: …", finds nothing today.)

   The name goes into the list as HTML and back into the box as text, with only the
   tags stripped (formatResponseForURLSearchParams): so it is not entity-escaped,
   which would put "&#39;" in the query; the two characters that would make markup
   are dropped instead. */
const toSuggestionText = (str) => str.replace(/[<>]/g, "");

const LABEL_FIELDS = [["prefLabel_en", "en"], ["prefLabel_bo_x_ewts", "bo_x_ewts"], ["prefLabel_zh_hans", "zh_hans"]]

const getCollectionAutocompleteRequest = async (query) => {
  const body = {
    size: 10,
    _source: LABEL_FIELDS.map(([field]) => field),
    query: {
      bool: {
        filter: [{ term: { type: "Collection" } }],
        must: [{ multi_match: { query, type: "phrase_prefix", fields: [...LABEL_FIELDS.map(([field]) => field), "altLabel_en", "altLabel_bo_x_ewts"] } }],
      },
    },
  };
  const response = await fetch(process.env.REACT_APP_ELASTICSEARCH_HOST, {
    method: "POST",
    headers: {
      Authorization: `Basic ${process.env.REACT_APP_ELASTICSEARCH_BASIC_AUTH}`,
      "Content-Type": "application/x-ndjson",
    },
    body: JSON.stringify({ index: process.env.REACT_APP_ELASTICSEARCH_INDEX }) + "\n" + JSON.stringify(body) + "\n",
  });
  const json = await response.json();
  const seen = new Set();
  return (json?.responses?.[0]?.hits?.hits ?? []).flatMap((hit) => {
    const [field, lang] = LABEL_FIELDS.find(([f]) => hit._source?.[f]?.length) ?? [];
    const label = field && hit._source[field][0];
    if (!label || seen.has(label)) return [];
    seen.add(label);
    return [{ lang, res: "<suggested>" + toSuggestionText(label) + "</suggested>" }];
  });
};

export { getAutocompleteRequest, getCollectionAutocompleteRequest };
