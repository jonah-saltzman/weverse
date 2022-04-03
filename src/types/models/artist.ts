import { AssignType, WeverseCommunity } from "."

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

export class WeverseArtist extends AssignType<WeverseArtistProps>() {
    constructor(props: WeverseArtistProps) {
        super(props)
    }
}