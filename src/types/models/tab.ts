export interface WeverseTabProps {
    id?: number
    name?: string
}

export class WeverseTab {
    info: WeverseTabProps
    constructor(props: WeverseTabProps) {
        this.info = props
    }
    public toString(): string {
        return this.info.name ?? 'UNNAMED TAB'
    }
}