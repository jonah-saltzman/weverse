
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

export type WeverseOauthCredentials = {
    access_token: string
    token_type: 'bearer'
    expires_in: number
    refresh_token: string
    weMemberId: number
}