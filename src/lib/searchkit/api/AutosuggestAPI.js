
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

export { getAutocompleteRequest };
