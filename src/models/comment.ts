import { AssignType } from "../client"
import { Comment } from "../types"
import { WeversePost, WeverseArtist } from "."

export class WeverseComment extends AssignType<Comment>() {
    artist: WeverseArtist
    post: WeversePost
    constructor(props: Comment, post: WeversePost, artist: WeverseArtist) {
        super(props)
        this.artist = artist
        this.post = post
    }
}