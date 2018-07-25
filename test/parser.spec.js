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

const configFile = join(__dirname, 'dimer.json')

test.group('Config Parser', (group) => {
  group.afterEach(async () => {
    await fs.remove(configFile)
  })

  test('return null when file is missing', async (assert) => {
    const configParser = new ConfigParser(configFile)
    const config = await configParser.parse()
    assert.deepEqual(config, { errors: ['Cannot find dimer.json file'], config: {} })
  })

  test('return error when domain is missing', async (assert) => {
    await fs.outputJSON(configFile, {})
    const configParser = new ConfigParser(configFile)
    const config = await configParser.parse()
    assert.deepEqual(config, {
      errors: ['{domain} property missing in dimer.json', 'Make sure to define atleast one version'],
      config: {
        cname: '',
        domain: '',
        versions: [],
        options: {}
      }
    })
  })

  test('return error when version is set to null', async (assert) => {
    await fs.outputJSON(configFile, {
      domain: 'adonisjs.com',
      versions: {
        '1.0.0': null
      }
    })

    const configParser = new ConfigParser(configFile)
    const config = await configParser.parse()
    assert.deepEqual(config, {
      errors: ['Make sure to define {docs directory} for version 1.0.0'],
      config: {
        cname: '',
        domain: 'adonisjs.com',
        versions: [
          {
            no: '1.0.0',
            default: false
          }
        ],
        options: {}
      }
    })
  })

  test('return error when version is set to object but location is missing', async (assert) => {
    await fs.outputJSON(configFile, {
      domain: 'adonisjs.com',
      versions: {
        '1.0.0': {
          name: 'Version 1',
          default: false
        }
      }
    })

    const configParser = new ConfigParser(configFile)
    const config = await configParser.parse()
    assert.deepEqual(config, {
      errors: ['Make sure to define {docs directory} for version 1.0.0'],
      config: {
        cname: '',
        domain: 'adonisjs.com',
        versions: [
          {
            no: '1.0.0',
            name: 'Version 1',
            default: false
          }
        ],
        options: {}
      }
    })
  })

  test('return normalized versions node, when config file is valid', async (assert) => {
    await fs.outputJSON(configFile, {
      domain: 'adonisjs.com',
      versions: {
        '1.0.0': 'docs/master'
      }
    })

    const configParser = new ConfigParser(configFile)
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
            default: false
          }
        ],
        options: {}
      }
    })
  })

  test('set default to true when version matches', async (assert) => {
    await fs.outputJSON(configFile, {
      domain: 'adonisjs.com',
      defaultVersion: '1.0.0',
      versions: {
        '1.0.0': 'docs/master'
      }
    })

    const configParser = new ConfigParser(configFile)
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
        options: {}
      }
    })
  })

  test('do no override no when defined explicitly', async (assert) => {
    await fs.outputJSON(configFile, {
      domain: 'adonisjs.com',
      defaultVersion: '1.0.0',
      versions: {
        '1.0.0': {
          location: 'docs/master',
          no: 'foo'
        }
      }
    })

    const configParser = new ConfigParser(configFile)
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
        options: {}
      }
    })
  })

  test('do no override no when defined explicitly', async (assert) => {
    await fs.outputJSON(configFile, {
      domain: 'adonisjs.com',
      defaultVersion: '1.0.0',
      versions: {
        '1.0.0': {
          location: 'docs/master',
          no: 'foo'
        }
      }
    })

    const configParser = new ConfigParser(configFile)
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
        options: {}
      }
    })
  })

  test('return file if missing', async (assert) => {
    const configParser = new ConfigParser(configFile)
    const created = await configParser.init()
    assert.isTrue(created)

    const config = await fs.readJSON(configFile)
    assert.deepEqual(config, {
      cname: '',
      domain: '',
      options: {},
      defaultVersion: 'master',
      versions: {
        master: 'docs/master'
      }
    })
  })

  test('do not create if file already exists', async (assert) => {
    await fs.outputJSON(configFile, {})

    const configParser = new ConfigParser(configFile)
    const created = await configParser.init()
    assert.isFalse(created)

    const config = await fs.readJSON(configFile)
    assert.deepEqual(config, {})
  })

  test('return error when versions are not defined', async (assert) => {
    await fs.outputJSON(configFile, {
      domain: 'adonisjs.com'
    })

    const configParser = new ConfigParser(configFile)
    const config = await configParser.parse()
    assert.deepEqual(config, {
      errors: ['Make sure to define atleast one version'],
      config: {
        cname: '',
        domain: 'adonisjs.com',
        versions: [],
        options: {}
      }
    })
  })
})
