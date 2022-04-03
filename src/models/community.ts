import { AssignType } from "."
import { WeverseCommunityProps } from "../types"

export class WeverseCommunity extends AssignType<WeverseCommunityProps>() {
    constructor(props: WeverseCommunityProps) {
        super(props)
    }
    public toString() {
        return this.name
    }
}