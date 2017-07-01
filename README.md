# ghost-cli-pm2
[![npm version](https://badge.fury.io/js/ghost-cli-pm2.svg)](https://badge.fury.io/js/ghost-cli-pm2)

Ghost CLI process manager that uses pm2 to run Ghost

## Installation

```sh
npm i -g ghost-cli ghost-cli-pm2

ghost install --process pm2
```

**Note: installing ghost-cli-pm2 via yarn global add won't work correctly - Ghost-CLI currently doesn't support loading extensions via yarn.**


### TODOS (order of importance):
- Hook into `ghost uninstall` and remove ghost from pm2 instance list
- Better support for additional pm2 options like cluster mode, instance count, etc.
