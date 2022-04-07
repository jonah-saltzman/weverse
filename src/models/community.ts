import { WeverseArtist, WeverseTab, WeversePost } from "."
import { Community, Photo, Video } from "../types"
import { AssignType } from "../client"

export class WeverseCommunity extends AssignType<Community>() {
    newPosts: WeversePost[]
    artists: WeverseArtist[]
    artistMap: Map<number, WeverseArtist>
    tabs: WeverseTab[]
    tabMap: Map<number, WeverseTab>
    posts: WeversePost[] = []
    postsMap: Map<number, WeversePost> = new Map<number, WeversePost>()
    photos: Photo[] = []
    videos: Video[] = []
    constructor(props: Community) {
        super(props)
        this.artists = []
        this.artistMap = new Map<number, WeverseArtist>()
        this.tabs = []
        this.tabMap = new Map<number, WeverseTab>()
        this.newPosts = []
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


    public getArtist(id: number): WeverseArtist | undefined {
        return this.artistMap.get(id)
    }
    // public addArtistsTabs(artists?: WeverseArtist[], tabs?: WeverseTab[]): void {
    //     if (artists) this.artists = artists
    //     if (tabs) this.tabs = tabs
    // }
}