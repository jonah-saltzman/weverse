import { AssignType } from "../client"
import { Artist } from "../types"
import { WeverseCommunity } from "./community"

export class WeverseArtist extends AssignType<Artist>() {
    community: WeverseCommunity
    constructor(props: Artist, community: WeverseCommunity) {
        super(props)
        this.community = community
    }
}