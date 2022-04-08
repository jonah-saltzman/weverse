import { AssignType } from "../client"
import { Media } from "../types"
import { WeverseCommunity } from "."

export class WeverseMedia extends AssignType<Media>() {
    community: WeverseCommunity
    constructor(props: Media, community: WeverseCommunity) {
        super(props)
        this.community = community
    }
    toJSON(): Partial<WeverseMedia> {
        const partial: Partial<WeverseMedia> = {...this}
        delete partial.community
        return partial
    }
}