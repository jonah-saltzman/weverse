import path from 'path'
import fs from 'fs'
import NodeRSA from 'node-rsa'

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