'use strict';
const cli = require('ghost-cli');
const Promise = require('bluebird');
const pm2 = require('pm2');
const execa = require('execa');

class PM2ProcessManager extends cli.ProcessManager {
  get ghostBinFile() {
    return process.argv[1];
  }

  start(cwd, environment) {
    let startArgs = ['run'];

    if (environment === 'development') {
      startArgs.push('--development');
    }

    return this._connect().then(() => {
      return Promise.fromNode((cb) => pm2.start({
        name: this.instance.name,
        script: this.ghostBinFile,
        args: startArgs,
        cwd: cwd
      }, cb));
    }).then(() => {
      return pm2.disconnect();
    });
  }

  stop() {
    return this._connect().then(() => {
      return Promise.fromNode((cb) => pm2.stop(this.instance.name, cb));
    }).then(() => {
      return pm2.disconnect();
    });
  }

  isRunning() {
    // TODO: this is really dirty, but it's the only way to get things
    // to work w/o asynchronous behavior
    try {
      let result = execa.sync('pm2', ['show', this.instance.name], {
        preferLocal: true,
        localDir: __dirname
      });

      return Boolean(result.stdout.match(/online/));
    } catch (e) {
      if (e.code === 1) {
        // pm2 process doesn't exist, return false
        return false;
      }
    }
  }

  _connect() {
    return Promise.fromNode((cb) => pm2.connect(cb));
  }

  /**
   * TODO: determine whether pm2 will _actually_ run on any system :p
   */
  static willRun() {
    return true;
  }
}

module.exports = PM2ProcessManager;
