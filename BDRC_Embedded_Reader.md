# Embedding a IIIF collection viewer

## Using an `iframe`
You can embed a viewer by using an `iframe` element pointing to `https://library.bdrc.io/scripts/embed-iframe.html?work=workVal&origin=originVal&uilang=uiLangVal&lang=langVal` with:
- `workVal` is a BDRC resource ID such as `bdr:MW22084`
- `originVal` is an identifier for the website embedding the iframe
- `uiLangVal` is the locale used to display the elements of the UI, either `en` (English) or `bo` (Tibetan)
- `langVal` is a comma-separated list of preferred languages by order of preference, to be selected from [BDRC's lang tag conventions](https://github.com/buda-base/owl-schema/blob/master/lang-tags.md), used to display the data from work (outlines, titles, etc.)

For example:
```html
<iframe allowfullscreen src="https://library.bdrc.io/scripts/embed-iframe.html?work=bdr:W22084&origin=website.com&uilang=en&lang=bo-x-ewts,sa-x-iast,zh-latn-pinyin"></iframe>
```

```html
<iframe allowfullscreen src="https://library.bdrc.io/scripts/embed-iframe.html?work=bdr:W22084&origin=website.com&uilang=bo&lang=bo,sa-deva,zh-hant"></iframe>
```

**Note**: `bo` (Tibetan in Unicode) `sa-deva` (Sanskrit in Devanagari) and `zh-hant` (Traditional Chinese) can respectively and automatically be transliterated into `bo-x-ewts` (Tibetan in Latin/EWTS) `sa-x-iast` (Sanskrit in Latin/IAST) `zh-latn-pinyin` (Chinese in Latin/Pinyin) and reciprocally -- Chinese excepted.


<!-- when there is another language that can be used to be transliterated from,  -->


The following code opens a static, fullpage viewer:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Demo Viewer</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin:0px">
    <iframe
      allowfullscreen
      style="position:fixed;width:100%;height:100%;border:none;"
      src="https://library.bdrc.io/scripts/embed-iframe.html?work=bdr:W22084&origin=website.com">
    </iframe>
  </body>
</html>
```

You can also use button(s) to show the viewer only when needed:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Demo Viewer</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <style>
      #container { position:fixed; width:100%; height:100%; border:none; left:0; top:0; transition:opacity 400ms ease-in-out;  }
      #container:not(.loaded) { background:url(https://cdnjs.cloudflare.com/ajax/libs/galleriffic/2.0.1/css/loader.gif) center no-repeat;  }
      #container iframe { width:100%; height:100%; }
      .hidden { pointer-events:none; opacity:0;  }
    </style>
  </head>
  <body>
    <div id="container" class="hidden"><iframe allowfullscreen class="hidden"></iframe></div>
    <button class="open" data-rid="bdr:MW22084">View Collection A</button>
    <button class="open" data-rid="bdr:MW12827">View Collection B</button>
    <script>
      $("#container iframe").on("load", () => { $('#container iframe').removeClass('hidden'); $("#container").addClass("loaded"); });
      $("button.open").click( (e) => {
        $("#container").removeClass("hidden");
        let src = "https://library.bdrc.io/scripts/embed-iframe.html?work="+$(e.target).attr("data-rid")+"&origin=website.com&lang=bo";
        if($("#container iframe").attr("src")!== src) { $("#container iframe").attr("src",src); }
        else { $("#container iframe").trigger("load"); }
      })
      window.addEventListener("message", (msg) => { if(msg.data === "close") { $("#container,#container iframe").addClass("hidden").removeClass("loaded"); } } )
    </script>
  </body>
</html>
```

##  Using source files
Alternatively you can also follow these steps in order to embed a IIIF collection viewer in your website:

* add `CSS` dependencies

```html
<link rel="stylesheet" type="text/css" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
<link rel="stylesheet" type="text/css" href="https://library.bdrc.io/scripts/mirador/css/mirador-combined.css">
<link rel="stylesheet" type="text/css" href="https://library.bdrc.io/scripts/src/lib/mirador.css"/>
```

* add `JavaScript` dependencies

```html
<script src="https://library.bdrc.io/scripts/mirador/mirador.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@dbmdz/mirador-keyboardnavigation@1.1.0/keyboardNavigation.min.js"></script>  
<script src="https://cdn.jsdelivr.net/npm/lodash@4.17.11/lodash.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/requirejs@2.3.6/require.js"></script>
<script src="https://cdn.jsdelivr.net/npm/jsewts@1.0.2/src/jsewts.min.js"></script>
<script type="module" src="https://library.bdrc.io/scripts/src/lib/transliterators.js"></script>
<script type="module" src="https://library.bdrc.io/scripts/src/lib/miradorSetup.js"></script>
```

* initialize the viewer

```html
<script type="module">
  let miradorConfig, miradorSetUI
  async function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const work = urlParams.get('work') ?? "bdr:MW22084";
    const uilg = urlParams.get('uilang') ?? "bo";
    const lg = (urlParams.get('lang') ?? "bo,zh-hans").split(",")
      let data = [
        { "collectionUri" : "https://iiifpres.bdrc.io/collection/wio:"+work, location:"" }
      ]
      let config = await miradorConfig(data, undefined, undefined, undefined,lg,undefined,undefined,uilg);
      window.Mirador( config )
      miradorSetUI();
  }
  let waiter = setInterval( async ()=>{
      if(_ && window.moduleLoaded &&  window.moduleLoaded.JsEWTS && window.moduleLoaded.Sanscript && window.moduleLoaded.pinyin4js) {
        clearInterval(waiter);
        miradorConfig = window.miradorConfig
        miradorSetUI  = window.miradorSetUI
        init();
      }
  },100);
</script>
```


Here is the complete file:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Demo Viewer</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" type="text/css" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
    <link rel="stylesheet" type="text/css" href="https://library.bdrc.io/scripts/mirador/css/mirador-combined.css">
    <link rel="stylesheet" type="text/css" href="https://library.bdrc.io/scripts/src/lib/mirador.css"/>
  </head>
  <body>
    <div id="viewer" class="demo embed"></div>
    <script src="https://library.bdrc.io/scripts/mirador/mirador.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@dbmdz/mirador-keyboardnavigation@1.1.0/keyboardNavigation.min.js"></script>      
    <script src="https://cdn.jsdelivr.net/npm/lodash@4.17.11/lodash.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/requirejs@2.3.6/require.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/jsewts@1.0.2/src/jsewts.min.js"></script>
    <script type="module" src="https://library.bdrc.io/scripts/src/lib/transliterators.js"></script>
    <script type="module" src="https://library.bdrc.io/scripts/src/lib/miradorSetup.js"></script>
    <script type="module">
      let miradorConfig, miradorSetUI
      async function init() {
        const urlParams = new URLSearchParams(window.location.search);
        const work = urlParams.get('work') ?? "bdr:MW22084";
        const uilg = urlParams.get('uilang') ?? "bo";
        const lg = (urlParams.get('lang') ?? "bo,zh-hans").split(",")
         let data = [
            { "collectionUri" : "https://iiifpres.bdrc.io/collection/wio:"+work, location:"" }
         ]
         let config = await miradorConfig(data, undefined, undefined, undefined,lg,undefined,undefined,uilg);
         window.Mirador( config )
         miradorSetUI();
      }
      let waiter = setInterval( async ()=>{
         if(_ && window.moduleLoaded &&  window.moduleLoaded.JsEWTS && window.moduleLoaded.Sanscript && window.moduleLoaded.pinyin4js) {
            clearInterval(waiter);
            miradorConfig = window.miradorConfig
            miradorSetUI  = window.miradorSetUI
            init();
         }
      },100);
    </script>
  </body>
</html>
```
