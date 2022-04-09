import { WeverseArtist, WeversePost } from "."
import { Community, Photo, Video } from "../types"
import { AssignType } from "../client"
import { WeverseMedia } from "./media"

export class WeverseCommunity extends AssignType<Community>() {
    newPosts: WeversePost[]
    artists: WeverseArtist[]
    artistMap: Map<number, WeverseArtist>
    posts: WeversePost[] = []
    postsMap: Map<number, WeversePost> = new Map<number, WeversePost>()
    photos: Photo[] = []
    videos: Video[] = []
    media: WeverseMedia[]
    mediaMap: Map<number, WeverseMedia>
    constructor(props: Community, test?: undefined) {
        super(props)
        this.artists = []
        this.artistMap = new Map<number, WeverseArtist>()
        this.newPosts = []
        this.media = []
        this.mediaMap = new Map<number, WeverseMedia>()
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

    public addPosts(posts: WeversePost[]) {
        this.newPosts = []
        posts.forEach(p => {
            if (!this.postsMap.has(p.id)) {
                this.posts.unshift(p)
                this.postsMap.set(p.id, p)
                this.newPosts.push(p)
            }
        })
        return this.newPosts
    }

    public addPhotos(photos: Photo[]) {
        const newPhotos: Photo[] = []
        for (const photo of photos) {
            if (!this.photos.find(p => p.id === photo.id)) {
                this.photos.unshift(photo)
                newPhotos.unshift(photo)
            }
        }
        return newPhotos
    }

    public addVideos(videos: Video[]) {
        const newVideos: Video[] = []
        for (const video of videos) {
            if (!this.videos.find(p => p.thumbnailUrl === video.thumbnailUrl)) {
                this.videos.unshift(video)
                newVideos.unshift(video)
            }
        }
        return newVideos
    }

    public addMedia(media: WeverseMedia) {
        if (this.mediaMap.has(media.id)) return null
        this.mediaMap.set(media.id, media)
        this.media.push(media)
        return media
    }

    public getArtist(id: number): WeverseArtist | undefined {
        return this.artistMap.get(id)
    }
    
    toJSON(): Partial<WeverseCommunity> {
        const partial: Partial<WeverseCommunity> = {...this}
        delete partial.artistMap
        delete partial.mediaMap
        delete partial.postsMap
        return partial
    }
}