/*
* config-parser
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

const fs = require('fs-extra')
const normalizeUrl = require('normalize-url')
const url = require('url')
const _ = require('lodash')

/**
 * Parse dimer.json file and returns a normalized object
 *
 * @class ConfigParser
 *
 * @param {String} configPath
 */
class ConfigParser {
  constructor (ctx, options = {}) {
    this.paths = ctx.get('paths')

    this.options = Object.assign({ validateDomain: true }, options)

    this.defaults = {
      domain: '',
      cname: '',
      defaultVersion: 'master',
      versions: {
        master: 'docs/master'
      },
      websiteOptions: {},
      compilerOptions: {
        apiUrl: this.options.apiUrl,
        detectAssets: true,
        createSearchIndex: true
      }
    }
  }

  /**
   * Normalizes the domain
   *
   * @method _normalizeDomain
   *
   * @param  {String}         domain
   *
   * @return {String}
   *
   * @private
   */
  _normalizeDomain (domain) {
    return domain ? domain.replace(/^\/|[/.]$/g, '') : ''
  }

  /**
   * Normalizes cname
   *
   * @method _normalizeCname
   *
   * @param  {String}        cname
   *
   * @return {String}
   */
  _normalizeCname (cname) {
    return cname ? url.parse(normalizeUrl(cname)).hostname : ''
  }

  /**
   * Normalizes zones
   *
   * @method _normalizeZones
   *
   * @param  {Object}        zones
   *
   * @return {Array}
   *
   * @private
   */
  _normalizeZones (zones) {
    return _.map(zones, (zone, slug) => {
      const versions = typeof (zone) === 'string'
        ? this._normalizeVersions({ master: slug })
        : this._normalizeVersions(zone.versions, zone.defaultVersion)

      return { versions, name: zone.name || slug, slug }
    })
  }

  /**
   * Normalizes versions
   *
   * @method _normalizeVersions
   *
   * @param  {Object}           versions
   * @param  {String}           defaultVersion
   *
   * @return {Array}
   *
   * @private
   */
  _normalizeVersions (versions, defaultVersion) {
    let masterVersion = null

    const normalizedVersions = _.map(versions, (version, no) => {
      version = typeof (version) === 'string' ? { location: version, no } : _.assign({}, version, { no })

      /**
       * Store reference to master version number, since master will
       * be the default version when no other version is default
       */
      if (version.no === 'master') {
        masterVersion = version
      }

      version.default = !!(defaultVersion && version.no === defaultVersion)
      return version
    })

    /**
     * Set max version as default, when there is no default version
     */
    if (!defaultVersion) {
      const maxVersion = masterVersion || _.maxBy(normalizedVersions, (version) => version.no)
      if (maxVersion) {
        maxVersion.default = true
      }
    }

    return normalizedVersions
  }

  /**
   * Validates the domain name
   *
   * @method _validateDomain
   *
   * @param  {String}        domain
   * @param  {Array}         errorsBag
   *
   * @return {void}
   *
   * @private
   */
  _validateDomain (domain, errorsBag) {
    if (!domain) {
      errorsBag.push({ message: 'Missing domain in config', ruleId: 'missing-domain' })
    }
  }

  /**
   * Validates versions
   *
   * @method _validateVersions
   *
   * @param  {String}          versions
   * @param  {String}          forZone
   * @param  {Array}           errorsBag
   *
   * @return {void}
   */
  _validateVersions (versions, forZone, errorsBag) {
    if (!versions || !versions.length) {
      const message = forZone !== 'default'
        ? `Missing version(s) for ${forZone} zone in config`
        : 'Missing version(s) in config'

      errorsBag.push({ message, ruleId: 'no-versions' })
      return
    }

    _.each(versions, (version) => {
      if (!version.location) {
        errorsBag.push({
          message: `Missing docs directory for ${version.no} version`,
          ruleId: 'missing-docs-directory'
        })
      }
    })
  }

