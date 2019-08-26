# Building, Running and Debugging

## Building

```
pwt build [<target> <environment>]
```

## Customising

By default, Project Watchtower uses its own webpack configuration files. If you want to modify or extend them with custom options for you project, there are multiple ways of providing custom configuration:

### Basic config file

To override the root directory (defaults to current working directory), set the `ROOT_DIR` environmental variable

If you want to change the default configuration of the build process, you can add a `/config/config.js` that overrides the settings used by the default webpack configuration:

```ts
import path from 'path'
import { BuildConfigOverride } from 'project-watchtower/lib/types'

const customConfig: BuildConfigOverride = {
    SERVER_OUTPUT: path.resolve(process.cwd(), 'dist'),
}

export default customConfig
```

You can also default export a function with the below signature which which allows you to consume the current project root

```ts
;(root: string) => BuildConfigOverride
```

If you provide a `/config/config.ts` in TypeScript, make sure it is transpiled to JavaScript before any `pwt` command is run or any of Project Watchtower's middlewares are used. This can be done in the `prepare` script in your project's `package.json`. Project Watchtower will throw an error if it detects a TypeScript configuration file, but not the transpiled JavaScript artifact.

The complete default configuration is located in `project-watchtower/lib/runtime/config/config.ts`

See the [config documentation](./config.md) for an overview of the default project structure and configuration details.

### Webpack hooks

Add `/config/webpack-hooks.js` to your project:

```ts
import { WebpackHooks } from 'project-watchtower/lib/types'
import FooWebpackPlugin from 'foo-webpack-plugin'

const hooks: WebpackHooks = {
    base: {
        plugins: [new FooWebpackPugin()],
    },
}

export default hooks
```

The following hooks can be defined:

-   `base`
-   `client`
-   `server`
-   `dev`
-   `prod`
-   `clientDev`
-   `clientProd`
-   `clientDebug`
-   `serverDev`
-   `serverProd`
-   `serverDebug`

These hooks are applied internally to all webpack cofigurations that have a target and environment.

If you provide a completely custom webpack configuration as described below, they will

-   not be applied if you only use basic building blocks (like `base`, `clientBase` or `devBase`)
-   be applied if you extend complete configurations (like `clientDev`, `serverProd`)

### Custom webpack configuration

Add configuration files to your project: `/config/webpack.<target>.<environment>.js`.

Example:

```ts
import { merge } from 'project-watchtower/lib/build'
import { clientBase } from 'project-watchtower/lib/config'

const config = merge(base, clientBase, {
    // ...
})

export default config
```

## Running

    pwt start [watch] [debug] [prod]

Starts the server, using the environment variables defined in `.env`

### Environment Variables

-   `NODE_ENV`: set to `"production"` or `"development` depending on the `prod` flag - in the webpack bundles the values are hardcoded depending on which mode they were built in, so this is only relevant for third-party dependencies.
-   `START_WATCH_MODE`: set to `"true"` by the `watch` flag
-   `START_DEBUG_MODE`: set to `"true"` by the `debug` flag

If you want to use additional `process.env` variables in the **client** build, make sure you create a `.env` (for local) and `.env.default` file:

`.env`

> FOO=bar

`.env.default`

> FOO=

The values defined here are replaced in the client build. The server build still accesses its actual `process.env` object, only `process.env.NODE_ENV` is being replaced there.
Values that are present in the actual runtime environment at build time will _not_ be overridden by the ones defined in `.env` / `.env.default`. However, it is necessary to define all the environment variables in the `.env.default` file that are used in the client code.

### Hot Reloading

In development we use [webpack-dev-middleware](https://github.com/webpack/webpack-dev-middleware) and [webpack-hot-middleware](https://github.com/glenjamin/webpack-hot-middleware) to enable hot reloading. See the webpack docs under [https://webpack.js.org/guides/hot-module-replacement/](https://webpack.js.org/guides/hot-module-replacement/).

```jsx
const render = () => {
    const App = require < { default: React.ReactType } > './components/App'.default
    ReactDOM.render(
        <BrowserRouter>
            <App />
        </BrowserRouter>,
        document.getElementById('root'),
    )
}

render()

if (module.hot) {
    module.hot.accept('./components/App', () => {
        setTimeout(render)
    })
}
```

For more information see [https://github.com/webpack-contrib/extract-text-webpack-plugin/issues/30#issuecomment-284301283](https://github.com/webpack-contrib/extract-text-webpack-plugin/issues/30#issuecomment-284301283)

## Debugging

As VS code has problems with sourcemaps that are generated during the runtime of the debugger, the process of debugging has to be split into a "build" and a "debug" phase. The "build" tasks are defined in `.vscode/tasks.json`, the "debug" configurations in `.vscode/launch.json` - they reference the "build" tasks as their `preLaunchTask`.

### Debug server build

In your `package.json`, add a shortcut script for project-watchtower:

```
"pwt": "pwt"
```

Add a debug configuration to `.vscode/launch.json`:

```
{
    "type": "node",
    "request": "launch",
    "name": "Debug server",
    "runtimeExecutable": "npm",
    "windows": {
        "runtimeExecutable": "npm.cmd"
    },
    "runtimeArgs": [
        "run-script",
        "pwt",
        "start",
        "debug"
    ],
    "port": 5858,
    "timeout": 60000,
    "sourceMaps": true,
    "outFiles": [
        "${workspaceRoot}/build/server.js",
        "${workspaceRoot}/build/*.js"
    ],
    "smartStep": true,
    "trace": "sm",
    "preLaunchTask": "build:debug"
}
```

Add the following task to `.vscode/tasks.json`:

```
{
    "taskName": "build:debug",
    "args": [
        "run",
        "pwt",
        "build",
        "debug"
    ]
}
```
