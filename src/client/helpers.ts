import path from 'path'
import fs from 'fs'
import NodeRSA from 'node-rsa'
import { WeverseLoginPayloadInterface, WeversePasswordAuthorization, WeverseAuthorization, WeverseTokenAuthorization } from '../types'

export function readKey(): string | null {
    try {
        console.log(path.join(__dirname, './publicCert.txt'))
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

export class WeverseLoginPayload implements WeverseLoginPayloadInterface {
    grant_type: 'password'
    client_id: 'weverse-test'
    username: string
    password: string
    constructor(credentials: WeversePasswordAuthorization) {
        const publicKey = readKey()
        const encryptedPassword = encryptPassword(credentials.password, publicKey)
        if (encryptedPassword === null) throw 'Error encrypting Weverse password'
        this.username = credentials.username
        this.password = encryptedPassword
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
        return (val as WeverseTokenAuthorization).token === undefined && 
        typeof (val as WeversePasswordAuthorization).password === 'string' && 
        typeof (val as WeversePasswordAuthorization).username === 'string'
}