  /**
   * Validates the zones to make sure they are ready to be
   * consumed by other parts of the app
   *
   * @method _validateZones
   *
   * @param  {Array}       zones
   * @param  {Array}       errorsBag
   *
   * @return {void}
   *
   * @private
   */
  _validateZones (zones, errorsBag) {
    if (!zones.length) {
      errorsBag.push({ message: 'Missing zones and versions', ruleId: 'no-zones' })
    }

    zones.forEach((zone) => {
      this._validateVersions(zone.versions, zone.slug, errorsBag)
    })
  }

  /**
   * Validates the top level keys to make sure they are not conflicting
   * with each other.
   *
   * @method _validateTopLevelKeys
   *
   * @param  {Object}              config
   * @param  {Array}              errorsBag
   *
   * @return {void}
   *
   * @private
   */
  _validateTopLevelKeys (config, errorsBag) {
    if (config.zones && (config.versions || config.defaultVersion)) {
      errorsBag.push({ message: 'Versions and zones conflict', ruleId: 'keys-conflicts' })
    }
  }

  /**
   * Parses the config contents
   *
   * @method _parseConfigContents
   *
   * @param  {Object}             config
   *
   * @return {Object}
   *
   * @private
   */
  _parseConfigContents (config = {}) {
    const errors = []

    /**
     * If top level keys are not valid, then return as it is
     */
    this._validateTopLevelKeys(config, errors)
    if (errors.length) {
      return { errors, config }
    }

    /**
     * If there are no zones defined (which is optional), we should
     * create a zone and nest the versions inside it.
     */
    if (config.zones === undefined) {
      config.zones = {
        default: {
          defaultVersion: config.defaultVersion || '',
          versions: config.versions || {}
        }
      }
    }

    const domain = this._normalizeDomain(config.domain)
    const cname = this._normalizeCname(config.cname)
    const zones = this._normalizeZones(config.zones || {})

    const websiteOptions = config.websiteOptions || {}

    const compilerOptions = Object.assign({
      apiUrl: 'http://localhost:5000',
      createSearchIndex: true,
      detectAssets: true
    }, config.compilerOptions)

    /**
     * We give preference to `apiUrl` from the options.
     * This way, we allow modifying the apiUrl on fly
     * without changing the config file again and
     * again.
     */
    if (this.options.apiUrl) {
      compilerOptions.apiUrl = this.options.apiUrl
    }

    /**
     * Create the assets url (if missing)
     */
    compilerOptions.assetsUrl = compilerOptions.assetsUrl || `${compilerOptions.apiUrl.replace(/\/$/, '')}/__assets`

    /**
     * Validate domain (if required)
     */
    if (this.options.validateDomain) {
      this._validateDomain(domain, errors)
    }

    /**
     * Validate zones node
     */
    this._validateZones(zones, errors)

    return { errors, config: { domain, cname, zones, websiteOptions, compilerOptions } }
  }

  /**
   * Parse the config file by reading it from the disk
   *
   * @method parse
   *
   * @return {Object}
   */
  async parse () {
    try {
      const config = await fs.readJSON(this.paths.configFile(), 'utf-8')
      return this._parseConfigContents(config)
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error('Cannot find dimer.json file. Run `dimer init` to create one')
      }

      throw error
    }
  }

  /**
   * Creates the config file (only if not already exists)
   *
   * @method init
   *
   * @param  {Object} options
   *
   * @return {Boolean}
   */
  async init (options) {
    const exists = await fs.exists(this.paths.configFile())
    if (exists) {
      return false
    }

    const config = _.merge({}, this.defaults, options)
    await fs.outputJSON(this.paths.configFile(), config, { spaces: 2 })

    /**
     * Create empty directory when missing.
     */
    await fs.ensureDir(this.paths.versionDocsPath(config.versions.master))

    return true
  }
}

module.exports = ConfigParser
