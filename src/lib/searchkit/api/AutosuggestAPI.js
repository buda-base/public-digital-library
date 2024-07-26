const getAutocompleteRequest = async (query, filters = "") => {
  console.log("auto:", query, filters)
  let scope = filters.split(":")
  if(scope[0] === "associated_res" && scope[1]) scope = [ scope[1] ]
  else scope = undefined
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
