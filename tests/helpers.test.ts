import * as helpers from '../src/client/helpers'
import fs from 'fs'

const mockText = '-----FAKE KEY-----'
const realKey = "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu/OhimOynajYomJmBsNvQxSDwekunsp986l7s/zMN/8jHXFlTqT79ZOsOwzVdZcKnkWYXwJg4nhIFpaIsPzklQCImp2kfKUJQV3jzw7/Qtq6NrOOh9YBADr+b99SHYcc7E7cDHjGXgWlC5jEI9h80R822wBU0HcbODkAQ3uosvFhSq3gLpxwdimesZofkJ5ZbAmGIMj1GEWAfMGA49mxkv/cDFWry+6FM4mUW6A0301QUg4wK/8n6RrzRj1NUkevZj1smizHeqmBE+0BU5H/fR9HclErx3LMHlVlxSgEEEjNUx3B0bLO0OHppmEb4B3Tk1O3ZsquYyqZyb2lBTbrQwIDAQAB\n-----END PUBLIC KEY-----"
const password = 'hello'
jest.mock('fs')
jest.mock('path')
const mockFs = fs as jest.Mocked<typeof fs>

describe('testing readKey', () => {
    afterEach(() => jest.restoreAllMocks())

    it('should read the key from storage', () => {
        mockFs.readFileSync.mockReturnValue(mockText)
        const file = helpers.readKey()
        expect(file).toEqual(mockText)
    })

    it('should handle errors', () => {
        mockFs.readFileSync.mockImplementation(() => {
            throw new Error()
        })
        const file = helpers.readKey()
        expect(file).toBeNull()
    })
})

describe('testing encryptPassword', () => {
    afterEach(() => jest.restoreAllMocks())

    it('should encrypt password', () => {
        const encrypted = helpers.encryptPassword(password, realKey)
        expect(typeof encrypted === 'string').toBe(true)
        expect(encrypted).not.toEqual(password)
    })

    it('should handle invalid key', () => {
        const encryptedA = helpers.encryptPassword(password, '')
        const encryptedB = helpers.encryptPassword(password, null)
        expect(encryptedA).toBeNull()
        expect(encryptedB).toBeNull()
    })
})

describe('testing validateStatus', () => {
    it('should return true on valid status', () => {
        expect(helpers.validateStatus(200)).toBe(true)
        expect(helpers.validateStatus(305)).toBe(true)
        expect(helpers.validateStatus(404)).toBe(true)
    })
    it('should return false on invalid status', () => {
        expect(helpers.validateStatus(100)).toBe(false)
        expect(helpers.validateStatus(500)).toBe(false)
    })
})

describe('testing WeversePasswordAuthorization typeguard', () => {
    it('should recognize valid objects', () => {
        const valid = {username: 'sua', password: 'handong'}
        expect(helpers.isWeversePasswordAuthorization(valid)).toBe(true)
    })
    it('should recognize invalid objects', () => {
        const invalidA = {username: 'jiu', password: 123}
        const invalidB = {token: 'token'}
        //@ts-ignore
        expect(helpers.isWeversePasswordAuthorization(invalidA)).toBe(false)
        expect(helpers.isWeversePasswordAuthorization(invalidB)).toBe(false)
    })
})