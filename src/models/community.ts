import { AssignType, WeverseArtist, WeverseTab } from "."
import { WeverseCommunityProps } from "../types"

export class WeverseCommunity extends AssignType<WeverseCommunityProps>() {
    artists: WeverseArtist[]
    tabs: WeverseTab[]
    constructor(props: WeverseCommunityProps) {
        super(props)
        this.artists = []
        this.tabs = []
    }
    public toString() {
        return this.name
    }
    public addArtistsTabs(artists?: WeverseArtist[], tabs?: WeverseTab[]): void {
        if (artists) this.artists = this.artists.concat(artists)
        if (tabs) this.tabs = this.tabs.concat(tabs)
    }
}