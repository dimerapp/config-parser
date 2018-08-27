/*
* config-parser
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

const test = require('japa')
const ConfigParser = require('..')
const fs = require('fs-extra')
const { join } = require('path')
const Context = require('@dimerapp/context')

const basePath = join(__dirname, 'app')

const ctx = new Context(basePath)

test.group('Config Parser', (group) => {
  group.afterEach(async () => {
    await fs.remove(basePath)
  })

  test('throw exception when file is missing', async (assert) => {
    assert.plan(1)

    const configParser = new ConfigParser(ctx)

    try {
      await configParser.parse()
    } catch ({ message }) {
      assert.deepEqual(message, 'Cannot find dimer.json file. Run `dimer init` to create one')
    }
  })

  test('return error when domain is missing', async (assert) => {
    await fs.outputJSON(ctx.get('paths').configFile(), {})

    const configParser = new ConfigParser(ctx)
    const config = await configParser.parse()
    assert.deepEqual(config, {
      errors: [
        { key: ['domain'], message: 'Define domain' },
        { key: ['versions'], message: 'Define atleast one version' }
      ],
      config: {
        cname: '',
        domain: '',
        zones: [{
          name: 'default',
          versions: [],
          slug: 'default'
        }],
        websiteOptions: {},
        compilerOptions: {
          apiUrl: 'http://localhost:5000',
          createSearchIndex: true,
          detectAssets: true,
          assetsUrl: 'http://localhost:5000/__assets'
        }
      }
    })
  })

  test('return error when version is set to null', async (assert) => {
    await fs.outputJSON(ctx.get('paths').configFile(), {
      domain: 'adonisjs.com',
      versions: {
        '1.0.0': null
      }
    })

    const configParser = new ConfigParser(ctx)
    const config = await configParser.parse()

    assert.deepEqual(config, {
      errors: [{ key: ['versions', '1.0.0'], message: 'Define docs directory' }],
      config: {
        cname: '',
        domain: 'adonisjs.com',
        zones: [{
          name: 'default',
          slug: 'default',
          versions: [
            {
              no: '1.0.0',
              default: true
            }
          ]
        }],
        websiteOptions: {},
        compilerOptions: {
          apiUrl: 'http://localhost:5000',
          createSearchIndex: true,
          detectAssets: true,
          assetsUrl: 'http://localhost:5000/__assets'
        }
      }
    })
  })

  test('return error when version is set to object but location is missing', async (assert) => {
    await fs.outputJSON(ctx.get('paths').configFile(), {
      domain: 'adonisjs.com',
      versions: {
        '1.0.0': {
          name: 'Version 1',
          default: true
        }
      }
    })

    const configParser = new ConfigParser(ctx)
    const config = await configParser.parse()
    assert.deepEqual(config, {
      errors: [{ key: ['versions', '1.0.0'], message: 'Define docs directory' }],
      config: {
        cname: '',
        domain: 'adonisjs.com',
        zones: [{
          name: 'default',
          slug: 'default',
          versions: [
            {
              no: '1.0.0',
              name: 'Version 1',
              default: true
            }
          ]
        }],
        websiteOptions: {},
        compilerOptions: {
          apiUrl: 'http://localhost:5000',
          createSearchIndex: true,
          detectAssets: true,
          assetsUrl: 'http://localhost:5000/__assets'
        }
      }
    })
  })

  test('return normalized versions node, when config file is valid', async (assert) => {
    await fs.outputJSON(ctx.get('paths').configFile(), {
      domain: 'adonisjs.com',
      versions: {
        '1.0.0': 'docs/master'
      }
    })

    const configParser = new ConfigParser(ctx)
    const config = await configParser.parse()
    assert.deepEqual(config, {
      errors: [],
      config: {
        cname: '',
        domain: 'adonisjs.com',
        zones: [{
          name: 'default',
          slug: 'default',
          versions: [
            {
              no: '1.0.0',
              location: 'docs/master',
              default: true
            }
          ]
        }],
        websiteOptions: {},
        compilerOptions: {
          apiUrl: 'http://localhost:5000',
          createSearchIndex: true,
          detectAssets: true,
          assetsUrl: 'http://localhost:5000/__assets'
        }
      }
    })
  })

  test('set default to true when version matches', async (assert) => {
    await fs.outputJSON(ctx.get('paths').configFile(), {
      domain: 'adonisjs.com',
      defaultVersion: '1.0.0',
      versions: {
        '1.0.0': 'docs/master'
      }
    })

    const configParser = new ConfigParser(ctx)
    const config = await configParser.parse()
    assert.deepEqual(config, {
      errors: [],
      config: {
        cname: '',
        domain: 'adonisjs.com',
        zones: [{
          name: 'default',
          slug: 'default',
          versions: [
            {
              no: '1.0.0',
              location: 'docs/master',
              default: true
            }
          ]
        }],
        websiteOptions: {},
        compilerOptions: {
          apiUrl: 'http://localhost:5000',
          createSearchIndex: true,
          detectAssets: true,
          assetsUrl: 'http://localhost:5000/__assets'
        }
      }
    })
  })

  test('do not override `no` when defined explicitly', async (assert) => {
    await fs.outputJSON(ctx.get('paths').configFile(), {
      domain: 'adonisjs.com',
      defaultVersion: '1.0.0',
      versions: {
        '1.0.0': {
          location: 'docs/master',
          no: 'foo'
        }
      }
    })

    const configParser = new ConfigParser(ctx)
    const config = await configParser.parse()
    assert.deepEqual(config, {
      errors: [],
      config: {
        cname: '',
        domain: 'adonisjs.com',
        zones: [{
          name: 'default',
          slug: 'default',
          versions: [
            {
              no: '1.0.0',
              location: 'docs/master',
              default: true
            }
          ]
        }],
        websiteOptions: {},
        compilerOptions: {
          apiUrl: 'http://localhost:5000',
          createSearchIndex: true,
          detectAssets: true,
          assetsUrl: 'http://localhost:5000/__assets'
        }
      }
    })
  })

  test('create file if missing', async (assert) => {
    const configParser = new ConfigParser(ctx)
    const created = await configParser.init()
    assert.isTrue(created)

    const config = await fs.readJSON(ctx.get('paths').configFile())
    assert.deepEqual(config, {
      cname: '',
      domain: '',
      websiteOptions: {},
      defaultVersion: 'master',
      versions: {
        master: 'docs/master'
      },
      compilerOptions: {
        detectAssets: true,
        createSearchIndex: true
      }
    })
  })

  test('do not create if file already exists', async (assert) => {
    await fs.outputJSON(ctx.get('paths').configFile(), {})

    const configParser = new ConfigParser(ctx)
    const created = await configParser.init()
    assert.isFalse(created)

    const config = await fs.readJSON(ctx.get('paths').configFile())
    assert.deepEqual(config, {})
  })

  test('return error when versions are not defined', async (assert) => {
    await fs.outputJSON(join(basePath, 'dimer.json'), {
      domain: 'adonisjs.com'
    })

    const configParser = new ConfigParser(ctx)
    const config = await configParser.parse()
    assert.deepEqual(config, {
      errors: [{ key: ['versions'], message: 'Define atleast one version' }],
      config: {
        cname: '',
        domain: 'adonisjs.com',
        zones: [{
          name: 'default',
          slug: 'default',
          versions: []
        }],
        websiteOptions: {},
        compilerOptions: {
          apiUrl: 'http://localhost:5000',
          createSearchIndex: true,
          detectAssets: true,
          assetsUrl: 'http://localhost:5000/__assets'
        }
      }
    })
  })

  test('set highest version as default when none is defined', async (assert) => {
    await fs.outputJSON(join(basePath, 'dimer.json'), {
      domain: 'adonisjs.com',
      versions: {
        '1.0.0': 'docs/1.0.0',
        '1.0.1': 'docs/1.0.1'
      }
    })

    const configParser = new ConfigParser(ctx)
    const config = await configParser.parse()

    assert.deepEqual(config, {
      errors: [],
      config: {
        cname: '',
        domain: 'adonisjs.com',
        zones: [{
          name: 'default',
          slug: 'default',
          versions: [
            {
              no: '1.0.0',
              location: 'docs/1.0.0',
              default: false
            },
            {
              no: '1.0.1',
              location: 'docs/1.0.1',
              default: true
            }
          ]
        }],
        websiteOptions: {},
        compilerOptions: {
          apiUrl: 'http://localhost:5000',
          createSearchIndex: true,
          detectAssets: true,
          assetsUrl: 'http://localhost:5000/__assets'
        }
      }
    })
  })

  test('set master as the default when version when there is no default version', async (assert) => {
    await fs.outputJSON(join(basePath, 'dimer.json'), {
      domain: 'adonisjs.com',
      versions: {
        '1.0.0': 'docs/1.0.0',
        '1.0.1': 'docs/1.0.1',
        'master': 'docs/master'
      }
    })

    const configParser = new ConfigParser(ctx)
    const config = await configParser.parse()

    assert.deepEqual(config, {
      errors: [],
      config: {
        cname: '',
        domain: 'adonisjs.com',
        zones: [{
          name: 'default',
          slug: 'default',
          versions: [
            {
              no: '1.0.0',
              location: 'docs/1.0.0',
              default: false
            },
            {
              no: '1.0.1',
              location: 'docs/1.0.1',
              default: false
            },
            {
              no: 'master',
              location: 'docs/master',
              default: true
            }
          ]
        }],
        websiteOptions: {},
        compilerOptions: {
          apiUrl: 'http://localhost:5000',
          createSearchIndex: true,
          detectAssets: true,
          assetsUrl: 'http://localhost:5000/__assets'
        }
      }
    })
  })

  test('do not validate domain when validateDomain set to false', async (assert) => {
    await fs.outputJSON(ctx.get('paths').configFile(), {})

    const configParser = new ConfigParser(ctx, { validateDomain: false })
    const config = await configParser.parse()

    assert.deepEqual(config, {
      errors: [
        { key: ['versions'], message: 'Define atleast one version' }
      ],
      config: {
        cname: '',
        domain: '',
        zones: [{
          name: 'default',
          slug: 'default',
          versions: []
        }],
        websiteOptions: {},
        compilerOptions: {
          apiUrl: 'http://localhost:5000',
          createSearchIndex: true,
          detectAssets: true,
          assetsUrl: 'http://localhost:5000/__assets'
        }
      }
    })
  })

  test('use compilerOptions defined in config file', async (assert) => {
    await fs.outputJSON(ctx.get('paths').configFile(), {
      domain: 'adonisjs.com',
      defaultVersion: '1.0.0',
      versions: {
        '1.0.0': 'docs/master'
      },
      compilerOptions: {
        apiUrl: 'http://foo.com'
      }
    })

    const configParser = new ConfigParser(ctx)
    const { config } = await configParser.parse()

    assert.deepEqual(config.compilerOptions, {
      apiUrl: 'http://foo.com',
      createSearchIndex: true,
      detectAssets: true,
      assetsUrl: 'http://foo.com/__assets'
    })
  })

  test('use websiteOptions defined in config file', async (assert) => {
    await fs.outputJSON(ctx.get('paths').configFile(), {
      domain: 'adonisjs.com',
      defaultVersion: '1.0.0',
      versions: {
        '1.0.0': 'docs/master'
      },
      websiteOptions: {
        theme: 'default'
      }
    })

    const configParser = new ConfigParser(ctx)
    const { config } = await configParser.parse()

    assert.deepEqual(config.websiteOptions, {
      theme: 'default'
    })
  })

  test('given preference to config apiUrl', async (assert) => {
    await fs.outputJSON(ctx.get('paths').configFile(), {
      compilerOptions: {
        apiUrl: 'http://localhost:3000'
      }
    })

    const configParser = new ConfigParser(ctx, {})
    const { config } = await configParser.parse()

    assert.equal(config.compilerOptions.apiUrl, 'http://localhost:3000')
  })

  test('define custom apiUrl', async (assert) => {
    await fs.outputJSON(ctx.get('paths').configFile(), {
      compilerOptions: {
        apiUrl: 'http://localhost:3000'
      }
    })

    const configParser = new ConfigParser(ctx, { apiUrl: 'http://api.dimerapp.com' })
    const { config } = await configParser.parse()

    assert.equal(config.compilerOptions.apiUrl, 'http://api.dimerapp.com')
  })

  test('create docs/master if missing', async (assert) => {
    const configParser = new ConfigParser(ctx)
    const created = await configParser.init()
    assert.isTrue(created)

    const masterDir = await fs.exists(ctx.get('paths').versionDocsPath('docs/master'))
    assert.isTrue(masterDir)
  })

  test('allow zones to be defined as string', async (assert) => {
    await fs.outputJSON(ctx.get('paths').configFile(), {
      zones: {
        faq: 'faq'
      }
    })

    const configParser = new ConfigParser(ctx, {})
    const { config } = await configParser.parse()

    assert.deepEqual(config.zones, [
      {
        slug: 'faq',
        name: 'faq',
        versions: [
          {
            no: 'master',
            location: 'faq',
            default: true
          }
        ]
      }
    ])
  })

  test('allow zones to be defined as object', async (assert) => {
    await fs.outputJSON(ctx.get('paths').configFile(), {
      domain: 'foo',
      zones: {
        faq: {
          slug: 'faq',
          versions: {
            master: 'faqs/master'
          }
        }
      }
    })

    const configParser = new ConfigParser(ctx, {})
    const { config, errors } = await configParser.parse()

    assert.deepEqual(errors, [])
    assert.deepEqual(config.zones, [
      {
        slug: 'faq',
        name: 'faq',
        versions: [{
          no: 'master',
          location: 'faqs/master',
          default: true
        }]
      }
    ])
  })

  test('allow zones to define name', async (assert) => {
    await fs.outputJSON(ctx.get('paths').configFile(), {
      domain: 'foo',
      zones: {
        faq: {
          slug: 'faq',
          name: 'FAQ\'s',
          versions: {
            master: 'faqs/master'
          }
        }
      }
    })

    const configParser = new ConfigParser(ctx, {})
    const { config, errors } = await configParser.parse()

    assert.deepEqual(errors, [])
    assert.deepEqual(config.zones, [
      {
        slug: 'faq',
        name: 'FAQ\'s',
        versions: [{
          no: 'master',
          location: 'faqs/master',
          default: true
        }]
      }
    ])
  })

  test('raise error when version is missing in zones object', async (assert) => {
    await fs.outputJSON(ctx.get('paths').configFile(), {
      domain: 'foo',
      zones: {
        faq: {
          slug: 'faq'
        }
      }
    })

    const configParser = new ConfigParser(ctx, {})
    const { config, errors } = await configParser.parse()

    assert.deepEqual(errors, [{
      key: ['zones', 'faq', 'versions'],
      message: 'Define atleast one version'
    }])

    assert.deepEqual(config.zones, [
      {
        slug: 'faq',
        name: 'faq',
        versions: []
      }
    ])
  })

  test('raise error when zones is set to null', async (assert) => {
    await fs.outputJSON(ctx.get('paths').configFile(), {
      domain: 'foo',
      zones: null
    })

    const configParser = new ConfigParser(ctx, {})
    const { config, errors } = await configParser.parse()

    assert.deepEqual(errors, [{
      key: ['zones'],
      message: 'Define versions for the zone'
    }])

    assert.deepEqual(config.zones, [])
  })

  test('raise error when zones is set to empty object', async (assert) => {
    await fs.outputJSON(ctx.get('paths').configFile(), {
      domain: 'foo',
      zones: {}
    })

    const configParser = new ConfigParser(ctx, {})
    const { config, errors } = await configParser.parse()

    assert.deepEqual(errors, [{
      key: ['zones'],
      message: 'Define versions for the zone'
    }])

    assert.deepEqual(config.zones, [])
  })

  test('raise error when zones and versions are defined together', async (assert) => {
    await fs.outputJSON(ctx.get('paths').configFile(), {
      domain: 'foo',
      zones: {
        faq: 'faq'
      },
      versions: {
        docs: 'master'
      }
    })

    const configParser = new ConfigParser(ctx, {})
    const { errors } = await configParser.parse()

    assert.deepEqual(errors, [{
      key: ['zones'],
      message: 'When using zones, make sure to nest versions inside them'
    }])
  })

  test('raise error when zones and defaultVersion is defined together', async (assert) => {
    await fs.outputJSON(ctx.get('paths').configFile(), {
      domain: 'foo',
      zones: {
        faq: 'faq'
      },
      defaultVersion: 'master'
    })

    const configParser = new ConfigParser(ctx, {})
    const { errors } = await configParser.parse()

    assert.deepEqual(errors, [{
      key: ['zones'],
      message: 'When using zones, make sure to nest versions inside them'
    }])
  })
})
