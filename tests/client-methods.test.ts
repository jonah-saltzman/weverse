import { WeverseClient } from '../'
import { validateStatus } from '../src/client/helpers'
import { WeverseLoginPayloadInterface, WeversePasswordAuthorization } from '../src/types'
import axios from 'axios'
import { WeverseUrl as urls } from '../src/client'

describe('client methods - token provided', () => {
    let myClient: WeverseClient
    beforeEach(() => {
        jest.restoreAllMocks()
        myClient = new WeverseClient({token: 'myWeverseToken'}, true)
    })

    it('sets authorization type', () => {
        expect(myClient.authType).toBe('token')
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

    it('attempts to validate existing token', async () => {
        const mockGet = jest.spyOn(axios, 'get')
        let getUrl: string = ''
        let headers: any = {}
        mockGet.mockImplementation((url, config) => {
            getUrl = url
            headers = config?.headers
            return Promise.resolve({status: 200})
        })
        const result = await myClient.checkToken()
        expect(mockGet).toBeCalledTimes(1)
        expect(getUrl).toBe(urls.checkToken)
        expect(headers).toStrictEqual({ 'Authorization': 'Bearer ' + 'myWeverseToken' })
        expect(result).toBe(true)
    })

    it('handles token rejection', async () => {
        const mockGet = jest.spyOn(axios, 'get')
        mockGet.mockResolvedValue({status: 401})
        const result = await myClient.checkToken()
        expect(mockGet).toBeCalledTimes(1)
        expect(result).toBe(false)
    })
})

describe('client methods - login provided', () => {
    let myClient: WeverseClient
    beforeEach(() => {
        jest.restoreAllMocks()
        myClient = new WeverseClient({username: 'kim', password: 'bora'}, true)
    })

    it('sets authorization type', () => {
        expect(myClient.authType).toBe('password')
    })

    it('creates login payload', async () => {
        const mockPost = jest.spyOn(axios, 'post')
        mockPost.mockImplementation((url, data) => {
            return Promise.resolve({status: 500})
        })
        await myClient.login()
        //@ts-ignore
        expect(myClient.loginPayload.password).not.toBe(myClient.authorization.password)
        expect(typeof myClient?.loginPayload?.password === 'string').toBe(true)
    })

    it('handles login success', async() => {
        const mockPost = jest.spyOn(axios, 'post')
        mockPost.mockResolvedValue({
            status: 200,
            data: {
                access_token: 'fake_access_token',
                token_type: 'bearer',
                expires_in: 0,
                refresh_token: 'fake_refresh_token',
                weMemberId: 123
            }
        })
        await myClient.login()
        expect(mockPost).toBeCalledTimes(1)
        expect(myClient.refreshToken).toBe('fake_refresh_token')
        expect(myClient.authType).toBe('token')
        expect(myClient.authorized).toBe(true)
        expect(myClient.authorization).toStrictEqual({token: 'fake_access_token'})
        expect(myClient.weverseId).toBe(123)
    })

    it('updates data on successful login with different account', async() => {
        const mockPost = jest.spyOn(axios, 'post')
        const firstData = {
            access_token: 'fake_access_token',
            token_type: 'bearer',
            expires_in: 0,
            refresh_token: 'fake_refresh_token',
            weMemberId: 123
        }
        const secondData = {
            access_token: 'new_access_token',
            token_type: 'bearer',
            expires_in: 0,
            refresh_token: 'new_refresh_token',
            weMemberId: 456
        }
        mockPost.mockResolvedValueOnce({
            status: 200,
            data: firstData
        }).mockResolvedValueOnce({
            status: 200,
            data: secondData
        })
        await myClient.login()
        expect(myClient.refreshToken).toBe('fake_refresh_token')
        expect(myClient.authType).toBe('token')
        expect(myClient.authorized).toBe(true)
        expect(myClient.authorization).toStrictEqual({token: 'fake_access_token'})
        expect(myClient.weverseId).toBe(123)
        await myClient.login({username: 'kim', password: 'minji'})
        expect(mockPost).toBeCalledTimes(2)
        expect(myClient.refreshToken).toBe('new_refresh_token')
        expect(myClient.authType).toBe('token')
        expect(myClient.authorized).toBe(true)
        expect(myClient.authorization).toStrictEqual({token: 'new_access_token'})
        expect(myClient.weverseId).toBe(456)
    })

    it('handles login rejection', async () => {
        const mockPost = jest.spyOn(axios, 'post')
        mockPost.mockResolvedValue({status: 401})
        await myClient.login()
        expect(mockPost).toBeCalledTimes(1)
        expect(myClient.authorized).toBe(false)
        expect(myClient.refreshToken).toBe(undefined)
        expect(myClient.authType).toBe('password')
    })

    it('won\'t check token before logging in', async () => {
        const mockGet = jest.spyOn(axios, 'get')
        await myClient.checkToken()
        expect(myClient.authorized).toBe(false)
        expect(myClient.refreshToken).toBe(undefined)
        expect(mockGet).toBeCalledTimes(0)
    })

    it('will check the token after successful login', async () => {
        const mockGet = jest.spyOn(axios, 'get')
        const mockPost = jest.spyOn(axios, 'post')
        let tokenUsed: string = ''
        mockPost.mockResolvedValue({
            status: 200,
            data: {
                access_token: 'fake_access_token',
                token_type: 'bearer',
                expires_in: 0,
                refresh_token: 'fake_refresh_token',
                weMemberId: 123
            }
        })
        mockGet.mockImplementation((url, config) => {
            //@ts-ignore
            tokenUsed = config?.headers?.Authorization
            return Promise.resolve({status: 200})
        })
        const firstTry = await myClient.checkToken()
        const headersBefore = myClient.requestHeaders
        await myClient.login()
        const headersAfter = myClient.requestHeaders
        const secondTry = await myClient.checkToken()
        expect(firstTry).toBe(false)
        expect(headersBefore).toBe(undefined)
        expect(secondTry).toBe(true)
        expect(headersAfter).toStrictEqual({Authorization: 'Bearer fake_access_token'})
        expect(tokenUsed).toBe('Bearer fake_access_token')
        expect(mockGet).toBeCalledTimes(1)
        expect(mockPost).toBeCalledTimes(1)
    })
})