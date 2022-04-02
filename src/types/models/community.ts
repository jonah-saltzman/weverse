import { Artist } from "./artist"

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
    artists: Artist[]
    //todo: tabs: Tab[]
}

export class Community {
    info: WeverseCommunityProps
    constructor(props: WeverseCommunityProps) {
        this.info = props
    }
}