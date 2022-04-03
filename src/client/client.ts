import { WeverseAuthorization, WeverseClientSettings, WeverseNotification, WeversePasswordAuthorization, WeverseTokenAuthorization } from "../types"
import { WeverseUrl as urls } from "."
import axios, { AxiosResponse } from 'axios'
import { encryptPassword } from "./key"

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

    // self.__login_payload = {
    //     "grant_type": "password",
    //     "client_id": "weverse-test",
    //     "username": kwargs.get("username"),
    //     "password": self.__get_encrypted_password(kwargs.get("password"))
    // }
    async login(): Promise<void> {
        try {
            if (this.authType !== 'password') return
            const credentials = this.authorization as WeversePasswordAuthorization
            const payload = {
                'grant_type': 'password',
                'client_id': 'weverse-test',
                'username': credentials.username,
                'password': encryptPassword(credentials.password)
            }
            const response = await axios.post(urls.login, payload)
            if (this.handleResponse(response, urls.login)) {
                console.log(response.data)
            } else {
                console.log('login failed')
            }
        } catch (e) {
            if (this.verbose) console.error(e)
        }
    }
    async checkToken(): Promise<boolean> {
        try {
            const response = await axios.get(urls.checkToken, {headers: this.headers})
            console.log(response.status)
            return this._authorized = response.status === 200
        } catch(e) {
            if (this.verbose) console.error(e)
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
    handleResponse(response: AxiosResponse, url: string): boolean {
        if (response.status === 200) return true
        if (response.status === 401) {
            this._authorized = false
            if (this.verbose) console.log(`Weverse: 401 unauthorized`)
        }
        if (response.status === 404 && this.verbose) console.log(`Weverse: 404 not found`)
        if (this.verbose) console.log(`Weverse: API error @ ${url}. Status code ${response.status}`)
        return false
    }
    public get authorized(): boolean {
        return this._authorized
    }
    protected headers: {[key: string]: string} | undefined
}