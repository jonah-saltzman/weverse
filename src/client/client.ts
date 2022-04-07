import { 
    WeverseAuthorization,
    WeverseClientSettings,
    WeverseOauthCredentials,
    WeversePasswordAuthorization,
    WeverseTokenAuthorization,
    isWeverseLogin, 
    WeverseLoginPayloadInterface,
    WeverseInitOptions,
    Community, CommunityArray,
    Artist, ArtistArray, 
    GetOptions, NotificationArray, 
    Notification, isNotification, 
    PostArray, Post, WvHeaders,
    isPost } from "../types"

import { 
    WeverseUrl as urls,
    validateStatus, toCommunity, toArtist, toNotification, toPost } from "."

import axios, { AxiosResponse } from 'axios'

import { 
    isWeversePasswordAuthorization,
    createLoginPayload,
    createRefreshPayload } from "./helpers"

import { WeverseArtist, WeverseCommunity, 
    WeverseNotification, ClientNotifications, 
    WeversePost } from "../models"

export class WeverseClient {

    protected _verbose: boolean
    protected _authorization: WeversePasswordAuthorization | WeverseTokenAuthorization
    protected _authType: 'token' | 'password'
    protected _loginPayload: WeverseLoginPayloadInterface | null
    protected _authorized: boolean
    protected _credentials: WeverseOauthCredentials | null
    protected _refreshToken?: string
    protected _weverseId?: number
    protected _headers: WvHeaders
    public communities: WeverseCommunity[] = []
    protected _communityMap: Map<number, WeverseCommunity> = new Map<number, WeverseCommunity>()
    public artists: WeverseArtist[] = []
    protected _artistMap: Map<number, WeverseArtist> = new Map<number, WeverseArtist>()
    public notifications = new ClientNotifications()
    public posts: WeversePost[] = []
    protected _postsMap: Map<number, WeversePost> = new Map<number, WeversePost>()

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
        try {
            if (!await this.checkLogin()) return
            await this.getCommunities({init: true})
            if (!this.communities) throw 'error'
            this.log('Weverse: communities initialized')
            await Promise.all(this.communities.map((c: WeverseCommunity) => this.getCommunityArtists(c, {init: true})))
            this.log('Weverse: artists initialized')
            await this.getRecentNotifications()
            this.log('Weverse: recent notifications retreived')
            if (options?.allPosts) {
                await Promise.all(this.communities.map((c: WeverseCommunity) => this.getCommunityPosts(c, {init: true})))
                this.log('Weverse: all posts retreived')
            }
        } catch(e) {
            console.log('Weverse: initialization failed')
            console.log(e)
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

    public async getCommunities(opts?: GetOptions): Promise<WeverseCommunity[] | null> {
        if (!opts || !opts.init) {
            if (!await this.checkLogin()) return null
        }
        //if (this.communities) return this.communities
        const response = await axios.get(urls.communities, { headers: this._headers })
        if (this.handleResponse(response, urls.communities) && response.data.communities) {
            const communities = CommunityArray(response.data.communities).map(toCommunity)
            communities.forEach((c: WeverseCommunity) => {
                this._communityMap.set(c.id, c)
            })
            this.communities = communities
            return communities
        }
        return null
    }

    public async getCommunityArtists(c: WeverseCommunity, opts?: GetOptions): Promise<WeverseArtist[] | null> {
        if (!opts || !opts.init) {
            if (!await this.checkLogin()) return null
        }
        const response = await axios.get(urls.community(c.id), { headers: this._headers })
        if (this.handleResponse(response, urls.community(c.id))) {
            const data = response.data
            if (data.artists) {
                const artists = ArtistArray(data.artists).map((a: Artist) => toArtist(a, c))
                c.addArtists(artists)
                this.artists.push(...artists)
                artists.forEach((a: WeverseArtist) => {
                    this._artistMap.set(a.id, a)
                })
            }
        }
        return null
    }

    public async getRecentNotifications(): Promise<WeverseNotification[] | null> {
        if (!await this.checkLogin()) return null
        const response = await axios.get(urls.allNotifications, { headers: this._headers })
        if (this.handleResponse(response, urls.allNotifications)) {
            const notifications = NotificationArray(response.data.notifications).map((n: Notification) => {
                if (n.communityId === 0) return
                const artist = this._artistMap.get(n.artistId ?? -1)
                const community = this._communityMap.get(n.communityId)
                if (!community) {
                    this.log('Weverse: failed to find community for notification:')
                    this.log(n)
                    return
                } else {
                    return toNotification(n, community, artist)
                }
            }).filter(isNotification)
            this.notifications.addMany(notifications)
            return notifications
        }
        return null
    }

    public async getCommunityPosts(c: WeverseCommunity, opts?: GetOptions): Promise<WeversePost[] | null> {
        if (!opts || !opts.init) {
            if (!await this.checkLogin()) return null
        }
        const response = await axios.get(urls.communityPosts(c.id), { headers: this._headers })
        if (this.handleResponse(response, urls.communityPosts(c.id))) {
            const posts = PostArray(response.data.posts).map((p: Post) => {
                const artist = this._artistMap.get(p.communityUser.artistId)
                if (!artist) {
                    this.log('Weverse: failed to find artist for post:')
                    this.log(p)
                    return
                } else {
                    return toPost(p, c, artist)
                }
            }).filter(isPost)
            c.addPosts(posts)
            this.posts.push(...posts)
            posts.forEach((p: WeversePost) => {
                this._postsMap.set(p.id, p)
            })
            await Promise.all(posts.map(async (p: WeversePost) => p.getVideoUrls(this._headers)))
            return posts
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

    protected handleResponse(response: AxiosResponse, url: string): boolean {
        if (response.status === 200) return true
        this.log(`Weverse: API error @ ${url}. Status code ${response.status}`)
        return false
    }

    protected log(...vals: any): void {
        if (this.verbose) console.log(...vals)
    }

    public communityById(id: number): WeverseCommunity | null {
        return this._communityMap.get(id) ?? null
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