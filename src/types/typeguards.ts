import { WeverseOauthCredentials } from "."
import { WeverseNotification, WeversePost } from "../models"

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
    if (val === undefined) return new URL('https://PLACEHOLDER.weverse.com')
    if (typeof val !== 'string') throw new Error()
    return new URL(val)
}

const toNum: TypeConverter<string, number> = (val: string) => {
    if (typeof val !== 'string') throw new Error()
    return Number(val)
}

const date: TypeConverter<string, Date> = (val: unknown) => {
    if (typeof val !== 'string') throw new Error()
    return new Date(val)
}

const optionalDate: TypeConverter<string | undefined, Date | undefined> = (val: unknown) => {
    if (typeof val === 'string') return date(val)
    return undefined
}

const array = <T>(inner: TypeGuard<T>) => (val: unknown): T[] => {
    if (!Array.isArray(val)) throw new Error();
    return val.map(inner);
}

const notif: TypeConverter<string, NotifType> = (val: unknown) => {
    if (typeof val !== 'string') throw new Error()
    if (isNotif(val)) return val as NotifType
    throw new Error()
}

const isNotif = (val: string): val is NotifType => {
    for (const [k, v] of Object.entries(NotificationType)) {
        if (v === val) return true
    }
    return false
}

const optional = <T>(inner: TypeGuard<T>) => (val: unknown): T | undefined => {
    if (val === undefined) return undefined
    return inner(val)
}

// const optionalConverter = <T, U>(inner: TypeConverter<T, U>) => (val: unknown): U | undefined => {
//     if (val === undefined) return undefined
//     return inner(val)
// }

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
    membershipName: optional(string),
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
    toFanLastId: optional(number),
    toFanLastCreatedAt: optionalDate,
    birthdayImgUrl: url,
})
export const ArtistArray = array(Artist)

export type Artist = ReturnType<typeof Artist>
export type ArtistArray = Artist[]

export enum NotificationType {
    MEDIA = 'MEDIA',
    SERVICE = 'SERVICE_NOTICE',
    FANS = 'TO_FANS',
    POST = 'ARTIST_POST',
    FAN_REPLY = 'COMMENT_DETAIL'
}

type NotifType = NotificationType

export const ExtraInfo = object({
    replyCommentId: toNum,
    originContentId: toNum,
    originContentType: notif,
})

type Info = ReturnType<typeof ExtraInfo>

const isInfo = (val: unknown): val is Info => {
    try {
        ExtraInfo(val)
        return true
    } catch {
        return false
    }
}

type Empty = Record<any, never>

export const optionalObject: TypeGuard<Info | Empty> = (val: unknown) => {
    if (typeof val !== 'object') throw new Error()
    if (isInfo(val)) return val
    if (val === null) return {}
    if (Object.keys(val).length !== 0) throw new Error()
    return {}
}

export const Notification = object({
    id: number,
    message: string,
    boldElement: string,
    communityId: number,
    communityName: string,
    contentsExtraInfo: optionalObject,
    contentsType: notif,
    contentsId: number,
    notifiedAt: date,
    iconImageUrl: url,
    artistId: optional(number),
    isMembershipContent: boolean,
    isWebOnly: boolean,
    platform: string,
})

export const NotificationArray = array(Notification)
export type Notification = ReturnType<typeof Notification>
export type NotificationArray = Notification[]

export const isNotification = (n: WeverseNotification | undefined): n is WeverseNotification => {
    return !!n
}

export const Photo = object({
    postId: number,
    imgUrl: url,
    imgWidth: number,
    imgHeight: number,
    id: number,
    contentIndex: number,
    thumbnailImgUrl: url,
    thumbnailImgWidth: number,
    thumbnailImgHeight: number,
    orgImgUrl: url,
    orgImgWidth: number,
    orgImgHeight: number,
    downloadImgFilename: string,
    isGif: boolean
})

export const Video = object({
    //id: number,
    videoUrl: url,
    thumbnailUrl: url,
    thumbnailWidth: number,
    thumbnailHeight: number,
    playTime: number
})

export const Post = object({
    id: number,
    communityUser: object({
        artistId: number,
        communityId: number,
    }),
    communityTabId: number,
    body: string,
    // artistComments
    commentCount: number,
    likeCount: number,
    createdAt: date,
    updatedAt: date,
    photos: optional(array(Photo)),
    attachedVideos: optional(array(Video)),
})

export const PostArray = array(Post)
export type Post = ReturnType<typeof Post>
export type PostArray = Post[]

export const isPost = (n: WeversePost | undefined): n is WeversePost => {
    return !!n
}
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