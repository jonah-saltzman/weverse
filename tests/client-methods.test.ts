import { WeverseClient } from '../'
import { createLoginPayload } from '../src/client/helpers'
import { WeverseLoginPayloadInterface, WeversePasswordAuthorization } from '../src/types'
import axios from 'axios'

jest.mock('../src/client/helpers', () => {
    return {
        createLoginPayload: function (credentials: WeversePasswordAuthorization): WeverseLoginPayloadInterface {
            return {
                username: credentials.username,
                password: credentials.password.split('').reverse().join(''),
                client_id: 'weverse-test',
                grant_type: 'password'
            }
        }
    }
})

// jest.mock('axios')
// const mockAxios = axios as jest.Mocked<typeof axios>

describe('client methods - token provided', () => {
    let myClient: WeverseClient
    beforeEach(() => {
        jest.restoreAllMocks()
        myClient = new WeverseClient({token: 'myWeverseToken'}, true)
    })

    it('won\t try to login without username & password', async () => {
        const mockPost = jest.spyOn(axios, 'post')
        await myClient.login()
        expect(mockPost).toBeCalledTimes(0)
        expect(myClient.authorized).toBe(false)
    })

    it('will try to login if given a username & password', async() => {
        const mockPost = jest.spyOn(axios, 'post')
        mockPost.mockResolvedValue({
            status: 200,
            data: {
                access_token: 'fake_token',
                token_type: 'bearer',
                expires_in: 0,
                refresh_token: 'fake_refresh_token',
                weMemberId: 123
            }
        })
        await myClient.login({username: 'kim', password: 'bora'})
        expect(mockPost).toBeCalledTimes(1)
        expect(myClient.refreshToken).toBe('fake_refresh_token')
        expect(myClient.authType).toBe('token')
        expect(myClient.authorized).toBe(true)
        expect(myClient.authorization).toStrictEqual({token: 'fake_token'})
        expect(myClient.weverseId).toBe(123)
    })
})