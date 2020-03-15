import { consoleLogger } from 'typescript-log'
import { recursiveTaskResolver } from './recursive-task-resolver'
import { PromiseTracker } from '../../utils/promise-tracker'

const testLogger = consoleLogger()

describe('Recursive Task Resolver', () => {
    it('Should abort after 5 tries', done => {
        const promiseTracker = new PromiseTracker()
        let count = 0
        const render = () => {
            if (count++ > 5) {
                done(new Error('Too many render calls!'))
            }
            promiseTracker.track(new Promise(resolve => setTimeout(resolve, 10)))
            return ''
        }
        render()
        recursiveTaskResolver(
            testLogger,
            promiseTracker,
            render,
            '/',
            '',
            5 /* attempts */,
            500 /* ms */,
        )
            .then(
                () => done(new Error('Expected too many recurses error')),
                err =>
                    expect(err.message).toEqual(
                        'Abort waiting for loading all data after 5 recursive waits',
                    ),
            )
            .then(() => done())
            .catch(done)
    })

    it('Resolves when nested promise resolves', done => {
        const promiseTracker = new PromiseTracker()
        let count = 0
        let resolvedSecondPromise = false
        const render = () => {
            if (count === 0) {
                promiseTracker.track(new Promise(resolve => setTimeout(resolve, 10)))
            } else if (count === 1) {
                const secondPromise = new Promise(resolve => setTimeout(resolve, 10)).then(() => {
                    resolvedSecondPromise = true
                })
                promiseTracker.track(secondPromise)
            }
            count++
            return ''
        }
        render()
        recursiveTaskResolver(
            testLogger,
            promiseTracker,
            render,
            '/',
            '',
            5, // attempts
            100, // ms
        )
            .then(() => {
                expect(resolvedSecondPromise).toBe(true)
                done()
            })
            .catch(done)
    })
})
