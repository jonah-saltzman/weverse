import { AssignType } from "../client"
import { Artist } from "../types"

export class WeverseArtist extends AssignType<Artist>() {
    constructor(props: Artist) {
        super(props)
    }
}