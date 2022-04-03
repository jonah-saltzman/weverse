import { 
    WeverseAuthorization,
    WeverseClientSettings,
    WeverseOauthCredentials,
    WeversePasswordAuthorization,
    WeverseTokenAuthorization,
    isWeverseLogin } from "../types"

import { 
    WeverseUrl as urls,
    validateStatus } from "."

import axios, { AxiosResponse } from 'axios'

import { 
    isWeversePasswordAuthorization,
    WeverseLoginPayload } from "./helpers"

export class WeverseClient implements WeverseClientSettings {

    verbose: boolean
    authorization: WeversePasswordAuthorization | WeverseTokenAuthorization
    authType: 'token' | 'password'
    protected _loginPayload: WeverseLoginPayload | null
    protected _authorized: boolean
    protected _credentials: WeverseOauthCredentials | null
    protected headers: {[key: string]: string} | undefined

    constructor(verbose: boolean, authorization: WeverseAuthorization) {
        this._authorized = false
        this.verbose = verbose
        this.authorization = authorization
        this._loginPayload = null
        this._credentials = null
        if ('token' in authorization) {
            this.authType = 'token'
            this.headers = { 'Authorization': 'Bearer ' + authorization.token }
        } else {
            this.authType = 'password'
        }
    }
    
    public async login(credentials?: WeversePasswordAuthorization): Promise<void> {
        if (credentials) {
            this.log('Weverse: using provided credentials')
            this.authorization = credentials
            this.authType = 'password'
            this._authorized = false
        }
        try {
            if (this.authType !== 'password') {
                this.log('Weverse: provide credentials to call .login')
                return
            }
            this.createLoginPayload()
            if (!this._loginPayload) {
                this.log('Weverse: failed to generate login payload')
                return
            }
            const response = await axios.post(
                urls.login,
                this._loginPayload.payload,
                { validateStatus }
            )
            if (this.handleResponse(response, urls.login)) {
                const credentials = response.data
                //console.log(credentials)
                if (isWeverseLogin(credentials)) {
                    this._credentials = credentials
                    this._authorized = true
                    this.authorization = { token: credentials.access_token }
                    this.authType = 'token'
                    this.log('Weverse password authorization succeeded')
                } else {
                    this.log('Weverse password authorization failed')
                }
            }
        } catch (e) {
            this.log(e)
        }
    }

    protected createLoginPayload(): void {
        let payload: WeverseLoginPayload | null = null
        if (isWeversePasswordAuthorization(this.authorization)) {
            payload = new WeverseLoginPayload(this.authorization)
        } else {
            return
        }
        if (!payload) return
        this._loginPayload = payload
    }

    public async checkToken(): Promise<boolean> {
        if (this.authType !== 'token') {
            this.log('Weverse: provide a token or call .login() with valid username + password')
            return false
        }
        try {
            const response = await axios.get(
                urls.checkToken,
                { headers: this.headers, validateStatus }
            )
            this.handleResponse(response, urls.checkToken)
            return this._authorized = response.status === 200
        } catch(e) {
            this.log(e)
            this._authorized = false
            return false
        }
    }

    async getAllCommunities(): Promise<void> {
        try {
            if (!this.authorized && !await this.checkToken()) return
            const response = await axios.get(urls.communities, { headers: this.headers })
            console.log(response.data)
        } catch(e) {
            console.log(e)
        }
    }

    handleResponse(response: AxiosResponse, url: string): boolean {
        if (response.status === 200) return true
        this.log(`Weverse: API error @ ${url}. Status code ${response.status}`)
        return false
    }

    protected log(...vals: any): void {
        if (this.verbose) console.log(...vals)
    }

    public get authorized(): boolean {
        return this._authorized
    }
}