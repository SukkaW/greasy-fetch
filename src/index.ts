import { fastStringArrayJoin } from 'foxts/fast-string-array-join';
import { extractErrorMessage, isErrorLikeObject } from 'foxts/extract-error-message';
import { invariant } from 'foxts/guard';

export class GreasyFetchResponse extends Response {
  constructor(private readonly _url: string, body: BodyInit | null, init: ResponseInit) {
    super(body, init);
  }

  get url(): string {
    return this._url;
  }

  clone(): GreasyFetchResponse {
    // Response.prototype.clone() returns a plain Response, which would report `url` as ""
    const cloned = super.clone();
    return new GreasyFetchResponse(this._url, cloned.body, cloned);
  }
}

const xhrImpl = typeof GM_xmlhttpRequest === 'function'
  ? GM_xmlhttpRequest
  : ((typeof GM !== 'undefined' && typeof GM.xmlHttpRequest === 'function')
    ? GM.xmlHttpRequest.bind(GM)
    : null);

const NULL_BODY_STATUS = new Set([101, 204, 205, 304]);

export async function greasyFetch(input: RequestInfo, init?: RequestInit): Promise<GreasyFetchResponse> {
  invariant(xhrImpl, '[greasy-fetch] GM_xmlhttpRequest or GM.xmlHttpRequest is not available in this environment');

  const request = new Request(input, init);
  // Request composes the signal from both the `input` Request (if any) and the init
  const signal = request.signal;

  signal.throwIfAborted();

  // request.body is a ReadableStream, which no userscript manager accepts as `data`.
  // Blob is the widest supported body type (Tampermonkey and Violentmonkey both accept it)
  const data = request.body == null ? undefined : await request.blob();

  // The signal may have aborted while the body was being serialized, and an "abort"
  // listener added after the fact would never fire
  signal.throwIfAborted();

  return new Promise<GreasyFetchResponse>((resolve, reject) => {
    const xhr = xhrImpl({
      synchronous: false,
      // Undocumented, but supported by Tampermonkey, Violentmonkey and Greasemonkey 4 (not GM3).
      // fetch's default is "same-origin", so only an explicit "omit" disables cookies
      withCredentials: request.credentials !== 'omit',
      headers: headersToPlainObject(request.headers),
      method: request.method as GM.Request['method'],
      url: request.url,
      // @ts-expect-error -- Tampermonkey and Violentmonkey accept Blob, the typing only allows string
      data,
      responseType: 'arraybuffer', // pass to new Response easily
      onload(xhrResponse) {
        try {
          const responseHeaders = parseHeaders(xhrResponse.responseHeaders);

          let status = xhrResponse.status;
          // This check if specifically for when a user fetches a file locally from the file system
          // Only if the status is out of a normal range
          if (request.url.startsWith('file://') && (status < 200 || status > 599)) {
            status = 200;
          }

          const responseUrl = 'finalUrl' in xhrResponse ? xhrResponse.finalUrl : responseHeaders.get('X-Request-URL');

          // The Response constructor throws if a body is passed alongside a null body status,
          // and HEAD responses must not have a body either
          const body = request.method === 'HEAD' || NULL_BODY_STATUS.has(status)
            ? null
            // Greasemonkey doesn't have "response", but Tampermonkey and Violentmonkey does
            : ('response' in xhrResponse ? (xhrResponse.response as ArrayBuffer) : xhrResponse.responseText);

          resolve(new GreasyFetchResponse(responseUrl || request.url, body, {
            status,
            statusText: xhrResponse.statusText,
            headers: responseHeaders
          }));
        } catch (error) {
          // The Response constructor can still throw (e.g. status out of the [200, 599] range),
          // and an uncaught throw here would leave the promise pending forever
          reject(isErrorLikeObject(error) ? (error as Error) : new TypeError('Failed to fetch'));
        }
      },
      onerror() {
        reject(new TypeError('Failed to fetch'));
      },
      ontimeout() {
        reject(new TypeError('Failed to fetch'));
      },
      onabort() {
        reject(signal.aborted ? (signal.reason as Error) : new DOMException('Aborted', 'AbortError'));
      },
      onreadystatechange(response) {
        if (response.readyState === 4) {
          signal.removeEventListener('abort', abortXhr);
        }
      }
    });

    function abortXhr() {
      if (xhr != null && typeof xhr === 'object' && 'abort' in xhr && typeof xhr.abort === 'function') {
        xhr.abort();
      }
      // Don't rely on the userscript manager firing onabort
      reject(signal.reason as Error);
    };

    signal.addEventListener('abort', abortXhr, { once: true });
  });
}

const rHeaderSeparator = /\r?\n[\t ]+/g;
const rHeaderLineSeparator = /\r?\n/;
function parseHeaders(rawHeaders: string): Headers {
  const headers = new Headers();

  rawHeaders
    // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
    // https://tools.ietf.org/html/rfc7230#section-3.2
    .replaceAll(rHeaderSeparator, ' ')
    // Split by lines
    .split(rHeaderLineSeparator)
    .forEach((line) => {
      const parts = line.split(':');
      // eslint-disable-next-line sukka/unicorn/no-array-front-mutation -- header parsing in order
      const key = parts.shift()?.trim();

      if (key) {
        const value = fastStringArrayJoin(parts, ':').trim();
        try {
          headers.append(key, value);
        } catch (error) {
          // eslint-disable-next-line no-console -- acceptable
          console.warn('[greasy-fetch] Failed to parse response header: ' + (extractErrorMessage(error, false, false) || 'unknown error'));
        }
      }
    });

  return headers;
}

function headersToPlainObject(headers: Headers): Record<string, string> {
  return Object.fromEntries(headers.entries());
}
