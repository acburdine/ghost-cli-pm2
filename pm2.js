'use strict';

const ProcessManager = require('ghost-cli').ProcessManager;
const Promise = require('bluebird');
const pm2 = require('pm2');

class PM2ProcessManager extends ProcessManager {
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
      return this.ensureStarted();
    }).finally(() => {
      return pm2.disconnect();
    });
  }

  stop() {
    return this._connect().then(() => {
      return Promise.fromCallback((cb) => pm2.stop(this.instance.name, cb));
    }).finally(() => {
      return pm2.disconnect();
    });
  }

  isRunning() {
    return this._connect().then(() => {
      return Promise.fromCallback((cb) => pm2.describe(this.instance.name, cb));
    }).then((list) => {
      const pm2Instance = list.find((l) => l.name === this.instance.name);

      if (!pm2Instance) {
        return Promise.resolve(false);
      }

      // the pid property is 0 when the process isn't running.
      return Promise.resolve(pm2Instance.pid > 0);
    }).finally(() => {
      pm2.disconnect();
    });
  }

  enable() {
    // TODO: pm2.startup implementation
    return Promise.resolve();
  }

  disable() {
    return this._connect().then(() => {
      return Promise.fromCallback((cb) => pm2.delete(this.instance.name, cb));
    }).finally(() => {
      pm2.disconnect();
    });
  }

  isEnabled() {
    return this._connect().then(() => {
      return Promise.fromCallback((cb) => pm2.list(cb));
    }).then((list) => {
      const pm2Instance = list.find((l) => l.name === this.instance.name);
      return Boolean(pm2Instance);
    }).finally(() => {
      pm2.disconnect();
    });
  }

  _connect() {
    return Promise.fromCallback((cb) => pm2.connect(cb));
  }

  /**
   * TODO: determine whether pm2 will *actually* run on any system :p
   */
  static willRun() {
    return true;
  }
}

module.exports = PM2ProcessManager;
