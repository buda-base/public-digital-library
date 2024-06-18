const fetchLabels = (ids, attribute, lang = "bo-x-ewts") => {
  
  if(!process.env.REACT_APP_LABEL_API) 
    return new Promise((resolve, reject) => {
      resolve({})
    })
  else
    return new Promise((resolve, reject) => {
      try {
        fetch(`${process.env.REACT_APP_LABEL_API}/${attribute}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ids, lang }),
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            const labelsMap = data.reduce((acc, item) => {
              acc[item.id] = item.label;
              return acc;
            }, {});
            resolve(labelsMap);
          })
          .catch((error) => {
            reject(error);
          });
      } catch (error) {
        console.error("Error fetching labels:", error);
        reject(error);
      }
    });
};

export { fetchLabels };
