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

const basePath = join(__dirname, 'app')

const ctx = {
  paths: {
    configFile () {
      return join(basePath, 'dimer.json')
    }
  }
}

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
    await fs.outputJSON(ctx.paths.configFile(), {})
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
        versions: [],
        websiteOptions: {}
      }
    })
  })

  test('return error when version is set to null', async (assert) => {
    await fs.outputJSON(ctx.paths.configFile(), {
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
        versions: [
          {
            no: '1.0.0',
            default: true
          }
        ],
        websiteOptions: {}
      }
    })
  })

  test('return error when version is set to object but location is missing', async (assert) => {
    await fs.outputJSON(ctx.paths.configFile(), {
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
        versions: [
          {
            no: '1.0.0',
            name: 'Version 1',
            default: true
          }
        ],
        websiteOptions: {}
      }
    })
  })

  test('return normalized versions node, when config file is valid', async (assert) => {
    await fs.outputJSON(ctx.paths.configFile(), {
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
        versions: [
          {
            no: '1.0.0',
            location: 'docs/master',
            default: true
          }
        ],
        websiteOptions: {}
      }
    })
  })

  test('set default to true when version matches', async (assert) => {
    await fs.outputJSON(ctx.paths.configFile(), {
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
        versions: [
          {
            no: '1.0.0',
            location: 'docs/master',
            default: true
          }
        ],
        websiteOptions: {}
      }
    })
  })

  test('do no override no when defined explicitly', async (assert) => {
    await fs.outputJSON(ctx.paths.configFile(), {
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
        versions: [
          {
            no: '1.0.0',
            location: 'docs/master',
            default: true
          }
        ],
        websiteOptions: {}
      }
    })
  })

  test('do no override no when defined explicitly', async (assert) => {
    await fs.outputJSON(ctx.paths.configFile(), {
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
        versions: [
          {
            no: '1.0.0',
            location: 'docs/master',
            default: true
          }
        ],
        websiteOptions: {}
      }
    })
  })

  test('return file if missing', async (assert) => {
    const configParser = new ConfigParser(ctx)
    const created = await configParser.init()
    assert.isTrue(created)

    const config = await fs.readJSON(ctx.paths.configFile())
    assert.deepEqual(config, {
      cname: '',
      domain: '',
      websiteOptions: {},
      defaultVersion: 'master',
      versions: {
        master: 'docs/master'
      }
    })
  })

  test('do not create if file already exists', async (assert) => {
    await fs.outputJSON(ctx.paths.configFile(), {})

    const configParser = new ConfigParser(ctx)
    const created = await configParser.init()
    assert.isFalse(created)

    const config = await fs.readJSON(ctx.paths.configFile())
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
        versions: [],
        websiteOptions: {}
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
        ],
        websiteOptions: {}
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
        ],
        websiteOptions: {}
      }
    })
  })

  test('do not validate domain when validateDomain set to false', async (assert) => {
    await fs.outputJSON(ctx.paths.configFile(), {})

    const configParser = new ConfigParser(ctx, { validateDomain: false })
    const config = await configParser.parse()

    assert.deepEqual(config, {
      errors: [
        { key: ['versions'], message: 'Define atleast one version' }
      ],
      config: {
        cname: '',
        domain: '',
        versions: [],
        websiteOptions: {}
      }
    })
  })
})
