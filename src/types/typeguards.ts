import { WeverseOauthCredentials } from "."
import { WeverseComment, WeverseNotification, WeversePost } from "../models"

export const isWeverseLogin = (res: any): res is WeverseOauthCredentials => {
    return res.access_token && typeof res.access_token === 'string' &&
    res.token_type && res.token_type === 'bearer' &&
    typeof res.expires_in === 'number' &&
    res.refresh_token && typeof res.refresh_token === 'string' &&
    res.weMemberId && typeof res.weMemberId === 'number'
}

type TypeGuard<T> = (val: unknown) => T
type TypeConverter<T, U> = (val: T) => U
type OptionalConverter<T, U> = (val: T) => U | undefined

const optToNum: OptionalConverter<string, number> = (val: unknown) => {
    if (val === undefined || typeof val === 'undefined') return val
    if (typeof val !== 'string') throw new Error()
    return Number(val)
}

const optNotif: OptionalConverter<string, NotifType> = (val: unknown) => {
    if (val === undefined || typeof val === 'undefined') return val
    if (typeof val !== 'string') throw new Error()
    if (isNotif(val)) return val as NotifType
    throw new Error()
}

const string: TypeGuard<string> = (val: unknown) => {
    if (typeof val !== 'string') throw new Error()
    return val
}

const mediaType: TypeGuard<MediaTypes> = (val: unknown) => {
    if (typeof val !== 'string') throw new Error()
    if (val === 'VIDEO' || val === 'PHOTO') return val
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

const url: TypeConverter<string, URL> = (val: unknown) => {
    if (val === undefined) return new URL('https://PLACEHOLDER.weverse.com')
    if (typeof val !== 'string') throw new Error()
    return new URL(val)
}

const toNum: TypeConverter<string, number> = (val: string) => {
    console.log(`converting: `, val)
    if (typeof val !== 'string') throw new Error()
    return Number(val)
}

const date: TypeConverter<string, Date> = (val: unknown): Date => {
    if (typeof val !== 'string') throw new Error()
    return new Date(val)
}

const optionalUrl: TypeConverter<any, URL | undefined> = (val: unknown): URL | undefined => {
    if (typeof val === 'undefined') return undefined
    if (typeof val === 'string') return new URL(val)
    throw new Error()
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

const object = <T extends Record<string, OptionalConverter<any, any> | TypeGuard<any> | TypeConverter<any, any>>>(inner: T) => {
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
    FAN_REPLY = 'COMMENT_DETAIL',
    NOTICE = 'NOTICE',
    O_POST = 'POST'
}

type NotifType = NotificationType

export const ExtraInfo = object({
    replyCommentId: toNum,
    originContentId: toNum,
    originContentType: notif,
})

type Info = ReturnType<typeof ExtraInfo>

// const isInfo = (val: unknown): val is Info => {
//     try {
//         ExtraInfo(val)
//         return true
//     } catch {
//         return false
//     }
// }

export const Notification = object({
    id: number,
    message: string,
    boldElement: string,
    communityId: number,
    communityName: string,
    contentsExtraInfo: object({
        replyCommentId: optToNum,
        originContentId: optToNum,
        originContentType: optNotif
    }),
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
    mediaId: optional(number),
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
    id: optional(number),
    videoUrl: url,
    thumbnailUrl: url,
    thumbnailWidth: number,
    thumbnailHeight: number,
    playTime: number
})

export const artistInfo = object({
    artistId: number,
    communityId: number,
})

export const Comment = object({
    id: number,
    body: string,
    commentCount: number,
    likeCount: number,
    postId: number,
    createdAt: date,
    updatedAt: date,
    communityUser: artistInfo
})

export const Post = object({
    id: number,
    communityUser: artistInfo,
    communityTabId: number,
    body: optional(string),
    artistComments: array(Comment),
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

export const PhotoArray = array(Photo)
export type Photo = ReturnType<typeof Photo>
export type PhotoArray = Photo[]

export type Video = ReturnType<typeof Video>

export const isPost = (n: WeversePost | undefined): n is WeversePost => {
    return !!n
}

export const isComment = (c: WeverseComment | undefined): c is WeverseComment => {
    return !!c
}

export const Media = object({
    id: number,
    communityId: number,
    body: string,
    type: mediaType,
    thumbnailPath: url,
    title: string,
    extVideoPath: optionalUrl,
    youtubeId: optional(string),
    likeCount: number,
    playCount: number,
    commentCount: number,
    createdAt: date,
    updatedAt: date,
    photos: array(Photo)
})

export const MediaArray = array(Media)
export type Media = ReturnType<typeof Media>
export type MediaArray = Media[]

export type MediaTypes = 'PHOTO' | 'VIDEO'

export type NotifContentKeys = 'COMMENT' | 'POST' | 'MEDIA' | 'ANNOUNCEMENT'
export type NotifContentType = {
    [key in NotifContentKeys]: string[]
}
export const CommentArray = array(Comment)
export type Comment = ReturnType<typeof Comment>
export type CommentArray = Comment[]

export const NotifContent: NotifContentType = {
    COMMENT: ["commented on", "replied to", "포스트에 댓글을 작성했습니다", "답글을 작성했습니다."],
    POST: [
        "님이 포스트를 작성했습니다", "created a new post!", "shared a moment with you", "모먼트가 도착했습니다"
    ],
    MEDIA: ["Check out the new media", "새로운 미디어"],
    ANNOUNCEMENT: ["New announcement", "NOTICE:", "(광고)", "(AD)"]
}

export enum NotifKeys {
    COMMENT = 'COMMENT',
    POST = 'POST',
    MEDIA = 'MEDIA',
    ANNOUNCEMENT = 'ANNOUNCEMENT'
}