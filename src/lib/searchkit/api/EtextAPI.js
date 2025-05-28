const getEtextSearchRequest = async (args) => {
  const {query, lang, id, etext_vol, etext_instance} = args
  console.log("etextsearch:", args)
  const url = process.env.REACT_APP_ETEXTSEARCH_HOST;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  return response.json();
};

export { getEtextSearchRequest };
