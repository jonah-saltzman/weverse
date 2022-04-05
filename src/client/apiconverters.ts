import { WeverseCommunityProps } from "../types";

export function toCommunityProps(val: any): WeverseCommunityProps | null {
    const props: Partial<WeverseCommunityProps> = {}

    if (typeof val.id === 'number') props.id = val.id
    else return null

    if (typeof val.name === 'string') props.name = val.name
    else return null

    if (typeof val.description === 'string') props.description = val.description
    else return null

    if (
        typeof val.memberCount === 'number' || 
        val.memberCount === undefined
        ) props.memberCount = val.memberCount
    else return null

    if (typeof val.homeBannerImgPath === 'string') props.homeBanner = new URL(val.homeBannerImgPath)
    else return null

    if (typeof val.iconImgPath === 'string') props.icon = new URL(val.iconImgPath)
    else return null

    if (typeof val.bannerImgPath === 'string') props.banner = new URL(val.bannerImgPath)
    else return null

    if (
        Array.isArray(val.fullname) && 
        (
            typeof val.fullname[0] === 'string' || 
            !val.fullname.length
            )
        ) props.fullName = val.fullname
    else return null

    if (typeof val.fcMember === 'boolean') props.membersOnly = val.fcMember
    else return null

    return props as WeverseCommunityProps
}