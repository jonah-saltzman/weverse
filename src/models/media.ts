import { AssignType } from "../client"
import { Media } from "../types"
import { WeverseCommunity } from "."

export class WeverseMedia extends AssignType<Media>() {
    community: WeverseCommunity
    constructor(props: Media, community: WeverseCommunity) {
        super(props)
        this.community = community
    }
}