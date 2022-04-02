import { WeverseArtist, WeverseTab } from "."

export interface WeverseCommunityProps {
    id: number
    name: string
    description: string
    memberCount?: number
    homeBanner: URL
    icon: URL
    banner: URL
    fullName: string
    membersOnly: boolean
    artists: WeverseArtist[]
    tabs: WeverseTab[]
}

export class WeverseCommunity {
    info: WeverseCommunityProps
    constructor(props: WeverseCommunityProps) {
        this.info = props
    }
    public toString() {
        return this.info.name
    }
}