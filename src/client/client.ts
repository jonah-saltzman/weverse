import { 
    WeverseAuthorization,
    WeverseClientSettings,
    WeverseOauthCredentials,
    WeversePasswordAuthorization,
    WeverseTokenAuthorization,
    isWeverseLogin, 
    WeverseLoginPayloadInterface,
    WeverseInitOptions, 
    GetCommunitiesOptions, 
    Community, CommunityArray,
    Artist, ArtistArray} from "../types"

import { 
    WeverseUrl as urls,
    validateStatus } from "."

import axios, { AxiosResponse } from 'axios'

import { 
    isWeversePasswordAuthorization,
    createLoginPayload,
    createRefreshPayload } from "./helpers"

import { WeverseArtist, WeverseCommunity, WeverseTab } from "../models"

import { toCommunity, toArtist, toTab } from "./apiconverters"

export class WeverseClient {

    protected _verbose: boolean
    protected _authorization: WeversePasswordAuthorization | WeverseTokenAuthorization
    protected _authType: 'token' | 'password'
    protected _loginPayload: WeverseLoginPayloadInterface | null
    protected _authorized: boolean
    protected _credentials: WeverseOauthCredentials | null
    protected _refreshToken?: string
    protected _weverseId?: number
    protected _headers: {[key: string]: string} | undefined
    public communities: WeverseCommunity[] | null = null
    protected _communityMap: Map<number, WeverseCommunity> | null = null

    constructor(authorization: WeverseAuthorization, verbose?: boolean) {
        if (authorization === undefined) throw 'Must instantiate with Weverse token or login'
        verbose = verbose ?? false
        this._authorized = false
        this._verbose = verbose
        this._authorization = authorization
        this._loginPayload = null
        this._credentials = null
        if ('token' in authorization) {
            this._authType = 'token'
            this._headers = { 'Authorization': 'Bearer ' + authorization.token }
        } else {
            this._authType = 'password'
        }
    }

    public async init(options?: WeverseInitOptions): Promise<void> {
        if (!await this.checkLogin()) return
        await this.getCommunities({init: true})
        if (this.communities) {
            this.log('Weverse: communities initialized')
            await Promise.all(this.communities.map((c: WeverseCommunity) => this.getCommunityArtists(c)))
            this.communities.forEach((c: WeverseCommunity) => c.artists?.forEach((a: WeverseArtist) => console.log))
        }
    }

    public async tryRefreshToken(): Promise<boolean> {
        if (!this._credentials) return false
        const refreshPayload = createRefreshPayload(this._credentials)
        const response = await axios.post(urls.login, refreshPayload, { validateStatus })
        const credentials = response.data
        if (isWeverseLogin(credentials)) {
            this._credentials = credentials
            this._headers = { Authorization: 'Bearer ' + credentials.access_token }
            return true
        }
        return false
    }
    
    public async login(credentials?: WeversePasswordAuthorization): Promise<void> {
        this._authorized = false
        if (credentials) {
            this.log('Weverse: using provided credentials')
            this._authorization = credentials
            this._authType = 'password'
        }
        try {
            if (this._authType !== 'password') {
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
                this._loginPayload,
                { validateStatus }
            )
            if (this.handleResponse(response, urls.login)) {
                const credentials = response.data
                console.log(credentials)
                if (isWeverseLogin(credentials)) {
                    this._credentials = credentials
                    this._authorized = true
                    this._authorization = { token: credentials.access_token }
                    this._authType = 'token'
                    this._headers = { 'Authorization': 'Bearer ' + credentials.access_token }
                    this._refreshToken = credentials.refresh_token
                    this._weverseId = credentials.weMemberId
                    this.log('Weverse password authorization succeeded')
                } else {
                    this.log('Weverse password authorization failed')
                }
            }
        } catch (e) {
            this.log(e)
        }
    }

    public async checkLogin(): Promise<boolean> {
        if (this._authType === 'password') {
            await this.login()
            if (!this._authorized) {
                console.log('Weverse: login failed. Check username + password, or provide a token instead')
                return false
            }
        }
        if (!await this.checkToken()) {
            console.log('Weverse: invalid token / unable to refresh')
            return false
        }
        return true
    }

    public async getCommunities(opts?: GetCommunitiesOptions): Promise<WeverseCommunity[] | null> {
        if (!opts || !opts.init) {
            if (!await this.checkLogin()) return null
        }
        //if (this.communities) return this.communities
        const response = await axios.get(urls.communities, { headers: this._headers })
        if (this.handleResponse(response, urls.communities) && response.data.communities) {
            console.log(response.data.communities)
            const communities = CommunityArray(response.data.communities) 
            const allCommunities: WeverseCommunity[] = communities.map(toCommunity)
            const communityMap = new Map<number, WeverseCommunity>()
            allCommunities.forEach((c: WeverseCommunity) => {
                communityMap.set(c.id, c)
            })
            this._communityMap = communityMap
            this.communities = allCommunities
            return allCommunities
        }
        return null
    }

    public async getCommunityArtists(c: WeverseCommunity): Promise<WeverseArtist[] | null> {
        if (this._communityMap) {
            const community = this._communityMap.get(c.id)
            if (community && community.artists) {
                return community.artists
            }
        }
        const response = await axios.get(urls.community(c.id), { headers: this._headers })
        if (this.handleResponse(response, urls.community(c.id))) {
            const data = response.data
            if (data.artists) {
                const artists = ArtistArray(data.artists).map(toArtist)
                c.artists = artists
                return artists
            }
        }
        return null
    }

    protected createLoginPayload(): void {
        try {
            let payload: WeverseLoginPayloadInterface | null = null
            if (isWeversePasswordAuthorization(this._authorization)) {
                payload = createLoginPayload(this._authorization)
            } else {
                return
            }
            if (!payload) return
            this._loginPayload = payload
        } catch (e) {
            return
        }
    }

    public async checkToken(): Promise<boolean> {
        if (this._authType !== 'token') {
            this.log('Weverse: provide a token or call .login() with valid username + password')
            return false
        }
        try {
            const response = await axios.get(
                urls.checkToken,
                { headers: this._headers, validateStatus }
            )
            this.handleResponse(response, urls.checkToken)
            if (response.status === 200) {
                this._authorized = true
                return true
            } else {
                return this._authorized = await this.tryRefreshToken()
            }
        } catch(e) {
            this.log(e)
            this._authorized = false
            return false
        }
    }

    // public async getAllCommunities(): Promise<void> {
    //     try {
    //         if (!this.authorized && !await this.checkToken()) return
    //         const response = await axios.get(urls.communities, { headers: this._headers })
    //         console.log(response.data)
    //     } catch(e) {
    //         console.log(e)
    //     }
    // }

    protected handleResponse(response: AxiosResponse, url: string): boolean {
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

    public get credentials() {
        return this._credentials
    }

    public get verbose() {
        return this._verbose
    }

    public get authorization() {
        return this._authorization
    }

    public get authType() {
        return this._authType
    }

    public get loginPayload() {
        return this._loginPayload
    }

    public get refreshToken() {
        return this._refreshToken
    }

    public get weverseId() {
        return this._weverseId
    }

    public get requestHeaders() {
        return this._headers
    }
}

// protected _verbose: boolean
// protected _authorization: WeversePasswordAuthorization | WeverseTokenAuthorization
// protected _authType: 'token' | 'password'
// protected _loginPayload: WeverseLoginPayloadInterface | null
// protected _authorized: boolean
// protected _credentials: WeverseOauthCredentials | null
// protected _refreshToken?: string
// protected _weverseId?: number
// protected _headers: {[key: string]: string} | undefined