export * from './notification'
export * from './artist'
export * from './community'
export * from './tab'

export function AssignType<T extends object>() {
    return class {
        constructor(t: T) {
            Object.assign(this, t)
        }
    } as { new(t: T): T }
}