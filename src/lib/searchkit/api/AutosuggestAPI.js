const getAutocompleteRequest = async (query) => {
  const url = process.env.REACT_APP_AUTOSUGGEST_HOST;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });
  return response.json();
};

export { getAutocompleteRequest };
