import { AssignType } from "../client"
import { WeverseTabProps } from "../types"

export class WeverseTab extends AssignType<WeverseTabProps>() {
    constructor(props: WeverseTabProps) {
        super(props)
    }
    public toString(): string {
        return this.name ?? 'UNNAMED TAB'
    }
}