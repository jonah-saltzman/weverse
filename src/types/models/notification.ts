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

export class WeverseNotification {
    info: WeverseNotificationProps
    constructor(props: WeverseNotificationProps) {
        this.info = props
    }
    public get id(): number {
        return this.info.id
    }
}