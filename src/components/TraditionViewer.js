
import React, { Component } from 'react';
import { Link } from "react-router-dom"
import qs from 'query-string'
import I18n from 'i18next';
import _ from "lodash";
import $ from 'jquery' ;
import logdown from 'logdown'
import ExpandMore from '@material-ui/icons/ExpandMore';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import { Helmet } from "react-helmet"
import RetryImg from './RetryImg'

//import history from "../history"
import store from '../index';
import { top_right_menu, getLangLabel, getPropLabel, fullUri, renderBanner, getGDPRconsent } from './App'
import { auth, Redirect404 } from '../routes'
import { initiateApp } from '../state/actions';
//import LatestSyncs, { latestSyncsScopes } from "./LatestSyncs"
import InnerSearchPageContainer from '../containers/InnerSearchPageContainer'


import { fetchLabels } from "../lib/searchkit/api/LabelAPI";

import { fromWylie, ewtsToDisplay } from "../lib/transliterators"
import { topics } from "../lib/topics"
import { HOME_PATH, LANDING_PATH } from "../lib/appPath"
import { rootCrumbs } from "../lib/breadcrumbs"
import { GettingStartedLink } from "../lib/gettingStarted"

/* A card of the json can open a page of the landing instead (`landing`: an exhibition,
   an orientation page), the same rule the landing follows for its own collection links
   (ratnasagara, src/lib/collectionPage.ts): a collection opens its exhibition, else its
   orientation page, else its record here. The landing is another app on the shared root,
   so the link is a plain <a>; where there is no landing (LANDING_PATH empty, e.g. the
   Khmer server) the card keeps its `to` and opens the collection in BUDA. */
const landingUrl = (path) => LANDING_PATH && path ? LANDING_PATH.replace(/\/+$/, "") + path : null

/* BUDA's tradition code to its orientation page */
const GS_TRADITION = { bo: "tradition-tibetan", pi: "tradition-pali", sa: "tradition-sanskrit", zh: "tradition-chinese" }

const loggergen = new logdown('gen', { markdown: false });

window.ResizeObserver = ResizeObserver;

const skos  = "http://www.w3.org/2004/02/skos/core#";

type State = { content:any, error:integer, collapse:{}, route:"" }

type Props = { history:{}, locale:string, config:{} }

let _that, already

let xml, tbrc
const purl = "https://purl.bdrc.io/resource/"

