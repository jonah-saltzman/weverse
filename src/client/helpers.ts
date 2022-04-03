import path from 'path'
import fs from 'fs'
import NodeRSA from 'node-rsa'
import { WeverseLoginPayloadInterface, WeversePasswordAuthorization, WeverseAuthorization, WeverseTokenAuthorization, WeverseOauthCredentials } from '../types'
import { AxiosResponse, responseEncoding } from 'axios'

function readKey(): string {
    return fs.readFileSync(path.join(__dirname, './publicCert.txt'), 'utf-8')
}

export function encryptPassword(pass: string): string {
    const publicKey = readKey()
    const key = new NodeRSA()
    key.importKey(publicKey, 'public')
    const enc = key.encrypt(Buffer.from(pass))
    return enc.toString('base64')
}

export const validateStatus = (status: number) => status >= 200 && status < 500

export class WeverseLoginPayload implements WeverseLoginPayloadInterface {
    grant_type: 'password'
    client_id: 'weverse-test'
    username: string
    password: string
    constructor(credentials: WeversePasswordAuthorization) {
        this.username = credentials.username
        this.password = encryptPassword(credentials.password)
        this.client_id = 'weverse-test'
        this.grant_type = 'password'
    }
    public get payload(): WeverseLoginPayloadInterface {
        return {
            grant_type: this.grant_type,
            client_id: this.client_id,
            username: this.username,
            password: this.password
        }
    }
}

export function isWeversePasswordAuthorization(
    val: WeverseAuthorization
    ): val is WeversePasswordAuthorization 
    {
        return (val as WeverseTokenAuthorization).token === undefined
}
