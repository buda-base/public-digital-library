


const fetchLabels = (ids, attribute, lang = "bo-x-ewts") => {  

  
  if(!process.env.REACT_APP_LABEL_API) 
    return new Promise((resolve, reject) => {
      resolve({})
    })
  else {

    console.log("fl:",process.env.REACT_APP_LABEL_API)

    return new Promise((resolve, reject) => {
      try {
        fetch(`${process.env.REACT_APP_LABEL_API}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify(ids),
          })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            const labelsMap = Object.keys(data).reduce((acc, item) => {
              acc[item.replace(/bdr:/,"")] = { id: item.replace(/bdr:/,""), label:Object.keys(data[item]).map(lang => ({lang, value:data[item][lang]})) }
              return acc;
            }, {});
            //console.log("lm:",data)
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
  }
};

export { fetchLabels };
