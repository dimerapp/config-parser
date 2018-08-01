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
    this.ctx = ctx
    this.options = Object.assign({ validateDomain: true }, options)

    this.defaults = {
      domain: '',
      cname: '',
      defaultVersion: 'master',
      versions: {
        master: 'docs/master'
      },
      options: {}
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
      errorsBag.push({ key: ['domain'], message: 'Define domain' })
    }
  }

  /**
   * Validates versions
   *
   * @method _validateVersions
   *
   * @param  {String}          versions
   * @param  {Array}           errorsBag
   *
   * @return {void}
   */
  _validateVersions (versions, errorsBag) {
    if (!versions.length) {
      errorsBag.push({ key: ['versions'], message: 'Define atleast one version' })
      return
    }

    _.each(versions, (version) => {
      if (!version.location) {
        errorsBag.push({ key: ['versions', version.no], message: 'Define docs directory' })
      }
    })
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

    const domain = this._normalizeDomain(config.domain)
    const cname = this._normalizeCname(config.cname)
    const versions = this._normalizeVersions(config.versions || {}, config.defaultVersion)
    const options = config.options || {}

    if (this.options.validateDomain) {
      this._validateDomain(domain, errors)
    }

    this._validateVersions(versions, errors)

    return { errors, config: { domain, cname, versions, options } }
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
      const config = await fs.readJSON(this.ctx.paths.configFile(), 'utf-8')
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
    const exists = await fs.exists(this.ctx.paths.configFile())
    if (exists) {
      return false
    }

    const config = _.merge({}, this.defaults, options)
    await fs.outputJSON(this.ctx.paths.configFile(), config)

    return true
  }
}

module.exports = ConfigParser
