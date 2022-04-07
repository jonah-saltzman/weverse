import { WeverseTab, WeverseCommunity, WeverseArtist, WeverseNotification, WeversePost, WeverseComment } from "../models";
import { WeverseMedia } from "../models/media";
import { WeverseTabProps, Community, Artist, Notification, Post, Comment, Media } from "../types";

// export function toCommunity(val: any): WeverseCommunity | null {
//     const props: Partial<WeverseCommunityProps> = {}

//     if (typeof val.id === 'number') props.id = val.id
//     else return null

//     if (typeof val.name === 'string') props.name = val.name
//     else return null

//     if (typeof val.description === 'string') props.description = val.description
//     else return null

//     if (
//         typeof val.memberCount === 'number' || 
//         val.memberCount === undefined
//         ) props.memberCount = val.memberCount
//     else return null

//     if (typeof val.homeBannerImgPath === 'string') props.homeBanner = new URL(val.homeBannerImgPath)
//     else return null

//     if (typeof val.iconImgPath === 'string') props.icon = new URL(val.iconImgPath)
//     else return null

//     if (typeof val.bannerImgPath === 'string') props.banner = new URL(val.bannerImgPath)
//     else return null

//     if (
//         Array.isArray(val.fullname) && 
//         (
//             typeof val.fullname[0] === 'string' || 
//             !val.fullname.length
//             )
//         ) props.fullName = val.fullname
//     else return null

//     if (typeof val.fcMember === 'boolean') props.membersOnly = val.fcMember
//     else return null

//     return new WeverseCommunity(props as WeverseCommunityProps)
// }

export function toCommunity(val: Community): WeverseCommunity {
    return new WeverseCommunity(val)
}

export function toArtist(val: Artist, community: WeverseCommunity): WeverseArtist {
    return new WeverseArtist(val, community)
}

export function toNotification(val: Notification, community: WeverseCommunity, artist?: WeverseArtist,): WeverseNotification {
    return new WeverseNotification(val, community, artist)
}

export function toPost(val: Post, community: WeverseCommunity, artist: WeverseArtist): WeversePost {
    return new WeversePost(val, community, artist)
}

export function toComment(val: Comment, post: WeversePost, artist: WeverseArtist): WeverseComment {
    return new WeverseComment(val, post, artist)
}

export function toMedia(val: Media, community: WeverseCommunity): WeverseMedia {
    return new WeverseMedia(val, community)
}

// convert api data to WeverseArtistProps
// export function toArtist(val: any): WeverseArtist | null {
//     const props: Partial<WeverseArtistProps> = {}

//     if (typeof val.artistId === 'number') props.artistId = val.artistId
//     else return null

//     if (typeof val.idInCommunity === 'number') props.idInCommunity = val.idInCommunity
//     else return null

//     if (typeof val.name === 'string') props.name = val.name
//     else return null

//     if (Array.isArray(val.altNames) && val.altNames.every((x: any) => typeof x === 'string')) props.altNames = val.altNames
//     else return null

//     if (typeof val.isOnline === 'boolean') props.isOnline = val.isOnline
//     else return null

//     if (typeof val.nickname === 'string') props.nickname = val.nickname
//     else return null

//     if (typeof val.profilePicImgPath === 'string') props.profilePic = new URL(val.profilePicImgPath)
//     else return null

//     if (typeof val.isBirthday === 'boolean') props.isBirthday = val.isBirthday
//     else return null

//     if (typeof val.groupName === 'string') props.groupName = val.groupName
//     else return null

//     if (typeof val.communityId === 'number') props.communityId = val.communityId
//     else return null

//     if (typeof val.isEnabled === 'boolean') props.isEnabled = val.isEnabled
//     else return null

//     if (typeof val.newPublicPost === 'boolean') props.newPublicPost = val.newPublicPost
//     else return null

//     if (typeof val.newPrivatePost === 'boolean') props.newPrivatePost = val.newPrivatePost
//     else return null

//     if (typeof val.lastPostId === 'number') props.lastPostId = val.lastPostId
//     else return null

//     if (typeof val.lastPostCreatedAt === 'string') props.lastPostCreatedAt = new Date(val.lastPostCreatedAt)
//     else return null

//     if (typeof val.lastPostExpiresAt === 'string') props.lastPostExpiresAt = new Date(val.lastPostExpiresAt)
//     else return null

//     if (typeof val.birthdayImgPath === 'string') props.birthdayImgUrl = new URL(val.birthdayImgPath)
//     else return null

//     return new WeverseArtist(props as WeverseArtistProps)
// }

// convert api data to WeverseTabProps
export function toTab(val: any): WeverseTab | null {
    const props: Partial<WeverseTabProps> = {}

    if (typeof val.id === 'number') props.id = val.id
    else return null

    if (typeof val.name === 'string') props.name = val.name
    else return null

    return new WeverseTab(props as WeverseTabProps)
}