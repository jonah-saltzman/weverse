
enum WeverseUrlPrefixes {
    LOGIN = 'https://accountapi.',
    API = 'https://weversewebapi.'
}

enum WeverseEndpoints {
    ME = 'users/me',
    LOGIN = 'api/v1/oauth/token',
    COMMUNITIES = 'communities'
}

export class WeverseUrl {
    static base: string
    private static _login: URL
    private static _checkToken: URL
    private static _communities: URL
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
}