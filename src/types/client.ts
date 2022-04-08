
export interface WeverseClientSettings {
    verbose: boolean
    authorization: WeversePasswordAuthorization | WeverseTokenAuthorization
}

export interface WeversePasswordAuthorization {
    username: string
    password: string
}

export interface WeverseTokenAuthorization {
    token: string
}

export type WeverseAuthorization = WeversePasswordAuthorization | WeverseTokenAuthorization

export interface WeverseLoginPayloadInterface {
    grant_type: 'password'
    client_id: 'weverse-test'
    username: string
    password: string
}

export interface WeverseRefreshPayload {
    grant_type: 'refresh_token',
    client_id: 'weverse-test',
    refresh_token: string
}

export type WeverseOauthCredentials = {
    access_token: string
    token_type: 'bearer'
    expires_in: number
    refresh_token: string
    weMemberId: number
}

export interface WeverseInitOptions {
    allPosts?: boolean
    allNotifications?: boolean
    media?: boolean
}

export interface GetOptions {
    init: boolean
}

export type WvHeaders = {[key: string]: string} | undefined

export interface ListenOptions {
    listen: boolean,
    interval?: number
}