import { 
    WeverseTab, WeverseCommunity,
    WeverseArtist, WeverseNotification,
    WeversePost, WeverseComment } from "../models";

import { WeverseMedia } from "../models/media";

import { 
    WeverseTabProps, Community,
    Artist, Notification, Post,
    Comment, Media } from "../types";

export function toCommunity(val: Community): WeverseCommunity {
    return new WeverseCommunity(val)
}

export function toArtist(val: Artist, community: WeverseCommunity): WeverseArtist {
    return new WeverseArtist(val, community)
}

export function toNotification(val: Notification, community: WeverseCommunity, artist?: WeverseArtist,): WeverseNotification {
    return new WeverseNotification(val, community, artist)
}

export function toPost(val: Post, community: WeverseCommunity, artist: WeverseArtist): WeversePost {
    return new WeversePost(val, community, artist)
}

export function toComment(val: Comment, post: WeversePost, artist: WeverseArtist): WeverseComment {
    return new WeverseComment(val, post, artist)
}

export function toMedia(val: Media, community: WeverseCommunity): WeverseMedia {
    return new WeverseMedia(val, community)
}

export function toTab(val: any): WeverseTab | null {
    const props: Partial<WeverseTabProps> = {}

    if (typeof val.id === 'number') props.id = val.id
    else return null

    if (typeof val.name === 'string') props.name = val.name
    else return null

    return new WeverseTab(props as WeverseTabProps)
}