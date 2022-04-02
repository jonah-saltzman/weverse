import { WeverseAuthorization, WeverseClientSettings, WeverseNotification, WeversePasswordAuthorization, WeverseTokenAuthorization } from "../types"
import urls from './urls'
import axios from 'axios'

export class WeverseClient implements WeverseClientSettings {
    verbose: boolean
    authorization: WeversePasswordAuthorization | WeverseTokenAuthorization
    authType: 'token' | 'password'
    protected _authorized: boolean
    constructor(verbose: boolean, authorization: WeversePasswordAuthorization)
    constructor(verbose: boolean, token: WeverseTokenAuthorization)
    constructor(verbose: boolean, authorization: WeverseAuthorization) {
        this._authorized = false
        this.verbose = verbose
        this.authorization = authorization
        if ('token' in authorization) {
            this.authType = 'token'
            this.headers = {'Authorization': 'Bearer ' + authorization.token}
        } else {
            this.authType = 'password'
        }
    }
    async checkToken(): Promise<boolean> {
        try {
            const response = await axios.get(urls.checkToken, {headers: this.headers})
            console.log(response.status)
            return this._authorized = response.status === 200
        } catch(e) {
            console.log(e)
            this._authorized = false
            return false
        }
    }
    async getAllCommunities(): Promise<void> {
        try {
            if (!this.authorized && !await this.checkToken()) throw 'Couldn\'t get Weverse Communities: invalid token'
            const response = await axios.get(urls.communities, {headers: this.headers})
            console.log(response.data)
        } catch(e) {
            console.log(e)
        }
    }
    handleResponse(status: number, url: string): boolean {
        if (status === 200) return true
        if (status === 401) {
            this._authorized = false
            if (this.verbose) console.log(`Weverse: 401 unauthorized`)
        }
        if (status === 404 && this.verbose) console.log(`Weverse: 404 not found`)
        if (this.verbose) console.log(`Weverse: API error @ ${url}. Status code ${status}`)
        return false
    }
    public get authorized(): boolean {
        return this._authorized
    }
    protected headers: {[key: string]: string} | undefined
    protected weversePublicKey = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu/OhimOynajYomJmBsNvQxSDwekunsp986l7s/zMN/8jHXFlTqT79ZOsOwzVdZcKnkWYXwJg4nhIFpaIsPzklQCImp2kfKUJQV3jzw7/Qtq6NrOOh9YBADr+b99SHYcc7E7cDHjGXgWlC5jEI9h80R822wBU0HcbODkAQ3uosvFhSq3gLpxwdimesZofkJ5ZbAmGIMj1GEWAfMGA49mxkv/cDFWry+6FM4mUW6A0301QUg4wK/8n6RrzRj1NUkevZj1smizHeqmBE+0BU5H/fR9HclErx3LMHlVlxSgEEEjNUx3B0bLO0OHppmEb4B3Tk1O3ZsquYyqZyb2lBTbrQwIDAQAB'
}