import { WeverseClient } from '../'

describe('client instantiation', () => {
    afterEach(() => jest.restoreAllMocks())

    it('instantiates with token', () => {
        const myClient = new WeverseClient({token: 'myWeverseToken'})
        expect(myClient.authType).toBe('token')
        expect(myClient.authorized).toBe(false)
        expect(myClient.authorization).toStrictEqual({token: 'myWeverseToken'})
        expect(myClient.verbose).toBe(false)
    })

    it('instantiates with login credentials', () => {
        const myClient = new WeverseClient({username: 'kim', password: 'bora'})
        expect(myClient.authType).toBe('password')
        expect(myClient.authorized).toBe(false)
        expect(myClient.authorization).toStrictEqual({username: 'kim', password: 'bora'})
        expect(myClient.verbose).toBe(false)
    })

    it('rejects instantiation without credentials', () => {
        let error: any = null
        try {
            //@ts-ignore
            const myClient = new WeverseClient()
        } catch(e) {
            error = e
        }
        expect(error).not.toBe(null)
    })
})