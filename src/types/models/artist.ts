import { Community } from "./community"

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
    community: Community
    //posts: Post[]
}

export class Artist {
    info: WeverseArtistProps
    constructor(props: WeverseArtistProps) {
        this.info = props
    }
}