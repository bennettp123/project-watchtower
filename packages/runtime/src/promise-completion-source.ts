/**
 * PromiseCompletionSource allows the resolution/rejection of a promise to be
 * controled outside of the promise ctor callback
 *
 * Example:
 * const pcs = new PromiseCompletionSource<any>()
 *
 * const promise = pcs.promise
 * pcs.resolve('data')
 */
export class PromiseCompletionSource<T = {}> {
    completed = false
    private _promise: Promise<T> | undefined

    constructor(private autoReset = false) {}

    resolve: (result: T) => Promise<void> = () =>
        Promise.reject('Nothing is observing this PromiseCompletionSource, cannot resolve')
    reject: (error: Error) => Promise<void> = () =>
        Promise.reject('Nothing is observing this PromiseCompletionSource, cannot reject')

    get promise(): Promise<T> {
        if (!this.autoReset && this._promise) {
            return this._promise
        }

        if (this._promise) {
            if (!this.completed) {
                // tslint:disable-next-line:max-line-length
                this.reject(
                    new Error(
                        'Cannot get new promise when autoReset is true and existing promise was not resolved',
                    ),
                )
            }
        }

        return this.reset()
    }

    reset = () => {
        this.completed = false
        this._promise = new Promise((resolve, reject) => {
            this.resolve = result => {
                this.ensureNotComplete()
                resolve(result)
                return new Promise<void>(r => setTimeout(r))
            }
            this.reject = error => {
                this.ensureNotComplete()
                reject(error)
                // We want to resolve this promise
                // because we are using this to know when callbacks are resolved
                // not get the error, you can await pcs.promise to get error
                return new Promise<void>(r => setTimeout(r))
            }
        })
        return this._promise
    }

    private ensureNotComplete = () => {
        if (this.completed) {
            throw new Error('Promise already completed')
        }
        this.completed = true
    }
}
