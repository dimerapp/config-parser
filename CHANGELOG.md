<a name="2.0.2"></a>
## [2.0.2](https://github.com/dimerapp/config-parser/compare/v2.0.1...v2.0.2) (2018-09-03)


### Bug Fixes

* use zone object value when value is defined as string ([abc199e](https://github.com/dimerapp/config-parser/commit/abc199e))



<a name="2.0.1"></a>
## [2.0.1](https://github.com/dimerapp/config-parser/compare/v2.0.0...v2.0.1) (2018-08-29)



<a name="2.0.0"></a>
# [2.0.0](https://github.com/dimerapp/config-parser/compare/v1.0.9...v2.0.0) (2018-08-27)


### Features

* **zones:** add support for zones ([e573101](https://github.com/dimerapp/config-parser/commit/e573101))


### BREAKING CHANGES

* **zones:** `versions` have been removed from top level keys and is nested inside the `zones`
property. Existing config files will parse fine, however the parsed value will not have versions and
instead have zones



<a name="1.0.9"></a>
## [1.0.9](https://github.com/dimerapp/config-parser/compare/v1.0.8...v1.0.9) (2018-08-03)


### Bug Fixes

* give preference to apiUrl from options ([146977f](https://github.com/dimerapp/config-parser/commit/146977f))
* indent default config file created via init method ([f39fe35](https://github.com/dimerapp/config-parser/commit/f39fe35))


### Features

* create master version directory if missing ([1a974b3](https://github.com/dimerapp/config-parser/commit/1a974b3))



<a name="1.0.8"></a>
## [1.0.8](https://github.com/dimerapp/config-parser/compare/v1.0.7...v1.0.8) (2018-08-03)


### Features

* accept apiUrl as an option ([017066c](https://github.com/dimerapp/config-parser/commit/017066c))



<a name="1.0.7"></a>
## [1.0.7](https://github.com/dimerapp/config-parser/compare/v1.0.6...v1.0.7) (2018-08-01)


### Bug Fixes

* merge config compilerOptions with defaults ([e3c6b8c](https://github.com/dimerapp/config-parser/commit/e3c6b8c))



<a name="1.0.6"></a>
## [1.0.6](https://github.com/dimerapp/config-parser/compare/v1.0.5...v1.0.6) (2018-08-01)


### Bug Fixes

* ctx.get must be used to access properties ([80f83c3](https://github.com/dimerapp/config-parser/commit/80f83c3))



<a name="1.0.5"></a>
## [1.0.5](https://github.com/dimerapp/config-parser/compare/v1.0.4...v1.0.5) (2018-08-01)


### Code Refactoring

* rename options to websiteOptions ([1fa3400](https://github.com/dimerapp/config-parser/commit/1fa3400))
* use ctx over asking for basePath ([e6f4b90](https://github.com/dimerapp/config-parser/commit/e6f4b90))


### Features

* export compiler options ([020be76](https://github.com/dimerapp/config-parser/commit/020be76))


### BREAKING CHANGES

* config now returns websiteOptions over just options
* first argument accepts ctx instance of basePath



<a name="1.0.4"></a>
## [1.0.4](https://github.com/dimerapp/config-parser/compare/v1.0.3...v1.0.4) (2018-07-28)



<a name="1.0.3"></a>
## [1.0.3](https://github.com/dimerapp/config-parser/compare/v1.0.2...v1.0.3) (2018-07-27)


### Features

* **parser:** accept options to validate domain or not ([f1c4431](https://github.com/dimerapp/config-parser/commit/f1c4431))



<a name="1.0.2"></a>
## [1.0.2](https://github.com/dimerapp/config-parser/compare/v1.0.1...v1.0.2) (2018-07-26)



<a name="1.0.1"></a>
## [1.0.1](https://github.com/dimerapp/config-parser/compare/v1.0.0...v1.0.1) (2018-07-25)


### Features

* **versions:** add a way to find the default version from convention ([1955950](https://github.com/dimerapp/config-parser/commit/1955950))
* **versions:** validate to make sure there is atleast one version ([c34c7ba](https://github.com/dimerapp/config-parser/commit/c34c7ba))



<a name="1.0.0"></a>
# 1.0.0 (2018-07-22)


### Features

* initial working commit ([b229cb0](https://github.com/dimerapp/config-parser/commit/b229cb0))



