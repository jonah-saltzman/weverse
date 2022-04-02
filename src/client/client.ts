import { WeverseAuthorization, WeverseClientSettings, WeverseNotification, WeversePasswordAuthorization, WeverseTokenAuthorization } from "../types"
import urls from './urls'
import axios from 'axios'

export class WeverseClient implements WeverseClientSettings {
    verbose: boolean
    authorization: WeversePasswordAuthorization | WeverseTokenAuthorization
    authType: 'token' | 'password'
    protected authorized: boolean
    constructor(verbose: boolean, authorization: WeversePasswordAuthorization)
    constructor(verbose: boolean, token: WeverseTokenAuthorization)
    constructor(verbose: boolean, authorization: WeverseAuthorization) {
        this.authorized = false
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
        const response = await axios.get(urls.checkToken, {headers: this.headers})
        console.log(response)
        console.log(response.status)
        return response.status === 200
    }
    protected headers: {[key: string]: string} | undefined
    protected weversePublicKey = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu/OhimOynajYomJmBsNvQxSDwekunsp986l7s/zMN/8jHXFlTqT79ZOsOwzVdZcKnkWYXwJg4nhIFpaIsPzklQCImp2kfKUJQV3jzw7/Qtq6NrOOh9YBADr+b99SHYcc7E7cDHjGXgWlC5jEI9h80R822wBU0HcbODkAQ3uosvFhSq3gLpxwdimesZofkJ5ZbAmGIMj1GEWAfMGA49mxkv/cDFWry+6FM4mUW6A0301QUg4wK/8n6RrzRj1NUkevZj1smizHeqmBE+0BU5H/fR9HclErx3LMHlVlxSgEEEjNUx3B0bLO0OHppmEb4B3Tk1O3ZsquYyqZyb2lBTbrQwIDAQAB'
}