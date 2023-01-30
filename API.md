# API

### Search result selection in an iframe

It is possible to embed the PDL in an iframe for search results selection. This can be done through the URL

```
/simplesearch?q={searchterm}&lg={searchterm_langtag}&t={type}&for={msgId}&f={filters}
```

With the following arguments:
- `{searchterm}` is the keyword
- `{searchterm_langtag}` is the lang tag associated with a keyword (ex: `bo` for Tibetan)
- `{type}` is the plain English label of a type (ex: `Work`)
- `{msgId}` is the message id that will be used in postMessage (see below)
- `{filters}` is the list of filters to use in the search (ex: `provider,inc,bda:CP021` to filter records provided by BDRC, these can be copied from a regular search URL)


When an iframe is open on such a URL, when the user will click on a search result, instead of displaying the associated page, the iframe will instead call [postMessage()](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) on the opening window, with a message having the following format:

```json
{
  "tmp:propid": "the {msgId} above",
  "@id": "id of the selected search result",
  "skos:prefLabel": [
  	{
  		"@language": "lang tag",
  		"@value": "preferred label (name, title, etc.) of the selected search result"
  	}
  ],
  "skos:altLabel": same format as skos:prefLabel,
  "tmp:keyword": {
  	"@language": "the {searchterm_langtag} used in the URL",
  	"@value": "the {searchterm_langtag} used in the URL"
  },
  "tmp:notFound": a boolean indicating if a result was found
}
```

Note that `skos:prefLabel` and `skos:altLabel` are not mandatory.