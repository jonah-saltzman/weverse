export interface WeverseNotification {
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