import { AssignType } from "../client"
import { Notification } from "../types"
import { WeverseCommunity, WeverseArtist } from "."

export class WeverseNotification extends AssignType<Notification>() {
    community: WeverseCommunity
    artist?: WeverseArtist
    constructor(props: Notification, community: WeverseCommunity, artist?: WeverseArtist) {
        super(props)
        this.artist = artist ?? undefined
        this.community = community
    }
}

export class ClientNotifications {
    public all: WeverseNotification[] = []
    public new: WeverseNotification[] = []
    public allMap: Map<number, WeverseNotification> = new Map<number, WeverseNotification>()
    public get(id: number): WeverseNotification | undefined {
        return this.allMap.get(id)
    }
    public addMany(notifications: WeverseNotification[]): void {
        this.all.push(...notifications)
        this.new = notifications
        notifications.forEach(n => this.allMap.set(n.id, n))
    }
}