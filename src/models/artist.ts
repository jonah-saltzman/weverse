import { AssignType } from "../client"
import { WeverseArtistProps } from "../types"

export class WeverseArtist extends AssignType<WeverseArtistProps>() {
    constructor(props: WeverseArtistProps) {
        super(props)
    }
}