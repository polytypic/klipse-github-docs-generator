# Klipse GitHub Docs Generator &middot; [![GitHub stars](https://img.shields.io/github/stars/polytypic/klipse-github-docs-generator.svg?style=social)](https://github.com/polytypic/klipse-github-docs-generator) [![npm](https://img.shields.io/npm/dm/klipse-github-docs-generator.svg)](https://www.npmjs.com/package/klipse-github-docs-generator)

This is a minimalistic tool to generate HTML pages with
[Klipse](https://github.com/viebel/klipse) snippets from GitHub markdown.

Examples:
* [Fastener](https://polytypic.github.io/fastener/)
* [Partial Lenses Validation](https://calmm-js.github.io/partial.lenses.validation/)

This tool is still rough around the edges.  Feel free to contribute
improvements!

[![npm version](https://badge.fury.io/js/klipse-github-docs-generator.svg)](http://badge.fury.io/js/klipse-github-docs-generator)
[![](https://david-dm.org/polytypic/klipse-github-docs-generator.svg)](https://david-dm.org/polytypic/klipse-github-docs-generator) [![](https://david-dm.org/polytypic/klipse-github-docs-generator/dev-status.svg)](https://david-dm.org/polytypic/klipse-github-docs-generator?type=dev)

## Usage

First of all you need to have a GitHub markdown file with the documentation that
includes the snippets that you want to klipsify.  See
[here](https://github.com/polytypic/fastener/blob/master/README.md) for an
example.  The essential part is having code snippets in the markdown that can be
evaluated in a browser.  Import statements do not work and you should have those
marked in a different language.

### Install `klipse-github-docs-generator`

Install `klipse-github-docs-generator` as a dev dependency:

```bash
npm i --save-dev klipse-github-docs-generator
```

### `klipse-github-docs.config.js`

To configure the generator the project root needs to have a file named
`klipse-github-docs.config.js`, which must be a JavaScript file that must
contain a single function that returns an array of configuration objects.  See
[here](https://github.com/polytypic/fastener/blob/master/klipse-github-docs.config.js)
for an example.

### Generate docs

To generate `docs` you run the command:

```bash
npx klipse-github-docs-generator
```

You can also implement your own npm scripts to e.g. watch files to rebuild docs
and reload browser to make editing feedback faster.