// a card whose cover 404s — an id with no scan behind it — falls back to the plain
// card the sheet paints when the anchor carries .no-img
const onImgError = (ev) => {
  const card = ev.target.closest("a")
  if(card) card.classList.add("no-img")
  ev.target.remove()
}
async function buildTree(id, glob, parent) {

  const nsResolver = (prefix) => {
    const namespaces = {
      'o': 'http://www.tbrc.org/models/outline#'  
    };
    return namespaces[prefix] || null;
  };

  if(!xml) { 

      
    xml = await fetch("/scripts/src/lib/topicsNL.xml") 
    const parser = new DOMParser();
    tbrc = parser.parseFromString(await xml.text(), "text/xml")
    const xpathExpression = `.//o:node[not(starts-with(@value, 'T'))]`;
    xml = tbrc.evaluate(xpathExpression, tbrc, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

    console.log("xml:", xml, xml.snapshotLength)
  }

  let data = await fetch(purl+id+".jsonld")    
  let json = await data.json()

  let subclasses = []
  if(json["@graph"]) { 
    json = json["@graph"].filter(j => j.type === "Topic")
    if(json.length === 1) json = json[0]
    else { 
      console.log("data:",id,data)
      throw new Error("pb with "+id)
    }
  }

  let prefLabel = json["skos:prefLabel"]
  let altLabel = json["skos:altLabel"]

  if(json.taxHasSubClass && !glob[id]) { 
    glob[id] = {}
    let sub = []
    if(!Array.isArray(json.taxHasSubClass)) json.taxHasSubClass = [ json.taxHasSubClass ]
    for(let s = 0 ; s < json.taxHasSubClass.length ; s ++) {
      let obj = json.taxHasSubClass[s]
      if(obj.id) obj = obj.id
      if(obj) obj = obj.split(":")
      if(obj.length > 1 && obj[1]) obj = obj[1]
      if(obj) { 
        sub.push(obj)
        //if(id === "O9TAXTBRC201605" || parent === "O9TAXTBRC201605" || glob[parent].parent === "O9TAXTBRC201605" ) 
        await buildTree(obj, glob, id)        
      }
    }
    glob[id].sub = sub  
  }  
  if(!glob[id]) glob[id] = {}
  glob[id]["label"] = prefLabel 
  if(parent) glob[id].parent = parent

  console.log("id:", id, prefLabel)

  if(!prefLabel) {
    console.warn("NO LABEL", id)
    glob.noLabel.push({id, json})
  } else {
    if(!Array.isArray(prefLabel)) prefLabel = [ prefLabel ]
    prefLabel = _.orderBy(prefLabel, [ (obj)=> obj["@language"] === "en" ? 0 : 1, "@language"], ["asc","asc"])
    const xpathExpression2 = `.//o:node[@value="${id}"]`;
    const result2 = tbrc.evaluate(xpathExpression2, tbrc, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);    
    if (result2.snapshotLength > 0) {
      const elem = result2.snapshotItem(0)
      console.log("value:", elem.getAttribute("value"), elem.getAttribute("nl"))
      glob[id].tbrcId = elem.getAttribute("value")
      glob[id].rank = Number(elem.getAttribute("nl"))
    } else {
      let found = false
      for (let i = 0; i < xml.snapshotLength; i++) {
        if(found) break ;
        const element = xml.snapshotItem(i);
        for(const label of prefLabel) {
          if(found) break;
          const xpathExpression3 = `.//o:name[.="${label["@value"]?.toLowerCase()}"]`;
          const result3 = tbrc.evaluate(xpathExpression3, element, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);              
          if (result3.snapshotLength > 0) {
            found = true            
            const filtered = Array.from({ length: result3.snapshotLength }, (r,i) => { 
              const elem = result3.snapshotItem(i)
              return [elem.parentNode.getAttribute("value"),elem.parentNode.getAttribute("nl")]
            }).filter(n => !n[0].startsWith("T"))
            if(filtered.length > 1) { 
              console.warn("MULTIPLE TOPIC FOUND", result3, prefLabel, filtered, parent)
              glob.multiple.push({id, filtered})
            } else if(filtered.length === 1){ 
              console.log("label:", label["@value"], result3, filtered)
              glob[id].tbrcId = filtered[0][0]
              glob[id].rank = Number(filtered[0][1])
            } else {
              console.error("TOPIC NOT FOUND", id, prefLabel)
              glob.notFound.push({id, prefLabel})
            }
            break;
          }
        }

      }
      if(!found) {
        console.error("TOPIC NOT FOUND", id, prefLabel)
        glob.notFound.push({id, prefLabel})
      }
    }
  }
}


/*
// uncomment to rebuild tree then copy/paste object from console to ../lib/topics.js once finished (takes a few minutes)
const newTopics = { notFound:[], multiple:[], noLabel:[] }
buildTree("O9TAXTBRC201605", newTopics).then(() => { console.log("topics:",newTopics) })
*/


/* A work can name several authors, and tools/fill_authors.py puts them on one line, each
   after the shad it carries ("… rin chen/ mkhas grub rje …") or behind a semicolon when
   it carries none. The card gives them a line each, so this takes that line apart again:
   the sentinel is there because splitting on the shad itself would eat it, and it belongs
   to the name. */
const splitNames = (value) => (value ?? "")
  .replace(/([/།༎])[ \t]+/g, "$1\u0000")
  .split(/\u0000|\s*;\s*/)
  .map(n => n.trim())
  .filter(Boolean)

/* Two names are the same name when what is left of them is: the shelf number a
   collected-works title carries ("zhe chen rgyal tshab_04"), the syllable-final tsheg and
   the punctuation are not part of it. */
const plainName = (v) => (v ?? "").toLowerCase().replace(/[_0-9]+/g, "").replace(/[^\p{L}\p{M}'+ ]+/gu, "").replace(/\s+/g, " ").trim()

// "tmp:tradiCat0_9" is "tradiCat0_9" in a url
const catSlug = (id) => (id ?? "").replace(/^[a-z]+:/, "")

const len = (k, topics) => {
  if(topics[k]) {
    if(topics[k].parent) return [k].concat(len(topics[k].parent, topics))
    else return [k]
}
  return []
}

/* // debugging
window.allT = Object.keys(topics).map(k => len(k,topics))
*/

export class TraditionViewer extends Component<State, Props>
{
  _urlParams = {}

  constructor(props) {
      super(props);
      
      this._urlParams = qs.parse(props.location.search) 
      
      this.state = { content: "", collapse:{}, hash:"" } 

      if(!this.props.config) store.dispatch(initiateApp(this._urlParams,null,null,"tradition"))
      
  }

  componentDidUpdate() { 

      if(window.initFeedbucket) window.initFeedbucket()

  }


  /* `groups`, when it is there, turns the nested entries of a section into cards that
     open a page of their own ({ href, img }) instead of a heading with its works under
     it: a school page is a page of categories, and each category its own page. */
  renderContent(t, route, storage = this.state.storage, groups = null){
    return (t.content ?? t)?.map(c => {
      let label = { value: "", lang: this.props.locale }, rid = (c.id ?? "").split(":")[1] ?? ""
      if(t.id && c.id && storage && storage[c.id.replace(/^bdr:/,"")] && !c.label?.length) label = getLangLabel(this,skos+"prefLabel",storage[c.id.replace(/^bdr:/,"")].label ?? [], false, true)
      else if(c.label) label = getLangLabel(this,skos+"prefLabel",c.label ?? [], false, true)
      else if(c.id) {
        if(c.id.startsWith("bdr:")) label = getPropLabel(this, fullUri(c.id), false, true)
        else label.value = I18n.t("tradition."+c.id) 
      }

      //console.log("sto:", label, c.label) // , storage, t)

      let link = route ?? c.to ?? t.to
      if(!link?.startsWith("/")) link = "/tradition/"+this.props.tradition+"/"+ link
      link = link.replace(/:rid/g, rid).replace(/:id/g, c.id).replace(/:n/g, (c.id??"").replace(/[^0-9]/g,""))                  

      const scrollToTop = () => {
        const top = document.querySelector("#root > .over-nav") // "".App > div > div > #samples")
        if(top) top.scrollIntoView()
      }


      //if(e.depth > 0) res.push(<h5 onClick={() => this.setState({collapse:{...this.state.collapse,[e.rank+"_"+e.value]:!this.state.collapse[e.rank+"_"+e.value]}})} class={"collapse-"+(!!this.state.collapse[e.rank+"_"+e.value])} lang={e.lang}><ExpandLess/>{e.value}</h5>)// | {e.rank}</h5>)
      
      if(c.content) {
        if(groups) {
          const tib = this.tibName(c.label)
          return <Link to={groups.href(c)} className="has-img" onClick={scrollToTop}>
          { groups.img && <RetryImg alt="tradition item thumbnail" src={groups.img} loading="lazy" onError={onImgError}/> }
          { tib && <span className="tradi-tib" lang="bo" aria-hidden="true">{tib}</span> }
          <span lang={label?.lang}>{label?.value}</span>
          <span className="tradi-kind">{I18n.t("tradition.nTexts", { count: c.content.length })}</span>
          <span className="visually-hidden">Go to {label?.value} page</span>
        </Link>
        }

        this.goFetch(c.content.filter(i => !i.label?.length).map(i => i.id.split(":")[1]),c.id)
        // a group left on its own page is a heading over its cards, not a toggle: the
        // page opened on closed rows and showed nothing of what it holds
        return <>
          <h5 className={(c.img ? "has-img ":"")+(c.classes??"")}>
            { c.img && <RetryImg alt="tradition item thumbnail" src={c.img}/> }
            <span lang={label?.lang}>{label?.value}</span>
          </h5>
          {this.renderContent(c, route, storage)}
        </>
      } else {
        /* The card can carry a second line: the Wylie name under the school's English
           one, or the kind of thing the link opens ("Derge Kangyur", "Editions",
           "Places"). Both are optional — a tradition whose json has no kind keeps a
           one-line card.

           A cover is different: it is the scan's own first page rather than a picture
           chosen for the card, as often a white title sheet as a painted board, so it
           takes the book card (.has-cover) whose title is read under the image. */
        const cover = c.img ? null : this.iiifThumb(c.id)
        const img = c.img ?? cover
        const kind = this.optLabel("tradition.kind."+(c.kind ?? t.kind), c.kind ?? t.kind)
        /* The author the json carries for a work, under its title on the card. `author`
           is what a librarian typed in the spreadsheet and always wins; `authorBatch` is
           what tools/fill_authors.py read out of BDRC's own data for the works the sheet
           leaves blank, so a name added to the sheet later takes over on its own.

           Either way it is dropped when the title already names them, which is the rule
           rather than the exception for a gsung 'bum ("sog bzlog pa blo gros rgyal
           mtshan gyi gsung 'bum"). */
        const authorLabels = c.author ?? c.authorBatch
        let author = authorLabels ? getLangLabel(this, skos+"prefLabel", authorLabels, false, true) : null
        if(author?.value && label?.value && plainName(label.value).includes(plainName(author.value))) author = null
        const authorNames = author?.value ? splitNames(author.value) : []
        const landing = landingUrl(c.landing)
        const Card = landing ? "a" : Link, target = landing ? { href: landing } : { to: link, onClick: scrollToTop }
        return <Card {...target} className={(img ? "has-img ":"")+(cover ? "has-cover ":"")+(c.classes??"")}>
          { img && <RetryImg alt="tradition item thumbnail" src={img} loading="lazy" onError={onImgError}/> }
          <span lang={label?.lang}>{label?.value}</span>
          { authorNames.length > 0 && <span className="tradi-author" lang={author.lang}>
            { authorNames.map(name => <span className="tradi-author-name">{name}</span>) }
          </span> }
          { kind && <span className="tradi-kind">{kind}</span> }
          <span className="visually-hidden">Go to {label?.value} page</span>
        </Card>
      }
    })
  }

  /* Full-width entries for online exhibitions, drawn like the entries of the landing's
     /exhibitions page (picture left, text right, the whole of it a link): a section of
     kind "feature", whose `content` lists the exhibitions by their landing slug. Each
     entry's text is the i18n keys tradition.feature.<slug>.{eyebrow,title,lead,body}
     (the landing's own wording); its picture is the landing's, served on the shared
     root, with an IIIF fallback where there is no landing. */
  renderFeature(t) {
    // same as the cards' (renderContent): a link inside the app lands at the top of the page
    const scrollToTop = () => document.querySelector("#root > .over-nav")?.scrollIntoView()
    const heading = this.optLabel("tradition."+t.id)
    return <div id={"tradi-"+t.id} className="tradi-content tradi-feature">
      { heading && <h2>{heading}</h2> }
      { (t.content ?? []).map(e => {
        const k = "tradition.feature."+e.slug+"."
        const landing = landingUrl(e.landing)
        const Card = landing ? "a" : Link, target = landing ? { href: landing } : { to: e.to, onClick: scrollToTop }
        const onError = (ev) => { if(e.imgFallback && ev.target.src !== e.imgFallback) ev.target.src = e.imgFallback }
        return <Card key={e.slug} {...target} className="tradi-feature-entry">
          <span className="pic"><img src={landing ? e.img : e.imgFallback ?? e.img} alt="" loading="lazy" onError={onError} style={e.position ? { objectPosition: e.position } : undefined}/></span>
          <span className="txt">
            <span className="eyebrow">{I18n.t(k+"eyebrow")}</span>
            <span className="title">{I18n.t(k+"title")}</span>
            <span className="lead">{I18n.t(k+"lead")}</span>
            <span className="body">{I18n.t(k+"body")}</span>
            <span className="go">{I18n.t("tradition.feature.go")}</span>
          </span>
        </Card>
      }) }
    </div>
  }

  // The works a school page lists have no image in the json, but they all have a cover
  // in the same thumbnail service the search results read (see CustomHit): the card
  // shows the volume instead of a line of text, and falls back to a plain card when
  // there is no scan behind the id (onImgError, below).
  iiifThumb(id) {
    if(!/^bdr:M?W[0-9]/.test(id ?? "")) return null
    const iiif = this.props.config?.iiif?.endpoints?.[this.props.config?.iiif?.index] ?? "//iiif.bdrc.io"
    return iiif+"/"+id+"::thumbnail/full/full/0/default.jpg"
  }

  /* "< Back", one step up: a category page goes back to its school, a school or an index
     to the tradition, a topic page to the topic above it. */
  backLink(to, name) {
    return <Link className="tradi-back" data-lang={this.props.locale} to={to}>
      <ChevronLeft/>{I18n.t("resource.goB")}<span className="visually-hidden">Go back to {name}</span>
    </Link>
  }

  /* The name in Tibetan script, written over the picture of a plate card. A category
     carries it in the json (label: [{lang:"bo"}, {lang:"en"}]); a topic has only the
     romanisation in ../lib/topics, so that one is converted. jsEWTS loads
     asynchronously (see lib/transliterators), hence the guard: on the first paint the
     name may not be there yet, and the next render puts it in. */
  tibName(labels) {
    if(!labels) return null
    if(!Array.isArray(labels)) labels = [ labels ]
    const lang = (l) => l.lang ?? l["@language"]
    const val = (l) => l?.value ?? l?.["@value"]
    const bo = labels.find(l => lang(l) === "bo")
    if(val(bo)) return val(bo)
    const ewts = labels.find(l => lang(l) === "bo-x-ewts")
    if(!val(ewts)) return null
    try { return fromWylie(ewtsToDisplay(val(ewts))) } catch(e) { return null }
  }

  // an i18n key that may not be there: I18n.t hands the key itself back when it misses,
  // and the fallback is what the json had (a raw kind, or nothing at all)
  optLabel(key, fallback = null) {
    if(!key || key.endsWith("undefined")) return null
    const res = I18n.t(key)
    return res.startsWith("tradition.") ? fallback : res
  }

  getIdAsText(id) {
    let res = I18n.t("tradition.id_"+id)
    if(res.startsWith("tradition.")) res = I18n.t("tradition."+id)        
    if(res.startsWith("tradition.")) res = getPropLabel(this, fullUri(id), false)
    return res
  }

  /* The page shows the children of the topic it is on, one card each — the tree used to
     be walked two levels deep and folded into collapsing rows, which meant a page opened
     on four closed headings and a reader had to click to see anything. A child that has
     children of its own opens its own page; a child that has none opens the search for
     it, which is where the tree ended anyway. */
  renderSubTopic(t, listing, depth = 0){

    const topic = topics[t], MAXNL = 100000

    if(depth === 0) {
      if(topic?.sub?.length) topic.sub.forEach(s => this.renderSubTopic(s, listing, depth + 1))
      // a topic with no children of its own: the page is the one card that leaves it
      else listing.push({ ...getPropLabel(this, fullUri("bdr:"+t), false, true), rank: 0, rid: t, tib: this.tibName(topic?.label), to: "/osearch/associated/"+t+"/search" })
      return
    }

    listing.push({
      ...getPropLabel(this, fullUri("bdr:"+t), false, true),
      rank: topic?.rank ?? MAXNL,
      rid: t,
      // the same name in Tibetan, for the plate written over the picture
      tib: this.tibName(topic?.label),
      to: topic?.sub?.length ? "./../bdr:"+t+"/" : "/osearch/associated/"+t+"/search",
      length: topic?.sub?.length,
    })
  }


  renderList(listing, img) {

    const sort = _.orderBy(listing, ["rank"], ["asc"])

    return sort.map(e => e.to
      ? <Link className="has-img" data-lang={e.lang} to={e.to}>
          { img && <RetryImg alt="" src={img} loading="lazy" onError={onImgError}/> }
          { e.tib && <span className="tradi-tib" lang="bo" aria-hidden="true">{e.tib}</span> }
          <span lang={e.lang}>{e.value}</span>
          <span className="tradi-kind">{ e.length ? I18n.t("tradition.nTopics", { count: e.length }) : I18n.t("tradition.searchTopic") }</span>
          <span className="visually-hidden">Go to {e.value} page</span>
        </Link>
      : <i>{e.value} {e.lang}</i>)
  }


  renderTopic({tradi, id}, {content, breadcrumbs}){

    breadcrumbs.pop()
    breadcrumbs.push(<Link data-lang={this.props.locale} to={"./../"}>{I18n.t("tradition.t_"+this.props.type)} ({id})<span className="visually-hidden">Go to {I18n.t("tradition.t_"+this.props.type)} page</span></Link>)                    
    
    let t = this.props.root.split(":")
    t = t.pop()

    // the sub-topics have no image of their own, so a card takes the photograph of the
    // top-level topic its page sits under — the one the "By Topic" grid shows
    const ancestors = len(t, topics)
    const topLevel = tradi?.subContent?.[this.props.type]?.[this.props.id]?.content ?? []
    const img = topLevel.find(i => ancestors.includes((i.id ?? "").split(":")[1]))?.img

    let path = len(t, topics)
    path.pop()
    path = path.reverse()
    path.pop()
    for(const p of path) {
      const pathid = this.getIdAsText("bdr:"+p)     
      breadcrumbs.push(<Link data-lang={this.props.locale} to={"./../bdr:"+p+"/"}>{pathid}<span className="visually-hidden">Go to {pathid} page</span></Link>)                    
    }

    let rootid = this.getIdAsText(this.props.root)     
    breadcrumbs.push(<span>{rootid}</span>)                
        
    const listing = []
    this.renderSubTopic(t, listing)

    content.push(<>
        {/* <h1 style={{width:"100%"}}>{I18n.t("tradition."+this.props.tradition+"T")} &ndash; {I18n.t("tradition.t_"+this.props.type)} &ndash; {rootid}</h1> */}
        { path.length
          ? this.backLink("./../bdr:"+path[path.length - 1]+"/", this.getIdAsText("bdr:"+path[path.length - 1]))
          : this.backLink("./../", I18n.t("tradition.t_"+this.props.type)+" ("+id+")") }
        <h1 style={{width:"100%"}}>{rootid}</h1>
        <div className={"tradi-content listing tradi-cards tradi-plates"}>
          {this.renderList(listing, img)}
        </div>
      </>)

  }


  renderSubLevel(tradi, {content, breadcrumbs}) {

    let subContent, id, classes

    const entry = tradi.subContent?.[this.props.type]?.[this.props.id]

    /* A category of a school ("Collected Writings", "Revelations of Concealed
       Teachings"): the school page lists them as cards, and this is one of them opened
       on its own — the works of that category and of no other. The url is the section's
       fourth segment, the group's id without its tmp: prefix. */
    const group = this.props.root && Array.isArray(entry?.content)
      ? entry.content.find(c => catSlug(c.id) === this.props.root)
      : null
    const groupLabel = group ? getLangLabel(this, skos+"prefLabel", group.label ?? [], false, true) : null

    // the school's own photograph, from the grid on the tradition page: its categories
    // have no picture of their own and each takes a detail of it. Looked for in every
    // section, since the genres (poetry, history, karchak) have a section of their own.
    const plate = tradi.content?.flatMap(s => Array.isArray(s.content) ? s.content : [])
      .find(s => (s.to ?? "").endsWith("/"+this.props.id))?.img

    if(this.props.type === "selected" && tradi.subContent[this.props.type][this.props.id]) {
      id = this.getIdAsText(tradi.subContent[this.props.type][this.props.id].id) 
    } else if(!(this.props.type === "school")) {
      id = this.getIdAsText(this.props.id) 
    }

    breadcrumbs.push(<Link data-lang={this.props.locale} to={"/tradition/"+this.props.tradition+"/"}>{I18n.t("tradition."+this.props.tradition+"T")}<span className="visually-hidden">Go to {I18n.t("tradition."+this.props.tradition+"T")} page</span></Link>)
    
    console.log("subl:", tradi, content, id, this.props.type, this.props.id)

    if(tradi.subContent && tradi.subContent[this.props.type] && tradi.subContent[this.props.type][this.props.id]) {

      if(typeof entry.content === "string") subContent = this.renderContent(tradi.content?.find(t => t.id === entry.content), entry.to)
      else if(group) subContent = this.renderContent(group, group.to ?? entry.to)
      else subContent = this.renderContent(entry, undefined, undefined, this.props.type === "selected" ? {
        href: c => "/tradition/"+this.props.tradition+"/"+this.props.type+"/"+this.props.id+"/"+catSlug(c.id)+"/",
        img: plate,
      } : null)

      classes = tradi.subContent[this.props.type][this.props.id].classes

      if(tradi.subContent[this.props.type][this.props.id].parent) {
        
        let subid = this.getIdAsText(tradi.subContent[this.props.type][this.props.id].parent)

        breadcrumbs.push(<Link data-lang={this.props.locale} to={"./../"+tradi.subContent[this.props.type][this.props.id].parent}>{I18n.t("tradition.t_"+this.props.type)} ({subid})<span className="visually-hidden">Go to {I18n.t("tradition.t_"+this.props.type)} page</span></Link>)            
        breadcrumbs.push(<span>{id}</span>)                    
        
      } else {
        breadcrumbs.push(<span>{I18n.t("tradition.t_"+this.props.type)} ({id})</span>)                    
      }
    } else {
      breadcrumbs.push(<span>{I18n.t("tradition.t_"+this.props.type)} ({id})</span>)                    
    }

    if(group) {
      // the school, which was the last crumb, becomes the way back to its categories
      breadcrumbs.pop()
      breadcrumbs.push(<Link data-lang={this.props.locale} to={"/tradition/"+this.props.tradition+"/"+this.props.id}>{I18n.t("tradition.t_"+this.props.type)} ({id})<span className="visually-hidden">Go to {I18n.t("tradition.t_"+this.props.type)} page</span></Link>)
      breadcrumbs.push(<span lang={groupLabel?.lang}>{groupLabel?.value}</span>)
    }

    if(this.props.root && !group) {
      
      this.renderTopic({tradi, id}, {content, breadcrumbs})

    } else {          
      // a category page is still the school's page: the school names it, the category is
      // its heading, and the way back to the other categories is over the title
      content.push(<>
          { group
            ? this.backLink("/tradition/"+this.props.tradition+"/"+this.props.id, I18n.t("tradition.t_"+this.props.type)+" ("+id+")")
            : this.backLink("/tradition/"+this.props.tradition+"/", I18n.t("tradition."+this.props.tradition+"T")) }
          <h1 style={{width:"100%"}}>{ group
            ? <>{I18n.t("tradition.t_"+this.props.type)} ({id})</>
            : <>{I18n.t("tradition.t_"+this.props.type)} &ndash; {id}</> }</h1>
          {/* tradi-plates: the cards of a school page all take a detail of the one
              photograph, the way a topic's sub-topics do */}
          <div className={"tradi-content main tradi-cards "+(!group && this.props.type === "selected" ? "tradi-plates " : "")+(classes ?? "")}>
            { group && <h2 lang={groupLabel?.lang}>{groupLabel?.value}</h2> }
            {subContent}
          </div>
        </>)
    }      
  }

  renderTopLevel(tradi, {content, breadcrumbs}) {

    const filters = {
      "bo":"script:ScriptDbuCan OR script:ScriptDbuMed OR script:ScriptTibt",
      "pi":"language:LangPi OR language:LangKm OR script:ScriptKhmr OR script:ScriptMymr OR inCollection:PR1FPL01 OR inCollection:PR1KDPP00 AND type:Instance",
      "sa":"language:LangSa",
      "zh":"language:LangZh"
    }

    breadcrumbs.push(<span>{I18n.t("tradition."+this.props.tradition+"T")}</span>)

    // the standfirst under the title, the eyebrow over a section and the line under its
    // heading are all optional i18n keys: only the Tibetan tradition has them for now,
    // and a tradition without them renders exactly as it did before
    const standfirst = this.optLabel("tradition.desc."+this.props.tradition+"T")

    content.push(<>
      <h1 style={{width:"100%"}}>{I18n.t("tradition.title."+this.props.tradition+"T")}</h1>
      {/* The orientation page for this tradition, on the landing (lib/gettingStarted).
          Before the standfirst on purpose: floated right from here it takes the dead
          space beside it and costs the column no height, where in the flow it pushed
          the first heading down. */}
      <GettingStartedLink className="gs-section gs-tradition" slug={GS_TRADITION[this.props.tradition]} labelKey="gettingStarted.orientation" />
      { standfirst && <p className="tradi-standfirst">{standfirst}</p> }
      { tradi && tradi.content?.map(t => {
        // a tradition may word a section its own way ("Nine doors" counts the Tibetan
        // schools), so its own key wins over the one shared by all four
        const eyebrow = this.optLabel("tradition.eyebrow."+this.props.tradition+"."+t.id, this.optLabel("tradition.eyebrow."+t.id)),
              blurb = this.optLabel("tradition.blurb."+this.props.tradition+"."+t.id, this.optLabel("tradition.blurb."+t.id))
        // tradi-cards: the sections the mockup lays out as a grid of cards, which the
        // sub-pages' listings (.main, .listing) are not
        if(t.kind === "feature") return this.renderFeature(t)
        return <div id={"tradi-"+t.id} className={"tradi-content tradi-cards "+(t.classes ?? "")}>
          { eyebrow && <span className="tradi-eyebrow">{eyebrow}</span> }
          <h2>{I18n.t("tradition."+t.id)}</h2>
          { blurb && <p className="tradi-blurb">{blurb}</p> }
          {this.renderContent(t)}
        </div>
      })}
      {/* One list of texts, not two: the other traditions had the full search and, under
          it, "Recent acquisitions" on the same filter, two blocks that looked the same.
          They keep the full search (sorted by the url, as the landing's links ask for the
          latest scans first); the Tibetan page, too large for a full list here, keeps
          the recent one. */}
      { this.props.tradition != "bo" ? <div id="tradi-recent" className="tradi-content">
        <h2>{I18n.t("tradition.all")}</h2>
        <InnerSearchPageContainer /*history={this.props.history} */  location={this.props.location} auth={this.props.auth} isOsearch={true} recent={false} /*sortByDefault={true}*/ customFilters={filters[this.props.tradition]} customPholder={I18n.t("resource.searchTtrad", {trad:I18n.t("tradition.title."+this.props.tradition+"T"),interpolation: {escapeValue: false} }) }/>          
      </div>
      : <div id="tradi-recent" className="tradi-content">
        { this.optLabel("tradition.eyebrow.recent") && <span className="tradi-eyebrow">{this.optLabel("tradition.eyebrow.recent")}</span> }
        <h2>{I18n.t("tradition.recent")}</h2>
        <InnerSearchPageContainer /*history={this.props.history} */ customPholder={I18n.t("resource.searchTtrad", {trad:I18n.t("tradition.title.recent"),interpolation: {escapeValue: false} }) } forceSearch={true} location={this.props.location} auth={this.props.auth} isOsearch={true} recent={true} customFilters={filters[this.props.tradition]}/>          
      </div> }
    </>)
  }

  async goFetch(fetching, cat) {

    const attribute = "tradition-"+this.props.tradition

    if (!sessionStorage.getItem(attribute)) {
      sessionStorage.setItem(attribute, JSON.stringify({}));
    }      
    let storage = JSON.parse(sessionStorage.getItem(attribute));

    fetching = fetching.filter(i => i && !storage[i])
    
    //console.log("already:",cat,already,fetching)

    if(fetching.length && !already) {

      //console.log("fetching:", fetching)
      
      already = true
      const fetchedItems = await fetchLabels(fetching, attribute)
      already = false
      
      //console.log("fetched:", fetchedItems)
      
      const newStorage = { ...storage, ...fetchedItems }
      sessionStorage.setItem(attribute, JSON.stringify(newStorage));    

      storage = newStorage      
    }

    if(!_.isEqual(this.state.storage, storage)) this.setState({ storage })

  }

  render(props) {         
    
    let infoPanelT
    if(this.props.config && this.props.config.msg && !this.props.preview && !this.props.simple) {
       infoPanelT = this.props.config.msg.filter(m => m.display && m.display.includes("tradition"))            
       if(infoPanelT && infoPanelT.length) infoPanelT = renderBanner(this, infoPanelT, true)
    }

    if(this.props.config?.tradition && this.props.tradition && !this.props.config?.tradition[this.props.tradition]) 
      return <Redirect404  /*history={history}*/  auth={auth}/>
    else  {
      
      console.log("lsn:",this.props.latestSyncs,this.props.latestSyncsMeta,this.props.latestSyncsNb)

      /*
      // TODO: control tradition/dates as well
      if(this.props.config) {
        if(!this.props.latestSyncs || this.props.latestSyncs != true && this.props.latestSyncsMeta?.tradition != this.props.tradition) {
          this.props.onGetLatestSyncs({ ...this.props.latestSyncsMeta??{}, tradition: this.props.tradition })
        } else if(this.props.latestSyncsNb === 0 && !this.props.latestSyncsMeta?.timeframe) { 
          let i = latestSyncsScopes.indexOf(this.props.latestSyncsMeta?.timeframe ?? latestSyncsScopes[0])
          if(i < latestSyncsScopes.length - 1) { 
            i++
            this.props.onGetLatestSyncs({ ...this.props.latestSyncsMeta??{}, tradition: this.props.tradition, timeframe:latestSyncsScopes[i] })
          } 
        }
      }
      */

      const tradi = this.props.config?.tradition && this.props.config?.tradition[this.props.tradition]    
      // "Home > BUDA > …", same root crumbs as a resource page (lib/breadcrumbs)
      let content = [], breadcrumbs = rootCrumbs({ locale: this.props.locale })                

      //console.log("tradi:",tradi,content,this.props)

      if(!tradi) return <></>
      else if(this.props.school) this.renderSubLevel(tradi, {content, breadcrumbs})
      else if(this.props.type && this.props.id) this.renderSubLevel(tradi, {content, breadcrumbs})
      else this.renderTopLevel(tradi, {content, breadcrumbs})

      console.log("tv:state",this.state)

      return (
        <>  
          {getGDPRconsent(this)}
          <Helmet>
            <link rel="canonical" href={"https://library.bdrc.io"+this.props.location.pathname} />
            <link rel="alternate" hreflang="x-default" href={"https://library.bdrc.io"+this.props.location.pathname} />
            {["en","bo"].map(l => <link rel="alternate" hreflang={l} href={"https://library.bdrc.io"+this.props.location.pathname+"?uilang="+l} />)}
            <link rel="license" href="https://creativecommons.org/publicdomain/zero/1.0/" />
          </Helmet>
          { top_right_menu(this, null, null, null, null, this.props.location, infoPanelT, "tradition") }
          <div>
            <div class={"App tradition tradition-"+(this.props.tradition)}>
              <div class="SearchPane">
                <div className="static-container">
                  <div id="samples">
                    {/* block, not the flex row it used to be: the breadcrumb and the
                        card below it are the only two children now */}
                    <div>
                      <div id="tradition-breadcrumbs">
                        { breadcrumbs }
                      </div>
                      {/* the card the sections are painted on, so the breadcrumb can stay
                          out of it on the page ground, as on a resource page */}
                      <div className="tradi-card">{content}</div>
                    </div>
                  </div>
                </div> 
              </div>
            </div>
          </div>
        </>
      );
    }
  }
}

export default TraditionViewer;