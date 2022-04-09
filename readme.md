## Usage

### Provide credentials
See <a href="https://pypi.org/project/Weverse/">MujyKun's</a> guide on finding your Weverse access token.
```js
import { WeverseClient } from "weverse";

const myClient = new WeverseClient({token: 'my-access-token'})
// or
const myClient = new WeverseClient({username: 'jonah', password: 'top-secret'})
```

### Initialize
```js
import { WeverseClient } from "weverse";

const myClient = new WeverseClient({token: 'my-access-token'})
await myClient.init({allPosts: true, allNotifications: false})

myClient.communities.forEach(community => {
    // typesafe objects with autocompletion
    const details = {
        name: community.name
        posts: community.posts.length
    }
    // do something
})
```

### Listen for new notifications
```js
import { WeverseClient } from "weverse";

const myClient = new WeverseClient({token: 'my-access-token'})
myClient.init({allPosts: true, allNotifications: false})

myClient.on('init', async (ready) => {
    if (ready) {
        myClient.listen({listen: true, interval: 5000})
    }
})

myClient.on('comment', (comment, post) => {
    // all objects are typed
    const commenter = myClient.artistById(comment.artist.id)
    const postAuthor = myClient.artistById(post.artist.id)
    console.log(`${commenter.name} commented on ${postAuthor.name}'s post!`)
})

