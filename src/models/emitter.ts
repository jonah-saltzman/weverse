import { WeverseNotification, WeversePost, WeverseMedia, WeverseComment } from "."

export type WeverseEvents = {
    error: (error: Error) => void,
    init: (initialized: boolean) => void,
    notification: (notification: WeverseNotification) => void,
    post: (post: WeversePost) => void,
    media: (media: WeverseMedia) => void,
    comment: (comment: WeverseComment, post: WeversePost) => void
    login: (result: boolean) => void,
    poll: (status: boolean) => void
}

