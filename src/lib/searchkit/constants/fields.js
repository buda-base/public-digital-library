// const OLD_ALL_FIELDS = [
//   { label: "language", highlightable: true },
//   { label: "seriesName_bo_x_ewts", highlightable: true },
//   { label: "seriesName_en", highlightable: true },
//   { label: "authorshipStatement_bo_x_ewts", highlightable: true },
//   { label: "authorshipStatement_en", highlightable: true },
//   { label: "publisherName_bo_x_ewts", highlightable: true },
//   { label: "publisherLocation_bo_x_ewts", highlightable: true },
//   { label: "publisherName_en", highlightable: true },
//   { label: "publisherLocation_en", highlightable: true },
//   { label: "prefLabel_bo_x_ewts", highlightable: true },
//   { label: "prefLabel_en", highlightable: true },
//   { label: "comment_bo_x_ewts", highlightable: true },
//   { label: "comment_en", highlightable: true },
//   { label: "altLabel_bo_x_ewts", highlightable: true },
//   { label: "altLabel_en", highlightable: true },
//   { label: "author.prefLabel_bo_x_ewts", highlightable: true },
//   { label: "author.prefLabel_en", highlightable: true },
//   { label: "translator.prefLabel_bo_x_ewts", highlightable: true },
//   { label: "translator.prefLabel_en", highlightable: true },
//   { label: "workGenre.prefLabel_bo_x_ewts", highlightable: true },
//   { label: "workGenre.prefLabel_en", highlightable: true },
//   { label: "workIsAbout.prefLabel_bo_x_ewts", highlightable: true },
//   { label: "workIsAbout.prefLabel_en", highlightable: true },
// ];

export const highlightableLocalizableFields = ["seriesName","summary","authorName","authorshipStatement","publisherName","publisherLocation","prefLabel","comment","altLabel"]

const ALL_FIELDS = [
  { label: "associated_res", highlightable: true },
  { label: "graphs", highlightable: true },
  { label: "other_id", highlightable: true },
  { label: "inRootInstance", highlightable: true },
  { label: "type", highlightable: true },
  { label: "inCollection", highlightable: true },
  { label: "associatedTradition", highlightable: true },
  { label: "personGender", highlightable: true },
  { label: "hasSourcePrintery", highlightable: true },
  { label: "printMethod", highlightable: true },
  { label: "script", highlightable: true },
  { label: "language", highlightable: true },
  { label: "partOf", highlightable: true },
  { label: "partType", highlightable: true },
  { label: "issueName", highlightable: true },
  { label: "workGenre", highlightable: true },
  { label: "workIsAbout", highlightable: true },
  { label: "author", highlightable: true },
  { label: "translator", highlightable: true },
  { label: "seriesName_res", highlightable: true }
].concat(
  ...highlightableLocalizableFields
    .map(t => (
      ["en", "bo_x_ewts", "iast", "hani", "khmr"].map(l => ({label:t+"_"+l, highlightable: true}))
    )
  )
);

const NO_KEYWORD_FIELD = [
  { label: "objectID", highlightable: false },
  { label: "creation_date", highlightable: false },
  { label: "gis_coord", highlightable: false },
  { label: "publicationDate", highlightable: false },
  { label: "firstScanSyncDate", highlightable: false },
  { label: "db_score", highlightable: false },
  { label: "pop_score", highlightable: false },
  { label: "ric", highlightable: false },
  { label: "scans_access", highlightable: false },
  { label: "etext_access", highlightable: false },
  { label: "scans_quality", highlightable: false },
  { label: "etext_quality", highlightable: false },
  { label: "placeType", highlightable: false },
  { label: "etext_search", highlightable: false },
  { label: "nocomm_search", highlightable: false },
  { label: "exclude_etexts", highlightable: false },
];

const DATE_RANGE_FIELDS = ["firstScanSyncDate"];

const SEARCH_FIELDS = [...ALL_FIELDS];

const RESULT_FIELDS = [...ALL_FIELDS, ...NO_KEYWORD_FIELD];

const HIGHLIGHT_FIELDS = [...ALL_FIELDS];

export { SEARCH_FIELDS, RESULT_FIELDS, HIGHLIGHT_FIELDS, DATE_RANGE_FIELDS };
