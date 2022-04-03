import { AssignType } from "."

export interface WeverseTabProps {
    id?: number
    name?: string
}

export class WeverseTab extends AssignType<WeverseTabProps>() {
    constructor(props: WeverseTabProps) {
        super(props)
    }
    public toString(): string {
        return this.name ?? 'UNNAMED TAB'
    }
}