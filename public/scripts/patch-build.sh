cp ./build/index.html ./build/index-sav.html
# The script src attributes carry the PUBLIC_URL prefix (e.g. "/buda/static/js/…"),
# so match any prefix instead of a literal "/static". scriptError.js is injected
# root-relative here and gets prefixed by tools/prefix-public-paths.mjs afterwards.
cat ./build/index-sav.html | sed "s/<head>/<head><script src=\"\/scripts\/scriptError.js\"><\/script>/"| sed "s|<script src=\"\([^\"]*\)/static|<script onerror=\"scriptError(this)\" src=\"\1/static|g" > ./build/index.html
