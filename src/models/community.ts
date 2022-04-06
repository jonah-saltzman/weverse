import { WeverseArtist, WeverseTab } from "."
import { Community } from "../types"
import { AssignType } from "../client"

export class WeverseCommunity extends AssignType<Community>() {
    artists: WeverseArtist[]
    artistMap: Map<number, WeverseArtist>
    tabs: WeverseTab[]
    tabMap: Map<number, WeverseTab>
    constructor(props: Community) {
        super(props)
        this.artists = []
        this.artistMap = new Map<number, WeverseArtist>()
        this.tabs = []
        this.tabMap = new Map<number, WeverseTab>()
    }
    public toString() {
        return this.name
    }
    public addArtists(artists: WeverseArtist[]) {
        this.artists = artists
        this.artistMap = new Map<number, WeverseArtist>()
        for (const artist of artists) {
            this.artistMap.set(artist.id, artist)
        }
    }
    // public addArtistsTabs(artists?: WeverseArtist[], tabs?: WeverseTab[]): void {
    //     if (artists) this.artists = artists
    //     if (tabs) this.tabs = tabs
    // }
}