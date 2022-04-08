import { AssignType } from "../client"
import { Artist } from "../types"
import { WeverseCommunity } from "./community"

type PartialArtist = Partial<WeverseArtist>

export class WeverseArtist extends AssignType<Artist>() {
    community: WeverseCommunity
    constructor(props: Artist, community: WeverseCommunity) {
        super(props)
        this.community = community
    }
    toJSON(): PartialArtist {
        const partial: PartialArtist = {...this}
        delete partial.community
        return partial
    }
}