
import {miradorConfig,miradorSetUI} from "./src/lib/miradorSetup.js"

let data = [
   { "collectionUri": "tibcolldemo2.json", location: "BDRC - Palpung Collection"}
]

let config = miradorConfig(data);

//console.log("mir ador",config,this.props)
window.Mirador( config )

miradorSetUI();