myClient.on('post', (post) => {
    if (post.photos.length) {
        post.photos.forEach(photo => {
            downloadImage(photo.orgImgUrl)
        })
    }
})
```

## Credit

All credit to <a href="https://github.com/MujyKun">MujyKun</a> for reverse-engineering most of the
Weverse endpoints used by this module.

## Classes

<dl>
<dt><a href="#WeverseEmitter">WeverseEmitter</a></dt>
<dd><p>WeverseEmitter allows the WeverseClient to emit events and provides methods for doing so</p>
</dd>
<dt><a href="#WeverseClient">WeverseClient</a></dt>
<dd><p>Client for the private Weverse api</p>
</dd>
</dl>

<a name="WeverseEmitter"></a>

## WeverseEmitter
WeverseEmitter allows the WeverseClient to emit events and provides methods for doing so

**Kind**: global class  

* [WeverseEmitter](#WeverseEmitter)
    * [.newError(err)](#WeverseEmitter+newError)
    * [.ready(initialized)](#WeverseEmitter+ready)
    * [.newNotif(notification)](#WeverseEmitter+newNotif)
    * [.newPost(post)](#WeverseEmitter+newPost)
    * [.newMedia(media)](#WeverseEmitter+newMedia)
    * [.newComment(comment, post)](#WeverseEmitter+newComment)
    * [.loginResult(result)](#WeverseEmitter+loginResult)
    * [.polled(status)](#WeverseEmitter+polled)

<a name="WeverseEmitter+newError"></a>

### weverseEmitter.newError(err)
**Kind**: instance method of [<code>WeverseEmitter</code>](#WeverseEmitter)  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>Error</code> | The error to be emitted |

<a name="WeverseEmitter+ready"></a>

### weverseEmitter.ready(initialized)
**Kind**: instance method of [<code>WeverseEmitter</code>](#WeverseEmitter)  

| Param | Type | Description |
| --- | --- | --- |
| initialized | <code>boolean</code> | whether initialization succeeded |

<a name="WeverseEmitter+newNotif"></a>

### weverseEmitter.newNotif(notification)
**Kind**: instance method of [<code>WeverseEmitter</code>](#WeverseEmitter)  

| Param | Type | Description |
| --- | --- | --- |
| notification | <code>WeverseNotification</code> | new Notification to be emitted |

<a name="WeverseEmitter+newPost"></a>

### weverseEmitter.newPost(post)
**Kind**: instance method of [<code>WeverseEmitter</code>](#WeverseEmitter)  

| Param | Type | Description |
| --- | --- | --- |
| post | <code>WeversePost</code> | new Post to be emitted |

<a name="WeverseEmitter+newMedia"></a>

### weverseEmitter.newMedia(media)
**Kind**: instance method of [<code>WeverseEmitter</code>](#WeverseEmitter)  

| Param | Type | Description |
| --- | --- | --- |
| media | <code>WeverseMedia</code> | new Media to be emitted |

<a name="WeverseEmitter+newComment"></a>

### weverseEmitter.newComment(comment, post)
**Kind**: instance method of [<code>WeverseEmitter</code>](#WeverseEmitter)  

| Param | Type | Description |
| --- | --- | --- |
| comment | <code>WeverseComment</code> | the Comment that was retrieved |
| post | <code>WeversePost</code> | the Post associated with the Comment |

<a name="WeverseEmitter+loginResult"></a>

### weverseEmitter.loginResult(result)
**Kind**: instance method of [<code>WeverseEmitter</code>](#WeverseEmitter)  

| Param | Type | Description |
| --- | --- | --- |
| result | <code>boolean</code> | boolean result of the login attempt |

<a name="WeverseEmitter+polled"></a>

### weverseEmitter.polled(status)
**Kind**: instance method of [<code>WeverseEmitter</code>](#WeverseEmitter)  

| Param | Type | Description |
| --- | --- | --- |
| status | <code>boolean</code> | result of the poll attempt. If true, Weverse was successfully polled |

<a name="WeverseClient"></a>

## WeverseClient
Client for the private Weverse api

**Kind**: global class  
**Emits**: [<code>error</code>](#WeverseClient+event_error), [<code>init</code>](#WeverseClient+event_init), [<code>notification</code>](#WeverseClient+event_notification), [<code>post</code>](#WeverseClient+event_post), [<code>media</code>](#WeverseClient+event_media), [<code>comment</code>](#WeverseClient+event_comment), [<code>login</code>](#WeverseClient+event_login), [<code>poll</code>](#WeverseClient+event_poll)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| communities | <code>Array.&lt;WeverseCommunity&gt;</code> | The communities associated with the Weverse account |
| artists | <code>Array.&lt;WeverseArtist&gt;</code> | All artists in all communities associated with the account |
| notifications | <code>ClientNotifications</code> | Subclass handling all notifications for the account |
| posts | <code>Array.&lt;WeversePost&gt;</code> | All posts that have been retrieved by this client |


* [WeverseClient](#WeverseClient)
    * [new WeverseClient(authorization, verbose)](#new_WeverseClient_new)
    * [.init(options)](#WeverseClient+init) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.listen(opts)](#WeverseClient+listen)
    * [.checker(process)](#WeverseClient+checker) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.tryRefreshToken()](#WeverseClient+tryRefreshToken) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.login(credentials)](#WeverseClient+login) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.checkLogin()](#WeverseClient+checkLogin) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.getCommunities(opts)](#WeverseClient+getCommunities) ⇒ <code>Promise.&lt;Array.&lt;WeverseCommunity&gt;&gt;</code>
    * [.getCommunityArtists(c, opts)](#WeverseClient+getCommunityArtists) ⇒ <code>Promise.&lt;(Array.&lt;WeverseArtist&gt;\|null)&gt;</code>
    * [.getNotifications(pages, process)](#WeverseClient+getNotifications) ⇒ <code>Promise.&lt;(Array.&lt;WeverseNotification&gt;\|null)&gt;</code>
    * [.getNewNotifications(opts)](#WeverseClient+getNewNotifications) ⇒ <code>Promise.&lt;(Array.&lt;WeverseNotification&gt;\|null)&gt;</code>
    * [.getMedia(id, community)](#WeverseClient+getMedia) ⇒ <code>Promise.&lt;(WeverseMedia\|null)&gt;</code>
    * [.getComments(p, c, cId?)](#WeverseClient+getComments) ⇒ <code>Promise.&lt;(Array.&lt;WeverseComment&gt;\|null)&gt;</code>
    * [.getPost(id, communityId)](#WeverseClient+getPost) ⇒ <code>Promise.&lt;(WeversePost\|null)&gt;</code>
    * [.processNotification(n)](#WeverseClient+processNotification) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.createLoginPayload()](#WeverseClient+createLoginPayload) ⇒ <code>void</code>
    * [.checkToken()](#WeverseClient+checkToken) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.handleResponse(response, url)](#WeverseClient+handleResponse) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.log()](#WeverseClient+log)
    * [.communityById(id)](#WeverseClient+communityById) ⇒ <code>WeverseCommunity</code> \| <code>null</code>
    * [.artistById(id)](#WeverseClient+artistById) ⇒ <code>WeverseArtist</code> \| <code>null</code>
    * [.post(id)](#WeverseClient+post)
    * ["error"](#WeverseClient+event_error)
    * ["init"](#WeverseClient+event_init)
    * ["notification"](#WeverseClient+event_notification)
    * ["post"](#WeverseClient+event_post)
    * ["media"](#WeverseClient+event_media)
    * ["comment"](#WeverseClient+event_comment)
    * ["login"](#WeverseClient+event_login)
    * ["poll"](#WeverseClient+event_poll)

<a name="new_WeverseClient_new"></a>

### new WeverseClient(authorization, verbose)

| Param | Type | Description |
| --- | --- | --- |
| authorization | <code>WeverseAuthorization</code> | either {token: string} or {username: string, password: string} |
| verbose | <code>boolean</code> | optional; defaults to false |

<a name="WeverseClient+init"></a>

### weverseClient.init(options) ⇒ <code>Promise.&lt;void&gt;</code>
init options:
  allPosts: boolean - Whether to load all posts from each community into memory. This will be slow
  allNotifications: boolean - Whether to load all notifications for the Weverse account. Will be slow.
  allMedia: boolean - not currently implemented

**Kind**: instance method of [<code>WeverseClient</code>](#WeverseClient)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>WeverseInitOptions</code> | optional |

<a name="WeverseClient+listen"></a>

### weverseClient.listen(opts)
Tells the client to start or stop listening for new notifications.
Options:
  listen: boolean - Whether the client should be listening
  interval: boolean - Interval in MS to listen on
  process: boolean (optional) - Whether new notifications should be processed into Posts/Comments/Media

**Kind**: instance method of [<code>WeverseClient</code>](#WeverseClient)  
**Access**: public  

| Param | Type |
| --- | --- |
| opts | <code>ListenOptions</code> | 

<a name="WeverseClient+checker"></a>

### weverseClient.checker(process) ⇒ <code>Promise.&lt;void&gt;</code>
Method passed to setInterval if client is listening for new notifications

**Kind**: instance method of [<code>WeverseClient</code>](#WeverseClient)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| process | <code>boolean</code> | Whether to process new notifications into Posts/Comments/Media |

<a name="WeverseClient+tryRefreshToken"></a>

### weverseClient.tryRefreshToken() ⇒ <code>Promise.&lt;boolean&gt;</code>
Attempts to use a refresh token to get a new Weverse access token

**Kind**: instance method of [<code>WeverseClient</code>](#WeverseClient)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - Whether a new access token was granted  
**Access**: public  
<a name="WeverseClient+login"></a>

### weverseClient.login(credentials) ⇒ <code>Promise.&lt;void&gt;</code>
Only used for password authentication. Attempts to login either with login given when
the client was created, or with optional credentials parameter

**Kind**: instance method of [<code>WeverseClient</code>](#WeverseClient)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| credentials | <code>WeversePasswordAuthorization</code> | optional, will override initial credentials |

<a name="WeverseClient+checkLogin"></a>

### weverseClient.checkLogin() ⇒ <code>Promise.&lt;boolean&gt;</code>
Force a credentials check. If login has already been converted to a token, token will be checked.

**Kind**: instance method of [<code>WeverseClient</code>](#WeverseClient)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - - whether the check was successful  
**Access**: public  
<a name="WeverseClient+getCommunities"></a>

### weverseClient.getCommunities(opts) ⇒ <code>Promise.&lt;Array.&lt;WeverseCommunity&gt;&gt;</code>
Load all communities associated with this Weverse account. Returns the communities
but also adds them to the cache.
Options:
  init: boolean - Whether this method was called by the init method and should skip the login check

**Kind**: instance method of [<code>WeverseClient</code>](#WeverseClient)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>GetOptions</code> | optional |

<a name="WeverseClient+getCommunityArtists"></a>

### weverseClient.getCommunityArtists(c, opts) ⇒ <code>Promise.&lt;(Array.&lt;WeverseArtist&gt;\|null)&gt;</code>
Get the artists in a community. Adds them to the cache and returns.
Options:
  init - whether this method was called by init method and the login check should be skipped

**Kind**: instance method of [<code>WeverseClient</code>](#WeverseClient)  
**Returns**: <code>Promise.&lt;(Array.&lt;WeverseArtist&gt;\|null)&gt;</code> - returns null if failed to fetch artists  

| Param | Type | Description |
| --- | --- | --- |
| c | <code>WeverseCommunity</code> |  |
| opts | <code>GetOptions</code> | optional |

<a name="WeverseClient+getNotifications"></a>

### weverseClient.getNotifications(pages, process) ⇒ <code>Promise.&lt;(Array.&lt;WeverseNotification&gt;\|null)&gt;</code>
Note: If process = true, events will be emitted for new notifications AND new Posts/Comments/Media

**Kind**: instance method of [<code>WeverseClient</code>](#WeverseClient)  
**Returns**: <code>Promise.&lt;(Array.&lt;WeverseNotification&gt;\|null)&gt;</code> - - Returns only new notifications not already in cache, or null on failure  

| Param | Type | Description |
| --- | --- | --- |
| pages | <code>number</code> | Optional number of pages to get; defaults to 1 |
| process | <code>boolean</code> | Whether notifications should be processed into Posts/Comments/Media |

<a name="WeverseClient+getNewNotifications"></a>

### weverseClient.getNewNotifications(opts) ⇒ <code>Promise.&lt;(Array.&lt;WeverseNotification&gt;\|null)&gt;</code>
Get one page of the most recent notifications

**Kind**: instance method of [<code>WeverseClient</code>](#WeverseClient)  

| Param | Type | Description |
| --- | --- | --- |
| opts | <code>NewNotifications</code> | {process: boolean} - whether to process notifications into content |

<a name="WeverseClient+getMedia"></a>

### weverseClient.getMedia(id, community) ⇒ <code>Promise.&lt;(WeverseMedia\|null)&gt;</code>
Get a specific media object by id
Will first check local cache, then request from Weverse

**Kind**: instance method of [<code>WeverseClient</code>](#WeverseClient)  
**Returns**: <code>Promise.&lt;(WeverseMedia\|null)&gt;</code> - - Returns only if media did not exist in cache  

| Param | Type |
| --- | --- |
| id | <code>number</code> | 
| community | <code>WeverseCommunity</code> | 

<a name="WeverseClient+getComments"></a>

### weverseClient.getComments(p, c, cId?) ⇒ <code>Promise.&lt;(Array.&lt;WeverseComment&gt;\|null)&gt;</code>
Gets all artist comments on a given post. Returns only new comments.

**Kind**: instance method of [<code>WeverseClient</code>](#WeverseClient)  

| Param | Type |
| --- | --- |
| p | <code>WeversePost</code> | 
| c | <code>WeverseCommunity</code> | 
| cId? | <code>number</code> | 

<a name="WeverseClient+getPost"></a>

### weverseClient.getPost(id, communityId) ⇒ <code>Promise.&lt;(WeversePost\|null)&gt;</code>
Get one post by id. First checks the cache, then requests from Weverse.

**Kind**: instance method of [<code>WeverseClient</code>](#WeverseClient)  
**Access**: public  

| Param | Type |
| --- | --- |
| id | <code>number</code> | 
| communityId | <code>number</code> | 

<a name="WeverseClient+processNotification"></a>

### weverseClient.processNotification(n) ⇒ <code>Promise.&lt;void&gt;</code>
Process one notification. If it refers to a post, comment, or media, attempt to add to cache

**Kind**: instance method of [<code>WeverseClient</code>](#WeverseClient)  

| Param | Type |
| --- | --- |
| n | <code>WeverseNotification</code> | 

<a name="WeverseClient+createLoginPayload"></a>

### weverseClient.createLoginPayload() ⇒ <code>void</code>
Encrypt provided password with Weverse public RSA key and create payload to send to login endpoint
Adds the payload as a property of the client, returns void

**Kind**: instance method of [<code>WeverseClient</code>](#WeverseClient)  
<a name="WeverseClient+checkToken"></a>

### weverseClient.checkToken() ⇒ <code>Promise.&lt;boolean&gt;</code>
Check if the current token (provided or recieved from Weverse) is valid

**Kind**: instance method of [<code>WeverseClient</code>](#WeverseClient)  
<a name="WeverseClient+handleResponse"></a>

### weverseClient.handleResponse(response, url) ⇒ <code>Promise.&lt;boolean&gt;</code>
If the client receives a 401 unauthorized from Weverse, will attempt to refresh credentials

**Kind**: instance method of [<code>WeverseClient</code>](#WeverseClient)  

| Param | Type |
| --- | --- |
| response | <code>AxiosResponse</code> | 
| url | <code>string</code> | 

<a name="WeverseClient+log"></a>

### weverseClient.log()
Log something if verbose = true

**Kind**: instance method of [<code>WeverseClient</code>](#WeverseClient)  

| Param | Type |
| --- | --- |
| ...vals | <code>any</code> | 

<a name="WeverseClient+communityById"></a>

### weverseClient.communityById(id) ⇒ <code>WeverseCommunity</code> \| <code>null</code>
Check the community hashmap for a given id

**Kind**: instance method of [<code>WeverseClient</code>](#WeverseClient)  

| Param | Type |
| --- | --- |
| id | <code>number</code> | 

<a name="WeverseClient+artistById"></a>

### weverseClient.artistById(id) ⇒ <code>WeverseArtist</code> \| <code>null</code>
Check the artist hashmap for a given id

**Kind**: instance method of [<code>WeverseClient</code>](#WeverseClient)  

| Param | Type |
| --- | --- |
| id | <code>number</code> | 

<a name="WeverseClient+post"></a>

### weverseClient.post(id)
Check the post hashmap for a given id

**Kind**: instance method of [<code>WeverseClient</code>](#WeverseClient)  

| Param | Type |
| --- | --- |
| id | <code>number</code> | 

<a name="WeverseClient+event_error"></a>

### "error"
Error event

**Kind**: event emitted by [<code>WeverseClient</code>](#WeverseClient)  
<a name="WeverseClient+event_init"></a>

### "init"
Init event
Whether initialization was successful

**Kind**: event emitted by [<code>WeverseClient</code>](#WeverseClient)  
<a name="WeverseClient+event_notification"></a>

### "notification"
Notification event
New notification

**Kind**: event emitted by [<code>WeverseClient</code>](#WeverseClient)  
<a name="WeverseClient+event_post"></a>

### "post"
Post event
New post

**Kind**: event emitted by [<code>WeverseClient</code>](#WeverseClient)  
<a name="WeverseClient+event_media"></a>

### "media"
Media event
New media

**Kind**: event emitted by [<code>WeverseClient</code>](#WeverseClient)  
<a name="WeverseClient+event_comment"></a>

### "comment"
Comment event
New comment. Provides comment and post.

**Kind**: event emitted by [<code>WeverseClient</code>](#WeverseClient)  
<a name="WeverseClient+event_login"></a>

### "login"
Login event
Result of login attempt.

**Kind**: event emitted by [<code>WeverseClient</code>](#WeverseClient)  
<a name="WeverseClient+event_poll"></a>

### "poll"
Poll event
Result of poll attempt.

**Kind**: event emitted by [<code>WeverseClient</code>](#WeverseClient)  
