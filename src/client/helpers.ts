import path from 'path'
import fs from 'fs'
import NodeRSA from 'node-rsa'
import { WeverseLoginPayloadInterface, WeversePasswordAuthorization, WeverseAuthorization, WeverseTokenAuthorization, WeverseOauthCredentials, WeverseRefreshPayload, WeverseCommunityProps } from '../types'

export function readKey(): string | null {
    try {
        return fs.readFileSync(path.join(__dirname, './publicCert.txt'), 'utf-8')
    } catch(e) {
        console.log('Weverse: ', e)
        return null
    }
}

export function encryptPassword(pass: string, pubKey: string | null): string | null {
    if (!pubKey) return null
    const key = new NodeRSA()
    key.importKey(pubKey, 'public')
    const enc = key.encrypt(Buffer.from(pass))
    return enc.toString('base64')
}

export const validateStatus = (status: number) => status >= 200 && status < 500

export function createLoginPayload(credentials: WeversePasswordAuthorization): WeverseLoginPayloadInterface {
    const publicKey = readKey()
    const encryptedPassword = encryptPassword(credentials.password, publicKey)
    if (encryptedPassword === null) throw 'Error encrypting Weverse password'
    return {
        username: credentials.username,
        password: encryptedPassword,
        grant_type: 'password',
        client_id: 'weverse-test'
    }
}

export function createRefreshPayload(credentials: WeverseOauthCredentials): WeverseRefreshPayload {
    return {
        refresh_token: credentials.refresh_token,
        grant_type: 'refresh_token',
        client_id: 'weverse-test'
    }
}

export function isWeversePasswordAuthorization(
    val: WeverseAuthorization
    ): val is WeversePasswordAuthorization 
    {
        return (val as WeverseTokenAuthorization).token === undefined && 
        typeof (val as WeversePasswordAuthorization).password === 'string' && 
        typeof (val as WeversePasswordAuthorization).username === 'string'
}

export function AssignType<T extends object>() {
    return class {
        constructor(t: T) {
            Object.assign(this, t)
        }
    } as { new(t: T): T }
}