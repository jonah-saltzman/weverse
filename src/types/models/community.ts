import { WeverseArtist, WeverseTab, AssignType } from "."

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

export class WeverseCommunity extends AssignType<WeverseCommunityProps>() {
    constructor(props: WeverseCommunityProps) {
        super(props)
    }
    public toString() {
        return this.name
    }
}