import { WeverseOauthCredentials } from "."

export const isWeverseLogin = (res: any): res is WeverseOauthCredentials => {
    //console.log(res)
    return res.access_token && typeof res.access_token === 'string' &&
    res.token_type && res.token_type === 'bearer' &&
    typeof res.expires_in === 'number' &&
    res.refresh_token && typeof res.refresh_token === 'string' &&
    res.weMemberId && typeof res.weMemberId === 'number'
}

type TypeGuard<T> = (val: unknown) => T
type TypeConverter<T, U> = (val: T) => U
type OptionalConverter<T, U> = (val: T) => U | undefined

const string: TypeGuard<string> = (val: unknown) => {
    if (typeof val !== 'string') throw new Error()
    return val
}

const optionalString: TypeGuard<string | undefined> = (val: unknown) => {
    if (val === undefined || typeof val === 'string') return val
    throw new Error()
}

const boolean: TypeGuard<boolean> = (val: unknown) => {
    if (typeof val !== 'boolean') throw new Error()
    return val
}

const number: TypeGuard<number> = (val: unknown) => {
    if (typeof val !== 'number') throw new Error()
    return val
}

const optionalNumber: TypeGuard<number | undefined> = (val: unknown) => {
    if (val === undefined || typeof val === 'number') return val
    throw new Error()
}

const url: TypeConverter<string, URL> = (val: unknown) => {
    if (typeof val !== 'string') throw new Error()
    return new URL(val)
}

const date: TypeConverter<string, Date> = (val: unknown) => {
    if (typeof val !== 'string') throw new Error()
    return new Date(val)
}

const optionalDate: TypeConverter<string | undefined, Date | undefined> = (val: unknown) => {
    if (typeof val === 'string') return date(val)
    return undefined
    throw new Error()
}

const array = <T>(inner: TypeGuard<T>) => (val: unknown): T[] => {
    if (!Array.isArray(val)) throw new Error();
    return val.map(inner);
}

const object = <T extends Record<string, TypeGuard<any> | TypeConverter<any, any>>>(inner: T) => {
    return (val: unknown): { [P in keyof T]: ReturnType<T[P]> } => {
        if (val === null || typeof val !== 'object') throw new Error();

        const out: { [P in keyof T]: ReturnType<T[P]> } = {} as any;

        for (const k in inner) {
            out[k] = inner[k]((val as any)[k])
        }

        return out
    }
}

export const Community = object({
    id: number,
    name: string,
    description: string,
    memberCount: number,
    homeBannerImgPath: url,
    iconImgPath: url,
    bannerImgPath: url,
    fullname: array(string),
    fcMember: boolean,
    membershipName: optionalString,
})
export const CommunityArray = array(Community)

export type Community = ReturnType<typeof Community>
export type CommunityArray = Community[]

export const Artist = object({
    id: number,
    communityUserId: number,
    name: string,
    listName: array(string),
    profileNickName: string,
    profileImgPath: url,
    profileUploadImgPath: url,
    isBirthday: boolean,
    groupName: string,
    communityId: number,
    hasNewToFans: boolean,
    hasNewPrivateToFans: boolean,
    toFanLastId: optionalNumber,
    toFanLastCreatedAt: optionalDate,
    birthdayImgUrl: url,
})
export const ArtistArray = array(Artist)

export type Artist = ReturnType<typeof Artist>
export type ArtistArray = Artist[]

// {
//     communityId: 14,
//     isEnabled: true,
//     hasNewToFans: false,
//     hasNewPrivateToFans: false,
//     toFanLastId: 1687778027996520,
//     toFanLastCreatedAt: '2022-03-26T00:05:30+09:00',
//     toFanLastExpireIn: 0,
//     nameI18n: "[I18nElement{languageCode='en', value='JI U'}, I18nElement{languageCode='ja', value='ジユ'}]",
//     birthdayImgUrl: 'https://cdn-contents-web.weverse.io/admin/82f3bc8484424bb09959927e1160a2e2983.png'
//   },