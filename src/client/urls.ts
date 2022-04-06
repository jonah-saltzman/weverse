
enum WeverseUrlPrefixes {
    LOGIN = 'https://accountapi.',
    API = 'https://weversewebapi.'
}

enum WeverseEndpoints {
    ME = 'users/me',
    LOGIN = 'api/v1/oauth/token',
    COMMUNITIES = 'communities/',
    NOTIFICATIONS = 'stream/notifications/',
}

export class WeverseUrl {
    static base: string
    private static _login: URL
    private static _checkToken: URL
    private static _communities: URL
    private static _allNotifications: URL
    static {
        WeverseUrl.base = 'weverse.io'
        const baseUrl = new URL('/', WeverseUrlPrefixes.API + WeverseUrl.base)
        baseUrl.protocol = 'https:'
        const apiUrl = new URL(baseUrl)
        apiUrl.pathname = 'wapi/v1/'
        WeverseUrl._login = new URL(WeverseUrlPrefixes.LOGIN + WeverseUrl.base)
        WeverseUrl._login.pathname = WeverseEndpoints.LOGIN
        WeverseUrl._login.protocol = 'https:'
        WeverseUrl._checkToken = new URL(apiUrl)
        WeverseUrl._checkToken.pathname += WeverseEndpoints.ME
        WeverseUrl._communities = new URL(apiUrl)
        WeverseUrl._communities.pathname += WeverseEndpoints.COMMUNITIES
        WeverseUrl._allNotifications = new URL(apiUrl)
        WeverseUrl._allNotifications.pathname += WeverseEndpoints.NOTIFICATIONS
    }
    
    public static get checkToken(): string {
        return WeverseUrl._checkToken.toString()
    }
    public static get communities(): string {
        return WeverseUrl._communities.toString()
    }
    public static get login(): string {
        return WeverseUrl._login.toString()
    }
    public static get allNotifications(): string {
        return WeverseUrl._allNotifications.toString()
    }

    public static community(id: number): string {
        const url = new URL(WeverseUrl._communities.toString())
        url.pathname += id.toString()
        return url.toString()
    }
}