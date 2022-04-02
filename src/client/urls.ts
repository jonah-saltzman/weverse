
enum WeverseUrlPrefixes {
    LOGIN = 'https://accountapi.',
    API = 'https://weversewebapi.'
}

enum WeverseEndpoints {
    ME = 'wapi/v1/users/me',
    LOGIN = 'api/v1/oauth/token'
}

export default class WeverseUrl {
    static base: string
    private static _login: URL
    private static _checkToken: URL
    static {
        WeverseUrl.base = 'weverse.io'
        const apiURL = new URL('/', WeverseUrlPrefixes.API + WeverseUrl.base)
        apiURL.protocol = 'https:'
        WeverseUrl._login = new URL(WeverseUrlPrefixes.LOGIN + WeverseUrl.base)
        WeverseUrl._login.pathname = WeverseEndpoints.LOGIN
        WeverseUrl._login.protocol = 'https:'
        WeverseUrl._checkToken = new URL(apiURL)
        WeverseUrl._checkToken.pathname = WeverseEndpoints.ME
    }
    
    public static get checkToken(): string {
        return WeverseUrl._checkToken.toString()
    }
}