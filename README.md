# greasy-fetch

You want to have modern `fetch` API in your userscript, but you also want to bypass the CORS restrictions via `GM.xmlHttpRequest`/`GM_xmlhttpRequest`. Now you can do both with `greasy-fetch`!

## Installation

```bash
pnpm add greasy-fetch
yarn add greasy-fetch
npm install greasy-fetch
```

## Usage

```ts
import { greasyFetch, GreasyFetchResponse } from 'greasy-fetch';

const response: GreasyFetchResponse = await greasyFetch('https://example.com');
```

> Constructed `Response` objects don't have proper `url` property, thus `greasy-fetch` provides `GreasyFetchResponse` (which extends `Response`) class with a working `url` property.

You will still need to add `@connect` permission to your userscript.

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
