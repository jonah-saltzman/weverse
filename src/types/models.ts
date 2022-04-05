import { WeverseCommunity, WeverseArtist, WeverseTab } from "../models"

export interface WeverseArtistProps {
    id: number
    idInCommunity: number
    name: string
    altNames: string[]
    isOnline: boolean
    nickname: string
    profilePic: URL
    isBirthday: boolean
    groupName: string
    maxComments: number
    communityId: number
    isEnabled: boolean
    newPublicPost: boolean
    newPrivatePost: boolean
    lastPostId: number
    lastPostCreatedAt: Date
    lastPostExpiresAt: Date
    birthdayImgUrl: URL
    community: WeverseCommunity
    //posts: Post[]
}

export interface WeverseCommunityProps {
    id: number
    name: string
    description: string
    memberCount?: number
    homeBanner: URL
    icon: URL
    banner: URL
    fullName: string[]
    membersOnly: boolean
}

export interface WeverseNotificationProps {
    id: number
    message: string
    boldElement: string
    communityId: number
    communityName: string
    contentsType: string
    contentsId: number
    notifiedTime: Date
    iconUrl: URL
    thumbnailUrl: URL
    artistId: number
    membersOnly: boolean
    webOnly: boolean
    platform: string
}

export interface WeverseTabProps {
    id?: number
    name?: string
}