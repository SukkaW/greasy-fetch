# greasy-fetch

You want to have modern `fetch` API in your userscript, but you also want to bypass the CORS restrictions via `GM.xmlHttpRequest`/`GM_xmlhttpRequest`. Now you can do both with `greasy-fetch`!

> You will still need to add `@connect` permission to your userscript metadata section.

## Installation

```bash
pnpm add greasy-fetch
yarn add greasy-fetch
npm install greasy-fetch
```

## Usage

### Use with bundler

```ts
import { greasyFetch, GreasyFetchResponse } from 'greasy-fetch';

const response: GreasyFetchResponse = await greasyFetch('https://example.com');
```

### Use with CDN

```js
// ==UserScript==
// @name         my-userscript
// @grant        GM_xmlhttpRequest
// @connect      example.com
// @require      https://cdn.jsdelivr.net/npm/greasy-fetch@1
// ==/UserScript==

const response = await greasyFetch.greasyFetch('https://example.com');
console.log(response instanceof greasyFetch.GreasyFetchResponse); // true
```

### `GreasyFetchResponse`

Constructed `Response` objects (via `new Response()`) don't have proper `url` property, thus `greasy-fetch` implements `GreasyFetchResponse` (which extends `Response`) to provide a working `url` property.

## License

[MIT](LICENSE)

----

**greasy-fetch** © [Sukka](https://github.com/SukkaW), Released under the [MIT](./LICENSE) License.
Authored and maintained by Sukka with help from contributors ([list](https://github.com/SukkaW/greasy-fetch/graphs/contributors)).

> [Personal Website](https://skk.moe) · [Blog](https://blog.skk.moe) · GitHub [@SukkaW](https://github.com/SukkaW) · Telegram Channel [@SukkaChannel](https://t.me/SukkaChannel) · Mastodon [@sukka@acg.mn](https://acg.mn/@sukka) · Twitter [@isukkaw](https://twitter.com/isukkaw) · BlueSky [@skk.moe](https://bsky.app/profile/skk.moe)

<p align="center">
  <a href="https://github.com/sponsors/SukkaW/">
    <img src="https://sponsor.cdn.skk.moe/sponsors.svg"/>
  </a>
</p>
