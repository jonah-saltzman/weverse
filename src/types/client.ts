
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