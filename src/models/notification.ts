import { AssignType } from "../client"
import { NotifContentKeys, Notification } from "../types"
import { WeverseCommunity, WeverseArtist } from "."

export class WeverseNotification extends AssignType<Notification>() {
    community: WeverseCommunity
    artist?: WeverseArtist
    type?: NotifContentKeys
    constructor(props: Notification, community: WeverseCommunity, artist?: WeverseArtist) {
        super(props)
        this.artist = artist ?? undefined
        this.community = community
    }
    toJSON(): Partial<WeverseNotification> {
        const partial: Partial<WeverseNotification> = {...this}
        delete partial.community
        delete partial.artist
        return partial
    }
}

export class ClientNotifications {
    public all: WeverseNotification[] = []
    public new: WeverseNotification[] = []
    public allMap: Map<number, WeverseNotification> = new Map<number, WeverseNotification>()
    public get(id: number): WeverseNotification | undefined {
        return this.allMap.get(id)
    }
    public addMany(notifications: WeverseNotification[]): WeverseNotification[] {
        this.new = []
        notifications.forEach(n => {
            if (!this.allMap.has(n.id)) {
                this.all.push(n)
                this.allMap.set(n.id, n)
                this.new.push(n)
            }
        })
        return this.new
    }
}