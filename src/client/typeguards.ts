import { WeverseOauthCredentials } from "../types"

export const validateWeverseLogin = (res: any): res is WeverseOauthCredentials => {
    //console.log(res)
    return res.access_token && typeof res.access_token === 'string' &&
    res.token_type && res.token_type === 'bearer' &&
    res.expires_in && typeof res.expires_in === 'number' &&
    res.refresh_token && typeof res.refresh_token === 'string' &&
    res.weMemberId && typeof res.weMemberId === 'number'
}