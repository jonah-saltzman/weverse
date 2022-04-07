import { AssignType, WeverseUrl as urls } from "../client";
import { Post, WvHeaders } from "../types";
import { WeverseCommunity, WeverseArtist } from ".";
import axios from 'axios'
import { WeverseComment } from "./comment";

export class WeversePost extends AssignType<Post>() {
    artist: WeverseArtist
    community: WeverseCommunity
    comments: WeverseComment[] = []
    constructor(props: Post, community: WeverseCommunity, artist: WeverseArtist) {
        super(props)
        this.artist = artist
        this.community = community
    }
    public async getVideoUrls(headers: WvHeaders): Promise<void> {
        if (this.attachedVideos) {
            const { data } = await axios.post(
                urls.postDetails(this.id, this.community.id),
                {}, 
                { headers }
            )
            if (typeof data.attachedVideos[0].videoUrl === 'string') {
                this.attachedVideos[0].videoUrl = new URL(data.attachedVideos[0].videoUrl)
            }
        } else {
            return
        }
    }

    public addComments(comments: WeverseComment[]) {
        this.comments = comments.filter(c => !this.comments.some(c2 => c2.id === c.id)).concat(this.comments)
    }
}