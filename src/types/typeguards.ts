import { WeverseOauthCredentials } from "."

export const isWeverseLogin = (res: any): res is WeverseOauthCredentials => {
    //console.log(res)
    return res.access_token && typeof res.access_token === 'string' &&
    res.token_type && res.token_type === 'bearer' &&
    typeof res.expires_in === 'number' &&
    res.refresh_token && typeof res.refresh_token === 'string' &&
    res.weMemberId && typeof res.weMemberId === 'number'
}

// export interface WeverseCommunityProps {
//     id: number
//     name: string
//     description: string
//     memberCount?: number
//     homeBanner: URL
//     icon: URL
//     banner: URL
//     fullName: string
//     membersOnly: boolean
// }