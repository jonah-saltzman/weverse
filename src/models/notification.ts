import { AssignType } from "."
import { WeverseNotificationProps } from "../types"

export class WeverseNotification extends AssignType<WeverseNotificationProps>() {
    constructor(props: WeverseNotificationProps) {
        super(props)
    }
    public get id(): number {
        return this.id
    }
}