export type BuildTarget = 'server' | 'client'

export type BuildEnvironment = 'dev' | 'prod' | 'debug'

export type BuildParam = BuildTarget | BuildEnvironment

export type StartParam =
    | 'watch'
    | 'prod'
    | 'debug'
    | 'debug-brk'
    | 'client'
    | '--debug-port'
    | number

export type WatchParam = 'server' | 'client'
