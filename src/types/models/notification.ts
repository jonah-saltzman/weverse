import { AssignType } from "."

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

export class WeverseNotification extends AssignType<WeverseNotificationProps>() {
    constructor(props: WeverseNotificationProps) {
        super(props)
    }
    public get id(): number {
        return this.id
    }
}