import { 
    WeverseAuthorization,
    WeverseOauthCredentials,
    WeversePasswordAuthorization,
    WeverseTokenAuthorization,
    isWeverseLogin, 
    WeverseLoginPayloadInterface,
    WeverseInitOptions,
    CommunityArray, Artist, 
    ArtistArray, GetOptions, 
    NotificationArray, Notification, 
    isNotification, PostArray, 
    Post, WvHeaders, isPost, 
    NotifContent, NotifKeys, 
    CommentArray, Comment, isComment, ListenOptions } from "../types"

import { 
    WeverseUrl as urls,
    validateStatus, toCommunity, 
    toArtist, toNotification, 
    toPost, toComment, toMedia } from "."

import axios, { AxiosResponse } from 'axios'

import { 
    isWeversePasswordAuthorization,
    createLoginPayload,
    createRefreshPayload } from "./helpers"

import { WeverseArtist, WeverseCommunity, 
    WeverseNotification, ClientNotifications, 
    WeversePost, WeverseComment, WeverseMedia, 
    WeverseEvents } from "../models"

import EventEmitter from 'events'
import TypedEmitter from 'typed-emitter'

class WeverseEmitter extends (EventEmitter as new () => TypedEmitter<WeverseEvents>) {
    constructor() {
        super()
    }
    newError = (err: Error) => this.emit('error', err)
    ready = (initialized: boolean) => this.emit('init', initialized)
    newNotif = (notification: WeverseNotification) => this.emit('notification', notification)
    newPost = (post: WeversePost) => this.emit('post', post)
    newMedia = (media: WeverseMedia) => this.emit('media', media)
    newComment = (comment: WeverseComment, post: WeversePost) => this.emit('comment', comment, post)
    loginResult = (result: boolean) => this.emit('login', result)
    polled = (status: boolean) => this.emit('poll', status)
}

export class WeverseClient extends WeverseEmitter {

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
    protected _commentsMap: Map<number, WeverseComment> = new Map<number, WeverseComment>()
    protected listener: ReturnType<typeof setInterval> | undefined

