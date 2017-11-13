const fs = require('fs')
const marked = require('8fold-marked')

const configPath = 'klipse-github-docs.config.js'

const targets = eval(fs.readFileSync(configPath).toString())().map(target => Object.assign({}, {
  hljsStyle: 'googlecode',
  hljsVersion: '9.12.0',
  docsDir: 'docs',
  stripComments: false,
  constToVar: false,
  menu: false,
  tooltips: false,
  klipse: true,
  klipseHeader: true,
  loadingMessage: true
}, target))

//

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false
})

Object.prototype.pipe = function (fn) {
  return fn(this)
}

const esc = s => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')

//

function process({
  user,
  project,
  hljsStyle,
  hljsVersion,
  icon,
  ga,
  docsDir,
  source,
  target,
  title,
  stripComments,
  constToVar,
  menu,
  tooltips,
  klipse,
  klipseHeader,
  loadingMessage,
  scripts
}) {
  const github = `https://github.com/${user}/${project}`
  const site = `https://${user}.github.io/${project}/${target}`
  const blob = `${github}/blob/master`

  const body = fs.readFileSync(source)
    .toString()
    .replace(/\(\/#/g, `(${github}/#`)
    .pipe(s => targets.reduce((s, t) => s.replace(new RegExp(`\\b${esc(t.source)}\\b`, 'g'), t.target), s))
    .pipe(s => constToVar ? s.replace(/([^ ])\bconst\b/g, '$1var') : s)
    .pipe(s => stripComments ? s.replace(/^\/\/ [^.].*/gm, '') : s)
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\[([^\]]*)\]\(\.\/([^)]*)\)/g, `[$1](${blob}/$2)`)
    .replace(new RegExp(esc(`[▶](${site}#`) + '([a-zA-Z0-9-]*)' + esc(')'), 'g'),
             `[■](${blob}/${source}#$1)`)
    .replace(new RegExp(esc(site), 'g'), '')
    .pipe(marked)
    .replace(new RegExp(esc(`a href="${github}/#`), 'g'), `a target="_blank" href="${github}/#`)
    .replace(/ id="-[^"]*"/g, '')
    .replace(/<code class="lang-([a-z]*)">/g,
             '<code class="hljs lang-$1">')
    .replace(/ +$/gm, '')

  const idRE = /\bid\s*=\s*"([^"]+)"/g
  const ids = new Map()
  for (;;) {
    const m = idRE.exec(body)
    if (!m)
      break
    if (ids.has(m[1]))
      console.warn(`Duplicate id '${m[1]}' in '${source}'`)
    ids.set(m[1], 1)
  }

  const hhrefRE = /\bhref="#([^"]+)"/g
  for (;;) {
    const m = hhrefRE.exec(body)
    if (!m)
      break
    if (!ids.has(m[1]))
      console.warn(`Target of internal link '${m[1]}' does not exist in '${source}'`)
  }

  const headElems = [
    `<meta charset="utf-8">`,
    `<title>${title}</title>`,
    icon && `<link rel="icon" href="${icon}">`,
    `<link rel="stylesheet" type="text/css" href="fw/github.css">`,
    hljsStyle && `<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/${hljsVersion}/styles/${hljsStyle}.min.css">`,
    klipse && `<link rel="stylesheet" type="text/css" href="https://storage.googleapis.com/app.klipse.tech/css/codemirror.css">`,
    `<link rel="stylesheet" type="text/css" href="fw/styles.css">`,
    ga && `<script type="text/javascript">startTime = Date.now()</script>`,
    ga && `<script type="text/javascript">(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');ga('create','${ga}','auto');ga('send','pageview');</script>`
  ].filter(x => x)

  const preBodyElems = [
    klipse && loadingMessage && `<div class="loading-message">
      Please wait... The interactive code snippets on this page take a moment to render.
    </div>`,
    menu && `<div class="menu">
      <div class="menu-overlay"></div>
      <div class="menu-body">
        <div class="menu-side">
          <div>≡</div>
          <a id="to-top" href="#" onclick="">▲</a>
        </div>
        <div class="menu-contents"></div>
      </div>
    </div>`,
    klipse && klipseHeader && `<p>
      All the code snippets on this page are <b>live</b> and <b>interactive</b>
      powered by the <a target="_blank" href="https://github.com/viebel/klipse">klipse
      plugin</a>.
    </p>
    <hr>`
  ].filter(x => x)

  const afterLoadStmts = [
    loadingMessage && `document.querySelector('.loading-message').className = "loading-hidden";`,
    ga && `ga('send', 'event', 'completed', 'load', Math.round((Date.now() - startTime)/1000));`,
    klipse && `accelerate_klipse();`
  ].filter(x => x)

  const postBodyElems = [
    afterLoadStmts.length && `<div class="loading-hidden">
      <pre><code class="hljs lang-js">
        ${afterLoadStmts.join('\n        ')}
      </code></pre>
    </div>`
  ].filter(x => x)

  const allScripts = [].concat(
    klipse ? scripts : [],
    klipse ?
      ['fw/klipse-settings.js',
       'https://storage.googleapis.com/app.klipse.tech/plugin_prod/js/klipse_plugin.min.js'] : [],
    [`https://cdnjs.cloudflare.com/ajax/libs/highlight.js/${hljsVersion}/highlight.min.js`,
     `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/${hljsVersion}/languages/javascript.min.js`,
     'fw/init-hljs.js'],
    menu ? ['fw/menu.js'] : [],
    tooltips ? ['fw/tooltips.js'] : [],
    ga ? ['fw/clicks-to-ga.js'] : []
  )

  if (!fs.existsSync(docsDir))
    fs.mkdirSync(docsDir)

  fs.writeFileSync(
    `${docsDir}/${target}`,
    `<!DOCTYPE html>
<html>
  <head>
    ${headElems.join('\n    ')}
  </head>
  <body class="markdown-body">
    ${preBodyElems.join('\n    ')}
    ${body}
    ${postBodyElems.join('\n    ')}
    ${allScripts
      .map(src => `<script type="text/javascript" src="${src}"></script>`)
      .join("\n    ")}
  </body>
</html>`)

  const docsFwDir = `${docsDir}/fw`

  if (!fs.existsSync(docsFwDir))
    fs.mkdirSync(docsFwDir)

  const srcFwDir = `${__dirname}/fw`
  fs.readdirSync(srcFwDir).forEach(file => {
    const srcPath = `${srcFwDir}/${file}`
    const dstPath = `${docsFwDir}/${file}`
    const srcData = fs.readFileSync(srcPath).toString()
    if (!fs.existsSync(dstPath) ||
        fs.readFileSync(dstPath).toString() !== srcData)
      fs.writeFileSync(dstPath, srcData)
  })
}

//

targets.forEach(process)
