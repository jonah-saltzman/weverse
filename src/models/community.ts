import { WeverseArtist, WeverseTab } from "."
import { Community } from "../types"
import { AssignType } from "../client"

export class WeverseCommunity extends AssignType<Community>() {
    artists: WeverseArtist[] | null
    tabs: WeverseTab[] | null
    constructor(props: Community) {
        super(props)
        this.artists = null
        this.tabs = null
    }
    public toString() {
        return this.name
    }
    public addArtistsTabs(artists?: WeverseArtist[], tabs?: WeverseTab[]): void {
        if (artists) this.artists = artists
        if (tabs) this.tabs = tabs
    }
}