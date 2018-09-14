<div align="center">
  <div>
    <img width="500" src="https://res.cloudinary.com/adonisjs/image/upload/q_100/v1532274184/Dimer_Readme_Banner_lyy7wv.svg" alt="Dimer App">
  </div>
  <br>
  <p>
    <a href="https://dimerapp.com/what-is-dimer">
      Dimer is an open source project and CMS to help you publish your documentation online.
    </a>
  </p>
  <br>
  <p>
    <sub>We believe every project/product is incomplete without documentation. <br /> We want to help you publish user facing documentation, without worrying <code>about tools or code</code> to write.</sub>
  </p>
  <br>
</div>

# Dimer Config Parser
> Parses dimer.json

[![travis-image]][travis-url]
[![npm-image]][npm-url]

This module parses the `dimer.json` file and returns a normalised config object back.

## Installation

```shell
npm i @dimerapp/config-parser

# yarn
yarn add @dimerapp/config-parser
```

## Usage

```js
const ConfigParser = require('@dimerapp/config-parser')
const Context = require('@dimerapp/context')

const ctx = new Context(__dirname)

// masterOptions are optional
const configParser = new ConfigParser(ctx, masterOptions)
```

## Master Options
You can optionally pass masterOptions to the constructor. The `masterOptions` are merged (with more priority) the compiler options defined inside the config file.

## Compiler options
Following options are allowed inside `dimer.json` config file as `compileOptions`.

#### validateDomain (boolean)
Whether or not to validate the domain. `default=true`

#### apiUrl? (string)
API url from which the api is served. `default=http://localhost:5000`. Defining this in options, will override the value explicitly defined in config.

#### assetsUrl? (string)
The assets url from where the assets will be served. If not defined, it will be created from the `apiUrl`.

#### createSearchIndex
Whether or not to create the search index.

#### detectAssets
Whether or not to detect assets.

## API

#### parse
Parse the config file and returns normalised config object.

```js
try {
  const { errors, config } = await configParser.parse()
  
  if (errors) {
    errors.forEach(({ message, ruleId }) => console.log(message, ruleId))
    return
  }

  // use config
} catch (error) {
  // file is missing or bad JSON
}
```

#### init
Create a new config file (if missing).

```js
await configParser.init()

// or pass custom config

await configParser.init({
  domain: '',
  versions: {}
})
```

## Config file sample
```js
{
  domain: 'adonisjs.dimerapp.com',
  cname?: 'adonisjs.com',
  defaultVersion: 'master',
  versions: {
    master: 'docs/master'
  },
  websiteOptions?: {},
  compilerOptions: {
    apiUrl: 'http://localhost:5000',
    detectAssets: true,
    createSearchIndex: true,
    assetsUrl?: 'http://localhost:5000/__assets',
    validateDomain?: true
  }
}
```

## Change log

The change log can be found in the [CHANGELOG.md](https://github.com/dimerapp/config-parser/CHANGELOG.md) file.

## Contributing

Everyone is welcome to contribute. Please take a moment to review the [contributing guidelines](CONTRIBUTING.md).

## Authors & License
[thetutlage](https://github.com/thetutlage) and [contributors](https://github.com/dimerapp/config-parser/graphs/contributors).

MIT License, see the included [MIT](LICENSE.md) file.

[travis-image]: https://img.shields.io/travis/dimerapp/config-parser/master.svg?style=flat-square&logo=travis
[travis-url]: https://travis-ci.org/dimerapp/config-parser "travis"

[npm-image]: https://img.shields.io/npm/v/@dimerapp/config-parser.svg?style=flat-square&logo=npm
[npm-url]: https://npmjs.org/package/@dimerapp/config-parser "npm"