    constructor(authorization: WeverseAuthorization, verbose?: boolean) {
        super()
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
            await Promise.all(
                this.communities.map((c: WeverseCommunity) => 
                    this.getCommunityArtists(c, {init: true})
                )
            )
            this.log('Weverse: artists initialized')
            await this.getNotifications(options?.allNotifications ? 0 : 1, true)
            this.log('Weverse: notifications retreived')
            await Promise.all(
                this.communities.map((c: WeverseCommunity) => 
                    this.getCommunityPosts(c, options?.allPosts ? 0 : 1)
                )
            )
            this.log('Weverse: posts retreived')
            this.ready(true)
        } catch(e) {
            console.log('Weverse: initialization failed')
            console.log(e)
            this.ready(false)
        }
    }

    public listen(opts: ListenOptions): void {
        if (opts.listen === false) {
            if (this.listener) {
                clearInterval(this.listener)
                this.log('Weverse: stopped listener')
            }
        } else {
            if (!opts.interval || opts.interval <= 0) this.log('Weverse: set a positive interval')
            else {
                this.listener = setInterval(this.checker.bind(this), opts.interval)
                this.log('Weverse: listening for new notifications')
            }
        }
    }

    protected async checker(): Promise<void> {
        try {
            await this.getNewNotifications()
            this.polled(true)
        } catch(e) {
            if (await this.checkLogin()) {
                this.log('Weverse: successfully reconnected')
                this.polled(true)
            }
            else {
                this.log('Weverse: failed to reconnect. Stopping listener')
                this.listen({listen: false})
                this.newError(new Error('Weverse: failed to reconnect. Stopping listener.'))
                this.polled(false)
            }
        }
    }

    public async tryRefreshToken(): Promise<boolean> {
        if (!this._credentials) return false
        try {
            const refreshPayload = createRefreshPayload(this._credentials)
            const response = await axios.post(urls.login, refreshPayload, { validateStatus })
            const credentials = response.data
            if (isWeverseLogin(credentials)) {
                this._credentials = credentials
                this._headers = { Authorization: 'Bearer ' + credentials.access_token }
                this._authorized = true
                this._refreshToken = credentials.refresh_token
                return true
            }
            this.log('Weverse: token refresh rejected')
            return false
        } catch {
            this.log('Weverse: error refreshing token')
            return false
        }
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
            if (await this.handleResponse(response, urls.login)) {
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
        try {
            const response = await axios.get(urls.communities, { headers: this._headers })
            if (await this.handleResponse(response, urls.communities) && response.data.communities) {
                const communities = CommunityArray(response.data.communities).map(toCommunity)
                communities.forEach((c: WeverseCommunity) => {
                    this._communityMap.set(c.id, c)
                })
                this.communities = communities
                return communities
            }
            return null
        } catch {
            this.log('Weverse: failed to get communities')
            return null
        }
    }

    public async getCommunityArtists(c: WeverseCommunity, opts?: GetOptions): Promise<WeverseArtist[] | null> {
        if (!opts || !opts.init) {
            if (!await this.checkLogin()) return null
        }
        try {
            const response = await axios.get(urls.community(c.id), { headers: this._headers })
            if (await this.handleResponse(response, urls.community(c.id))) {
                const data = response.data
                if (data.artists) {
                    const artists = ArtistArray(data.artists).map((a: Artist) => toArtist(a, c))
                    c.addArtists(artists)
                    this.artists.push(...artists)
                    artists.forEach((a: WeverseArtist) => {
                        this._artistMap.set(a.id, a)
                    })
                    return artists
                }
            }
            this.log(`Weverse: failed to get artists for ${c.name}: bad response`)
            return null
        } catch {
            this.log(`Weverse: error getting artists for ${c.name}`)
            return null
        }
    }

    public async getRecentNotifications(): Promise<WeverseNotification[] | null> {
        if (!await this.checkLogin()) return null
        return await this.getNotifications(1)
    }

    public async getCommunityPosts(c: WeverseCommunity, pages: number): Promise<WeversePost[] | null>
    public async getCommunityPosts(c: number, pages: number): Promise<WeversePost[] | null>
    public async getCommunityPosts(c: WeverseCommunity | number, pages: number): Promise<WeversePost[] | null> {
        let wvc: WeverseCommunity
        if (typeof c === 'number') {
            const temp = this._communityMap.get(c)
            if (!temp) {
                this.log('Weverse: community not found')
                return null
            } else {
                wvc = temp
            }
        } else {
            wvc = c
        }
        if (pages === undefined) pages = 1
        if (pages <= -1) return null
        if (pages === 0) pages = Infinity
        let count = 0
        let from = 0
        const posts: WeversePost[] = []
        while (count <= pages) {
            try {
                const response = await axios.get(
                    urls.communityPostsPages(wvc.id, from),
                    { headers: this._headers }
                )
                if (await this.handleResponse(response, urls.communityPostsPages(wvc.id, from))) {
                    const data = response.data
                    if (data.posts) {
                        const newPosts = PostArray(data.posts).map((p: Post) => {
                            const artist = this._artistMap.get(p.communityUser.artistId)
                            if (!artist) {
                                this.log('Weverse: failed to find artist for post:')
                                this.log(p)
                                return
                            } else {
                                return toPost(p, wvc, artist)
                            }
                        }).filter(isPost)
                        const added = wvc.addPosts(newPosts)
                        await Promise.all(added.map(p => p.getVideoUrls(this._headers)))
                        this.posts.push(...added)
                        added.forEach((p: WeversePost) => {
                            this.newPost(p)
                            this._postsMap.set(p.id, p)
                        })
                        posts.push(...added)
                    }
                    if (typeof data.isEnded === 'boolean' && data.isEnded) break
                    from = data.lastId
                    if (from == null || (typeof from === 'number' && from <= 0)) {
                        this.log('Weverse: malformed response from notifications endpoint')
                        break
                    }
                    count++
                } else {
                    throw new Error()
                }
            } catch {
                this.log('Weverse: failed to get notifications after ' + count + ' pages')
                return posts
            }
        }
        return posts
    }

    public async getNotifications(pages?: number, process?: boolean): Promise<WeverseNotification[] | null> {
        if (pages === undefined) pages = 1
        if (pages <= -1) return null
        if (pages === 0) pages = Infinity
        let count = 0
        let from = 0
        const notifications: WeverseNotification[] = []
        while (count < pages) {
            try {
                const response = await axios.get(urls.notifications(from), { headers: this._headers })
                const { data } = response
                if (await this.handleResponse(response, urls.notifications(from))) {
                    const n = NotificationArray(data.notifications).map((n: Notification) => {
                        if (n.communityId === 0) return
                        const artist = this._artistMap.get(n.artistId ?? -1)
                        const community = this._communityMap.get(n.communityId)
                        if (!community) {
                            this.log('Weverse: failed to find community for notification:')
                            this.log(n)
                            return
                        } else {
                            try {
                                return toNotification(n, community, artist)
                            } catch (e) {
                                this.log('malformed notification:')
                                this.log(n)
                                return
                            }
                        }
                    }).filter(isNotification)
                    notifications.push(...this.notifications.addMany(n))
                    if (typeof data.isEnded === 'boolean' && data.isEnded) break
                    from = data.lastId
                    if (from == null || (typeof from === 'number' && from <= 0)) {
                        this.log('Weverse: malformed response from notifications endpoint')
                        break
                    }
                    count++
                } else {
                    throw new Error()
                }
            } catch {
                this.log('Weverse: failed to get notifications after ' + count + ' pages')
                break
            }
        }
        if (process) {
            await Promise.all(notifications.map(async n => {
                this.newNotif(n)
                await this.processNotification(n)
            }))
            return notifications
        } else {
            return notifications
        }
    }

    public async getNewNotifications(): Promise<WeverseNotification[] | null> {
        if (!await this.checkLogin()) return null
        const newNotifications = await this.getNotifications(1, false)
        if (newNotifications) {
            await Promise.all(newNotifications.map(this.processNotification))
            return newNotifications
        }
        return null
    }

    public async getMedia(id: number, community: WeverseCommunity): Promise<WeverseMedia[] | null> {
        try {
            const response = await axios.get(
                urls.media(community.id, id),
                { headers: this._headers, validateStatus }
            )
            if (await this.handleResponse(response, urls.media(community.id, id))) {
                const data = response.data
                if (data.media) {
                    const media = toMedia(data.media, community)
                    const added = community.addMedia([media])
                    added.forEach(this.newMedia)
                    return added
                } else {
                    throw new Error()
                }
            } else {
                throw new Error()
            }
        } catch {
            this.log(`Weverse: error getting media id ${id}`)
            return null
        }
    }

    public async getComments(p: WeversePost, c: WeverseCommunity, cId?: number): Promise<WeverseComment[] | null> {
        try {
            const response = await axios.get(urls.postComments(p.id, c.id), { headers: this._headers })
            if (await this.handleResponse(response, urls.postComments(p.id, c.id))) {
                const data = response.data
                if (data.artistComments) {
                    const comments = CommentArray(data.artistComments).map((c: Comment) => {
                        const artist = this._artistMap.get(c.communityUser.artistId)
                        if (!artist) return
                        return toComment(c, p, artist)
                    }).filter(isComment)
                    const added = p.addComments(comments)
                    added.forEach((c: WeverseComment) => {
                        this._commentsMap.set(c.id, c)
                        this.newComment(c, p)
                    })
                    return added
                }
            }
            throw new Error()
        } catch {
            this.log(`Weverse: error getting comments for post ${p.id}`)
            return null
        }
    }

    public async getPost(id: number, communityId: number): Promise<WeversePost | null> {
        const saved = this._postsMap.get(id)
        if (saved) return saved
        try {
            const response = await axios.get(urls.postDetails(id, communityId), { headers: this._headers })
            if (await this.handleResponse(response, urls.postDetails(id, communityId))) {
                const data = response.data
                if (data) {
                    const artistId = data.communityUser.artistId
                    if (!artistId || typeof artistId !== 'number') return null
                    const community = this._communityMap.get(communityId)
                    const artist = this._artistMap.get(artistId)
                    if (!community || !artist) return null
                    const post = toPost(data, community, artist)
                    await post.getVideoUrls(this._headers)
                    this.posts.push(post)
                    this._postsMap.set(post.id, post)
                    community.addPosts([post])
                    this.newPost(post)
                    return post
                } else {
                    return null
                }
            }
            throw new Error()
        } catch {
            this.log(`Weverse: error getting post ${id}`)
            return null
        }
    }

    public async processNotification(n: WeverseNotification): Promise<void> {
        let k: keyof typeof NotifContent
        for (k in NotifContent) {
            if (NotifContent[k].some(str => n.message.includes(str))) {
                n.type = k
                break
            }
        }
        try {
            switch (n.type) {
                case NotifKeys.COMMENT:
                    const artist = this._artistMap.get(n.artistId ?? -1)
                    const replyTo = n.contentsExtraInfo?.originContentId
                    let postId: number
                    let commentId: number | undefined = undefined
                    if (typeof replyTo === 'number') {
                        postId = replyTo
                        commentId = n.contentsExtraInfo.replyCommentId
                    } else {
                        postId = n.contentsId
                    }
                    const post = await this.getPost(postId, n.community.id)
                    if (!post || !artist) throw new Error()
                    await this.getComments(post, post.community, commentId)
                    break
                case NotifKeys.POST:
                    await this.getPost(n.contentsId, n.community.id)
                    break
                case NotifKeys.MEDIA:
                    await this.getMedia(n.contentsId, n.community)
                    break
                case NotifKeys.ANNOUNCEMENT:
                    break
                default:
                    this.log('Weverse: unknown notification type: ')
                    this.log(n)
            }
        } catch (e) {
            this.log(`failed to process notification ${n.id}: ${n.type}`)
        }
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

    protected async handleResponse(response: AxiosResponse, url: string): Promise<boolean> {
        if (response.status === 200) return true
        if (response.status === 401) {
            const refresh = await this.checkLogin()
            if (!refresh) {
                this.log('Weverse: failed to refresh token')
                return false
            }
            return true
        }
        this.log(`Weverse: API error @ ${url}. Status code ${response.status}`)
        return false
    }

    protected log(...vals: any): void {
        if (this.verbose) console.log(...vals)
    }

    public communityById(id: number): WeverseCommunity | null {
        return this._communityMap.get(id) ?? null
    }

    public post(id: number): WeversePost | null {
        return this._postsMap.get(id) ?? null
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