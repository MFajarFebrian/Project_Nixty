import process from 'node:process';globalThis._importMeta_={url:import.meta.url,env:process.env};import { tmpdir } from 'node:os';
import { Server } from 'node:http';
import path, { resolve, dirname, join, basename, extname } from 'node:path';
import crypto, { createHash, randomBytes } from 'node:crypto';
import { parentPort, threadId } from 'node:worker_threads';
import { defineEventHandler, handleCacheHeaders, splitCookiesString, createEvent, fetchWithEvent, isEvent, eventHandler, setHeaders, sendRedirect, proxyRequest, getRequestHeader, setResponseHeaders, setResponseStatus, send, getRequestHeaders, setResponseHeader, appendResponseHeader, getRequestURL, getResponseHeader, createError, getHeaders, setHeader, getHeader, getQuery as getQuery$1, readBody, createApp, createRouter as createRouter$1, toNodeListener, lazyEventHandler, getResponseStatus, getRouterParam, readMultipartFormData, getResponseStatusText } from 'file://C:/Users/E31/Downloads/project_nixty/node_modules/h3/dist/index.mjs';
import { escapeHtml } from 'file://C:/Users/E31/Downloads/project_nixty/node_modules/@vue/shared/dist/shared.cjs.js';
import { promises } from 'node:fs';
import bcrypt from 'file://C:/Users/E31/Downloads/project_nixty/node_modules/bcryptjs/index.js';
import midtransClient from 'file://C:/Users/E31/Downloads/project_nixty/node_modules/midtrans-client/index.js';
import { put } from 'file://C:/Users/E31/Downloads/project_nixty/node_modules/@vercel/blob/dist/index.js';
import { fileURLToPath } from 'node:url';
import dotenv from 'file://C:/Users/E31/Downloads/project_nixty/node_modules/dotenv/lib/main.js';
import { createStorage, prefixStorage } from 'file://C:/Users/E31/Downloads/project_nixty/node_modules/unstorage/dist/index.mjs';
import memoryDriver from 'file://C:/Users/E31/Downloads/project_nixty/node_modules/unstorage/drivers/memory.mjs';
import { createRenderer, getRequestDependencies, getPreloadLinks, getPrefetchLinks } from 'file://C:/Users/E31/Downloads/project_nixty/node_modules/vue-bundle-renderer/dist/runtime.mjs';
import { parseURL, withoutBase, joinURL, getQuery, withQuery, withTrailingSlash, joinRelativeURL } from 'file://C:/Users/E31/Downloads/project_nixty/node_modules/ufo/dist/index.mjs';
import { renderToString } from 'file://C:/Users/E31/Downloads/project_nixty/node_modules/vue/server-renderer/index.mjs';
import { klona } from 'file://C:/Users/E31/Downloads/project_nixty/node_modules/klona/dist/index.mjs';
import defu, { defuFn } from 'file://C:/Users/E31/Downloads/project_nixty/node_modules/defu/dist/defu.mjs';
import destr, { destr as destr$1 } from 'file://C:/Users/E31/Downloads/project_nixty/node_modules/destr/dist/index.mjs';
import { snakeCase } from 'file://C:/Users/E31/Downloads/project_nixty/node_modules/scule/dist/index.mjs';
import { createHead as createHead$1, propsToString, renderSSRHead } from 'file://C:/Users/E31/Downloads/project_nixty/node_modules/unhead/dist/server.mjs';
import { stringify, uneval } from 'file://C:/Users/E31/Downloads/project_nixty/node_modules/devalue/index.js';
import { isVNode, toValue, isRef } from 'file://C:/Users/E31/Downloads/project_nixty/node_modules/vue/index.mjs';
import { DeprecationsPlugin, PromisesPlugin, TemplateParamsPlugin, AliasSortingPlugin } from 'file://C:/Users/E31/Downloads/project_nixty/node_modules/unhead/dist/plugins.mjs';
import { createHooks } from 'file://C:/Users/E31/Downloads/project_nixty/node_modules/hookable/dist/index.mjs';
import { $fetch, createFetch, Headers as Headers$1 } from 'file://C:/Users/E31/Downloads/project_nixty/node_modules/ofetch/dist/node.mjs';
import { fetchNodeRequestHandler, callNodeRequestHandler } from 'file://C:/Users/E31/Downloads/project_nixty/node_modules/node-mock-http/dist/index.mjs';
import unstorage_47drivers_47fs from 'file://C:/Users/E31/Downloads/project_nixty/node_modules/unstorage/drivers/fs.mjs';
import { digest } from 'file://C:/Users/E31/Downloads/project_nixty/node_modules/ohash/dist/index.mjs';
import { toRouteMatcher, createRouter } from 'file://C:/Users/E31/Downloads/project_nixty/node_modules/radix3/dist/index.mjs';
import { readFile } from 'node:fs/promises';
import consola, { consola as consola$1 } from 'file://C:/Users/E31/Downloads/project_nixty/node_modules/consola/dist/index.mjs';
import { ErrorParser } from 'file://C:/Users/E31/Downloads/project_nixty/node_modules/youch-core/build/index.js';
import { Youch } from 'file://C:/Users/E31/Downloads/project_nixty/node_modules/nitropack/node_modules/youch/build/index.js';
import { SourceMapConsumer } from 'file://C:/Users/E31/Downloads/project_nixty/node_modules/nitropack/node_modules/source-map/source-map.js';
import { AsyncLocalStorage } from 'node:async_hooks';
import { getContext } from 'file://C:/Users/E31/Downloads/project_nixty/node_modules/unctx/dist/index.mjs';
import { captureRawStackTrace, parseRawStackTrace } from 'file://C:/Users/E31/Downloads/project_nixty/node_modules/errx/dist/index.js';
import mysql from 'file://C:/Users/E31/Downloads/project_nixty/node_modules/mysql2/promise.js';
import pkg from 'file://C:/Users/E31/Downloads/project_nixty/node_modules/pg/esm/index.mjs';
import { walkResolver } from 'file://C:/Users/E31/Downloads/project_nixty/node_modules/unhead/dist/utils.mjs';

const serverAssets = [{"baseName":"server","dir":"C:/Users/E31/Downloads/project_nixty/server/assets"}];

const assets = createStorage();

for (const asset of serverAssets) {
  assets.mount(asset.baseName, unstorage_47drivers_47fs({ base: asset.dir, ignore: (asset?.ignore || []) }));
}

const storage$1 = createStorage({});

storage$1.mount('/assets', assets);

storage$1.mount('cache', unstorage_47drivers_47fs({"driver":"fs","readOnly":false,"base":"C:/Users/E31/Downloads/project_nixty/.nuxt/cache"}));
storage$1.mount('root', unstorage_47drivers_47fs({"driver":"fs","readOnly":true,"base":"C:/Users/E31/Downloads/project_nixty","watchOptions":{"ignored":[null]}}));
storage$1.mount('src', unstorage_47drivers_47fs({"driver":"fs","readOnly":true,"base":"C:/Users/E31/Downloads/project_nixty/server","watchOptions":{"ignored":[null]}}));
storage$1.mount('build', unstorage_47drivers_47fs({"driver":"fs","readOnly":false,"base":"C:/Users/E31/Downloads/project_nixty/.nuxt"}));
storage$1.mount('data', unstorage_47drivers_47fs({"driver":"fs","base":"C:/Users/E31/Downloads/project_nixty/.data/kv"}));

function useStorage(base = "") {
  return base ? prefixStorage(storage$1, base) : storage$1;
}

const Hasher = /* @__PURE__ */ (() => {
  class Hasher2 {
    buff = "";
    #context = /* @__PURE__ */ new Map();
    write(str) {
      this.buff += str;
    }
    dispatch(value) {
      const type = value === null ? "null" : typeof value;
      return this[type](value);
    }
    object(object) {
      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }
      const objString = Object.prototype.toString.call(object);
      let objType = "";
      const objectLength = objString.length;
      objType = objectLength < 10 ? "unknown:[" + objString + "]" : objString.slice(8, objectLength - 1);
      objType = objType.toLowerCase();
      let objectNumber = null;
      if ((objectNumber = this.#context.get(object)) === void 0) {
        this.#context.set(object, this.#context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        this.write("buffer:");
        return this.write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this[objType]) {
          this[objType](object);
        } else {
          this.unknown(object, objType);
        }
      } else {
        const keys = Object.keys(object).sort();
        const extraKeys = [];
        this.write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key) => {
          this.dispatch(key);
          this.write(":");
          this.dispatch(object[key]);
          this.write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    }
    array(arr, unordered) {
      unordered = unordered === void 0 ? false : unordered;
      this.write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }
      const contextAdditions = /* @__PURE__ */ new Map();
      const entries = arr.map((entry) => {
        const hasher = new Hasher2();
        hasher.dispatch(entry);
        for (const [key, value] of hasher.#context) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      this.#context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    }
    date(date) {
      return this.write("date:" + date.toJSON());
    }
    symbol(sym) {
      return this.write("symbol:" + sym.toString());
    }
    unknown(value, type) {
      this.write(type);
      if (!value) {
        return;
      }
      this.write(":");
      if (value && typeof value.entries === "function") {
        return this.array(
          [...value.entries()],
          true
          /* ordered */
        );
      }
    }
    error(err) {
      return this.write("error:" + err.toString());
    }
    boolean(bool) {
      return this.write("bool:" + bool);
    }
    string(string) {
      this.write("string:" + string.length + ":");
      this.write(string);
    }
    function(fn) {
      this.write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
    }
    number(number) {
      return this.write("number:" + number);
    }
    null() {
      return this.write("Null");
    }
    undefined() {
      return this.write("Undefined");
    }
    regexp(regex) {
      return this.write("regex:" + regex.toString());
    }
    arraybuffer(arr) {
      this.write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    }
    url(url) {
      return this.write("url:" + url.toString());
    }
    map(map) {
      this.write("map:");
      const arr = [...map];
      return this.array(arr, false);
    }
    set(set) {
      this.write("set:");
      const arr = [...set];
      return this.array(arr, false);
    }
    bigint(number) {
      return this.write("bigint:" + number.toString());
    }
  }
  for (const type of [
    "uint8array",
    "uint8clampedarray",
    "unt8array",
    "uint16array",
    "unt16array",
    "uint32array",
    "unt32array",
    "float32array",
    "float64array"
  ]) {
    Hasher2.prototype[type] = function(arr) {
      this.write(type + ":");
      return this.array([...arr], false);
    };
  }
  function isNativeFunction(f) {
    if (typeof f !== "function") {
      return false;
    }
    return Function.prototype.toString.call(f).slice(
      -15
      /* "[native code] }".length */
    ) === "[native code] }";
  }
  return Hasher2;
})();
function serialize(object) {
  const hasher = new Hasher();
  hasher.dispatch(object);
  return hasher.buff;
}
function hash(value) {
  return digest(typeof value === "string" ? value : serialize(value)).replace(/[-_]/g, "").slice(0, 10);
}

function defaultCacheOptions() {
  return {
    name: "_",
    base: "/cache",
    swr: true,
    maxAge: 1
  };
}
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions(), ...opts };
  const pending = {};
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = opts.integrity || hash([fn, opts]);
  const validate = opts.validate || ((entry) => entry.value !== void 0);
  async function get(key, resolver, shouldInvalidateCache, event) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    let entry = await useStorage().getItem(cacheKey).catch((error) => {
      console.error(`[cache] Cache read error.`, error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }) || {};
    if (typeof entry !== "object") {
      entry = {};
      const error = new Error("Malformed data read from cache.");
      console.error("[cache]", error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }
    const ttl = (opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || validate(entry) === false;
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0 && opts.swr === false) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      try {
        entry.value = await pending[key];
      } catch (error) {
        if (!isPending) {
          delete pending[key];
        }
        throw error;
      }
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry) !== false) {
          let setOpts;
          if (opts.maxAge && !opts.swr) {
            setOpts = { ttl: opts.maxAge };
          }
          const promise = useStorage().setItem(cacheKey, entry, setOpts).catch((error) => {
            console.error(`[cache] Cache write error.`, error);
            useNitroApp().captureError(error, { event, tags: ["cache"] });
          });
          if (event?.waitUntil) {
            event.waitUntil(promise);
          }
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (entry.value === void 0) {
      await _resolvePromise;
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise);
    }
    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[cache] SWR handler error.`, error);
        useNitroApp().captureError(error, { event, tags: ["cache"] });
      });
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args);
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : void 0
    );
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
function cachedFunction(fn, opts = {}) {
  return defineCachedFunction(fn, opts);
}
function getKey(...args) {
  return args.length > 0 ? hash(args) : "";
}
function escapeKey(key) {
  return String(key).replace(/\W/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions()) {
  const variableHeaderNames = (opts.varies || []).filter(Boolean).map((h) => h.toLowerCase()).sort();
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      const _path = event.node.req.originalUrl || event.node.req.url || event.path;
      let _pathname;
      try {
        _pathname = escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || "index";
      } catch {
        _pathname = "-";
      }
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = variableHeaderNames.map((header) => [header, event.node.req.headers[header]]).map(([name, value]) => `${escapeKey(name)}.${hash(value)}`);
      return [_hashedPath, ..._headers].join(":");
    },
    validate: (entry) => {
      if (!entry.value) {
        return false;
      }
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      if (entry.value.headers.etag === "undefined" || entry.value.headers["last-modified"] === "undefined") {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: opts.integrity || hash([handler, opts])
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const variableHeaders = {};
      for (const header of variableHeaderNames) {
        const value = incomingEvent.node.req.headers[header];
        if (value !== void 0) {
          variableHeaders[header] = value;
        }
      }
      const reqProxy = cloneWithProxy(incomingEvent.node.req, {
        headers: variableHeaders
      });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        writableEnded: false,
        writableFinished: false,
        headersSent: false,
        closed: false,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2(void 0);
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return true;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            if (Array.isArray(headers2) || typeof headers2 === "string") {
              throw new TypeError("Raw headers  is not supported.");
            }
            for (const header in headers2) {
              const value = headers2[header];
              if (value !== void 0) {
                this.setHeader(
                  header,
                  value
                );
              }
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: useNitroApp().localFetch
      });
      event.$fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: globalThis.$fetch
      });
      event.waitUntil = incomingEvent.waitUntil;
      event.context = incomingEvent.context;
      event.context.cache = {
        options: _opts
      };
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = String(
        headers.Etag || headers.etag || `W/"${hash(body)}"`
      );
      headers["last-modified"] = String(
        headers["Last-Modified"] || headers["last-modified"] || (/* @__PURE__ */ new Date()).toUTCString()
      );
      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(
      event
    );
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      const value = response.headers[name];
      if (name === "set-cookie") {
        event.node.res.appendHeader(
          name,
          splitCookiesString(value)
        );
      } else {
        if (value !== void 0) {
          event.node.res.setHeader(name, value);
        }
      }
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

const inlineAppConfig = {
  "nuxt": {}
};



const appConfig = defuFn(inlineAppConfig);

function getEnv(key, opts) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[opts.prefix + envKey] ?? process.env[opts.altPrefix + envKey]
  );
}
function _isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function applyEnv(obj, opts, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey, opts);
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
        applyEnv(obj[key], opts, subKey);
      } else if (envValue === void 0) {
        applyEnv(obj[key], opts, subKey);
      } else {
        obj[key] = envValue ?? obj[key];
      }
    } else {
      obj[key] = envValue ?? obj[key];
    }
    if (opts.envExpansion && typeof obj[key] === "string") {
      obj[key] = _expandFromEnv(obj[key]);
    }
  }
  return obj;
}
const envExpandRx = /\{\{([^{}]*)\}\}/g;
function _expandFromEnv(value) {
  return value.replace(envExpandRx, (match, key) => {
    return process.env[key] || match;
  });
}

const _inlineRuntimeConfig = {
  "app": {
    "baseURL": "/",
    "buildId": "dev",
    "buildAssetsDir": "/_nuxt/",
    "cdnURL": ""
  },
  "nitro": {
    "envPrefix": "NUXT_",
    "routeRules": {
      "/__nuxt_error": {
        "cache": false
      },
      "/**": {
        "headers": {
          "Cache-Control": "public, max-age=60, s-maxage=60"
        },
        "noScripts": false
      },
      "/": {
        "headers": {
          "Cache-Control": "public, max-age=3600, s-maxage=3600"
        }
      },
      "/profile/**": {
        "headers": {
          "Cache-Control": "public, max-age=300, s-maxage=300"
        }
      },
      "/admin/**": {
        "headers": {
          "Cache-Control": "public, max-age=30, s-maxage=30"
        }
      },
      "/api/**": {
        "headers": {
          "Cache-Control": "public, max-age=10, s-maxage=10"
        }
      },
      "/images/**": {
        "headers": {
          "Cache-Control": "public, max-age=86400, s-maxage=86400"
        }
      },
      "/assets/**": {
        "headers": {
          "Cache-Control": "public, max-age=86400, s-maxage=86400"
        }
      },
      "/_nuxt/builds/meta/dev.json": {
        "headers": {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "X-Preload": "false"
        }
      },
      "/_nuxt/builds/meta/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      },
      "/_nuxt/builds/**": {
        "headers": {
          "cache-control": "public, max-age=1, immutable"
        }
      }
    }
  },
  "public": {
    "apiBase": "/api",
    "bypassAdminAuth": "true",
    "nodeEnv": "development",
    "midtransClientKey": "SB-Mid-client-XZVBXJmESkGTZlFP",
    "midtransIsProduction": "false",
    "baseUrl": "http://localhost:3000",
    "supabaseUrl": "https://buafxvcghfeoquyprmcb.supabase.co",
    "supabaseKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1YWZ4dmNnaGZlb3F1eXBybWNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2OTQwOTIsImV4cCI6MjA2NjI3MDA5Mn0.yeTIbNE7Caq6wBV_hqvjlUyHAc5PBGsLQvlKSGSe4NI",
    "supabase": {
      "url": "https://buafxvcghfeoquyprmcb.supabase.co",
      "key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1YWZ4dmNnaGZlb3F1eXBybWNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2OTQwOTIsImV4cCI6MjA2NjI3MDA5Mn0.yeTIbNE7Caq6wBV_hqvjlUyHAc5PBGsLQvlKSGSe4NI",
      "redirect": false,
      "redirectOptions": {
        "login": "/login",
        "callback": "/confirm",
        "exclude": [],
        "cookieRedirect": false,
        "saveRedirectToCookie": false
      },
      "cookieName": "sb",
      "cookiePrefix": "sb-buafxvcghfeoquyprmcb-auth-token",
      "useSsrCookies": true,
      "cookieOptions": {
        "maxAge": 28800,
        "sameSite": "lax",
        "secure": true
      },
      "clientOptions": {}
    }
  },
  "apiSecret": "default_secret",
  "supabaseUrl": "https://buafxvcghfeoquyprmcb.supabase.co",
  "supabaseKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1YWZ4dmNnaGZlb3F1eXBybWNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2OTQwOTIsImV4cCI6MjA2NjI3MDA5Mn0.yeTIbNE7Caq6wBV_hqvjlUyHAc5PBGsLQvlKSGSe4NI",
  "supabaseServiceKey": "",
  "midtransServerKey": "SB-Mid-server-0-XiKyaD4PwMJvSRl7JZbZDp",
  "databaseUrl": "postgresql://postgres.buafxvcghfeoquyprmcb:xD5U0KxWnyFSZoEr@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres",
  "supabase": {
    "serviceKey": ""
  }
};
const envOptions = {
  prefix: "NITRO_",
  altPrefix: _inlineRuntimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_",
  envExpansion: _inlineRuntimeConfig.nitro.envExpansion ?? process.env.NITRO_ENV_EXPANSION ?? false
};
const _sharedRuntimeConfig = _deepFreeze(
  applyEnv(klona(_inlineRuntimeConfig), envOptions)
);
function useRuntimeConfig(event) {
  if (!event) {
    return _sharedRuntimeConfig;
  }
  if (event.context.nitro.runtimeConfig) {
    return event.context.nitro.runtimeConfig;
  }
  const runtimeConfig = klona(_inlineRuntimeConfig);
  applyEnv(runtimeConfig, envOptions);
  event.context.nitro.runtimeConfig = runtimeConfig;
  return runtimeConfig;
}
_deepFreeze(klona(appConfig));
function _deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      _deepFreeze(value);
    }
  }
  return Object.freeze(object);
}
new Proxy(/* @__PURE__ */ Object.create(null), {
  get: (_, prop) => {
    console.warn(
      "Please use `useRuntimeConfig()` instead of accessing config directly."
    );
    const runtimeConfig = useRuntimeConfig();
    if (prop in runtimeConfig) {
      return runtimeConfig[prop];
    }
    return void 0;
  }
});

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter({ routes: config.nitro.routeRules })
);
function createRouteRulesHandler(ctx) {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      let target = routeRules.redirect.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.redirect._redirectStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return sendRedirect(event, target, routeRules.redirect.statusCode);
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.proxy._proxyStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy
      });
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split("?")[0], useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError(error, { tags: [type] });
}
function trapUnhandledNodeErrors() {
  process.on(
    "unhandledRejection",
    (error) => _captureError(error, "unhandledRejection")
  );
  process.on(
    "uncaughtException",
    (error) => _captureError(error, "uncaughtException")
  );
}
function joinHeaders(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}
function normalizeFetchResponse(response) {
  if (!response.headers.has("set-cookie")) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers)
  });
}
function normalizeCookieHeader(header = "") {
  return splitCookiesString(joinHeaders(header));
}
function normalizeCookieHeaders(headers) {
  const outgoingHeaders = new Headers();
  for (const [name, header] of headers) {
    if (name === "set-cookie") {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append("set-cookie", cookie);
      }
    } else {
      outgoingHeaders.set(name, joinHeaders(header));
    }
  }
  return outgoingHeaders;
}

function isJsonRequest(event) {
  if (hasReqHeader(event, "accept", "text/html")) {
    return false;
  }
  return hasReqHeader(event, "accept", "application/json") || hasReqHeader(event, "user-agent", "curl/") || hasReqHeader(event, "user-agent", "httpie/") || hasReqHeader(event, "sec-fetch-mode", "cors") || event.path.startsWith("/api/") || event.path.endsWith(".json");
}
function hasReqHeader(event, name, includes) {
  const value = getRequestHeader(event, name);
  return value && typeof value === "string" && value.toLowerCase().includes(includes);
}

const errorHandler$0 = (async function errorhandler(error, event, { defaultHandler }) {
  if (event.handled || isJsonRequest(event)) {
    return;
  }
  const defaultRes = await defaultHandler(error, event, { json: true });
  const statusCode = error.statusCode || 500;
  if (statusCode === 404 && defaultRes.status === 302) {
    setResponseHeaders(event, defaultRes.headers);
    setResponseStatus(event, defaultRes.status, defaultRes.statusText);
    return send(event, JSON.stringify(defaultRes.body, null, 2));
  }
  if (typeof defaultRes.body !== "string" && Array.isArray(defaultRes.body.stack)) {
    defaultRes.body.stack = defaultRes.body.stack.join("\n");
  }
  const errorObject = defaultRes.body;
  const url = new URL(errorObject.url);
  errorObject.url = withoutBase(url.pathname, useRuntimeConfig(event).app.baseURL) + url.search + url.hash;
  errorObject.message ||= "Server Error";
  errorObject.data ||= error.data;
  errorObject.statusMessage ||= error.statusMessage;
  delete defaultRes.headers["content-type"];
  delete defaultRes.headers["content-security-policy"];
  setResponseHeaders(event, defaultRes.headers);
  const reqHeaders = getRequestHeaders(event);
  const isRenderingError = event.path.startsWith("/__nuxt_error") || !!reqHeaders["x-nuxt-error"];
  const res = isRenderingError ? null : await useNitroApp().localFetch(
    withQuery(joinURL(useRuntimeConfig(event).app.baseURL, "/__nuxt_error"), errorObject),
    {
      headers: { ...reqHeaders, "x-nuxt-error": "true" },
      redirect: "manual"
    }
  ).catch(() => null);
  if (event.handled) {
    return;
  }
  if (!res) {
    const { template } = await Promise.resolve().then(function () { return errorDev; }) ;
    {
      errorObject.description = errorObject.message;
    }
    setResponseHeader(event, "Content-Type", "text/html;charset=UTF-8");
    return send(event, template(errorObject));
  }
  const html = await res.text();
  for (const [header, value] of res.headers.entries()) {
    if (header === "set-cookie") {
      appendResponseHeader(event, header, value);
      continue;
    }
    setResponseHeader(event, header, value);
  }
  setResponseStatus(event, res.status && res.status !== 200 ? res.status : defaultRes.status, res.statusText || defaultRes.statusText);
  return send(event, html);
});

function defineNitroErrorHandler(handler) {
  return handler;
}

const errorHandler$1 = defineNitroErrorHandler(
  async function defaultNitroErrorHandler(error, event) {
    const res = await defaultHandler(error, event);
    if (!event.node?.res.headersSent) {
      setResponseHeaders(event, res.headers);
    }
    setResponseStatus(event, res.status, res.statusText);
    return send(
      event,
      typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2)
    );
  }
);
async function defaultHandler(error, event, opts) {
  const isSensitive = error.unhandled || error.fatal;
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage || "Server Error";
  const url = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true });
  if (statusCode === 404) {
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      const redirectTo = `${baseURL}${url.pathname.slice(1)}${url.search}`;
      return {
        status: 302,
        statusText: "Found",
        headers: { location: redirectTo },
        body: `Redirecting...`
      };
    }
  }
  await loadStackTrace(error).catch(consola.error);
  const youch = new Youch();
  if (isSensitive && !opts?.silent) {
    const tags = [error.unhandled && "[unhandled]", error.fatal && "[fatal]"].filter(Boolean).join(" ");
    const ansiError = await (await youch.toANSI(error)).replaceAll(process.cwd(), ".");
    consola.error(
      `[request error] ${tags} [${event.method}] ${url}

`,
      ansiError
    );
  }
  const useJSON = opts?.json || !getRequestHeader(event, "accept")?.includes("text/html");
  const headers = {
    "content-type": useJSON ? "application/json" : "text/html",
    // Prevent browser from guessing the MIME types of resources.
    "x-content-type-options": "nosniff",
    // Prevent error page from being embedded in an iframe
    "x-frame-options": "DENY",
    // Prevent browsers from sending the Referer header
    "referrer-policy": "no-referrer",
    // Disable the execution of any js
    "content-security-policy": "script-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self';"
  };
  if (statusCode === 404 || !getResponseHeader(event, "cache-control")) {
    headers["cache-control"] = "no-cache";
  }
  const body = useJSON ? {
    error: true,
    url,
    statusCode,
    statusMessage,
    message: error.message,
    data: error.data,
    stack: error.stack?.split("\n").map((line) => line.trim())
  } : await youch.toHTML(error, {
    request: {
      url: url.href,
      method: event.method,
      headers: getRequestHeaders(event)
    }
  });
  return {
    status: statusCode,
    statusText: statusMessage,
    headers,
    body
  };
}
async function loadStackTrace(error) {
  if (!(error instanceof Error)) {
    return;
  }
  const parsed = await new ErrorParser().defineSourceLoader(sourceLoader).parse(error);
  const stack = error.message + "\n" + parsed.frames.map((frame) => fmtFrame(frame)).join("\n");
  Object.defineProperty(error, "stack", { value: stack });
  if (error.cause) {
    await loadStackTrace(error.cause).catch(consola.error);
  }
}
async function sourceLoader(frame) {
  if (!frame.fileName || frame.fileType !== "fs" || frame.type === "native") {
    return;
  }
  if (frame.type === "app") {
    const rawSourceMap = await readFile(`${frame.fileName}.map`, "utf8").catch(() => {
    });
    if (rawSourceMap) {
      const consumer = await new SourceMapConsumer(rawSourceMap);
      const originalPosition = consumer.originalPositionFor({ line: frame.lineNumber, column: frame.columnNumber });
      if (originalPosition.source && originalPosition.line) {
        frame.fileName = resolve(dirname(frame.fileName), originalPosition.source);
        frame.lineNumber = originalPosition.line;
        frame.columnNumber = originalPosition.column || 0;
      }
    }
  }
  const contents = await readFile(frame.fileName, "utf8").catch(() => {
  });
  return contents ? { contents } : void 0;
}
function fmtFrame(frame) {
  if (frame.type === "native") {
    return frame.raw;
  }
  const src = `${frame.fileName || ""}:${frame.lineNumber}:${frame.columnNumber})`;
  return frame.functionName ? `at ${frame.functionName} (${src}` : `at ${src}`;
}

const errorHandlers = [errorHandler$0, errorHandler$1];

async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      await handler(error, event, { defaultHandler });
      if (event.handled) {
        return; // Response handled
      }
    } catch(error) {
      // Handler itself thrown, log and continue
      console.error(error);
    }
  }
  // H3 will handle fallback
}

const script = `
if (!window.__NUXT_DEVTOOLS_TIME_METRIC__) {
  Object.defineProperty(window, '__NUXT_DEVTOOLS_TIME_METRIC__', {
    value: {},
    enumerable: false,
    configurable: true,
  })
}
window.__NUXT_DEVTOOLS_TIME_METRIC__.appInit = Date.now()
`;

const _EJXL5IDN3AlHBz35lpjVoFLKYQNOkLxmXHtODzuh80 = (function(nitro) {
  nitro.hooks.hook("render:html", (htmlContext) => {
    htmlContext.head.push(`<script>${script}<\/script>`);
  });
});

const rootDir = "C:/Users/E31/Downloads/project_nixty";

const appHead = {"meta":[{"name":"viewport","content":"width=device-width, initial-scale=1"},{"charset":"utf-8"}],"link":[],"style":[],"script":[{"src":"https://app.sandbox.midtrans.com/snap/snap.js","data-client-key":"SB-Mid-client-XZVBXJmESkGTZlFP"},{"src":"/midtrans-official.js","async":true}],"noscript":[],"title":"Nixty Demo"};

const appRootTag = "div";

const appRootAttrs = {"id":"__nuxt"};

const appTeleportTag = "div";

const appTeleportAttrs = {"id":"teleports"};

const appId = "nuxt-app";

const devReducers = {
  VNode: (data) => isVNode(data) ? { type: data.type, props: data.props } : void 0,
  URL: (data) => data instanceof URL ? data.toString() : void 0
};
const asyncContext = getContext("nuxt-dev", { asyncContext: true, AsyncLocalStorage });
const _H35ARFHlvWo4SuvMTRYhgXpuEpceKEe0LQioaKv9xuM = (nitroApp) => {
  const handler = nitroApp.h3App.handler;
  nitroApp.h3App.handler = (event) => {
    return asyncContext.callAsync({ logs: [], event }, () => handler(event));
  };
  onConsoleLog((_log) => {
    const ctx = asyncContext.tryUse();
    if (!ctx) {
      return;
    }
    const rawStack = captureRawStackTrace();
    if (!rawStack || rawStack.includes("runtime/vite-node.mjs")) {
      return;
    }
    const trace = [];
    let filename = "";
    for (const entry of parseRawStackTrace(rawStack)) {
      if (entry.source === globalThis._importMeta_.url) {
        continue;
      }
      if (EXCLUDE_TRACE_RE.test(entry.source)) {
        continue;
      }
      filename ||= entry.source.replace(withTrailingSlash(rootDir), "");
      trace.push({
        ...entry,
        source: entry.source.startsWith("file://") ? entry.source.replace("file://", "") : entry.source
      });
    }
    const log = {
      ..._log,
      // Pass along filename to allow the client to display more info about where log comes from
      filename,
      // Clean up file names in stack trace
      stack: trace
    };
    ctx.logs.push(log);
  });
  nitroApp.hooks.hook("afterResponse", () => {
    const ctx = asyncContext.tryUse();
    if (!ctx) {
      return;
    }
    return nitroApp.hooks.callHook("dev:ssr-logs", { logs: ctx.logs, path: ctx.event.path });
  });
  nitroApp.hooks.hook("render:html", (htmlContext) => {
    const ctx = asyncContext.tryUse();
    if (!ctx) {
      return;
    }
    try {
      const reducers = Object.assign(/* @__PURE__ */ Object.create(null), devReducers, ctx.event.context._payloadReducers);
      htmlContext.bodyAppend.unshift(`<script type="application/json" data-nuxt-logs="${appId}">${stringify(ctx.logs, reducers)}<\/script>`);
    } catch (e) {
      const shortError = e instanceof Error && "toString" in e ? ` Received \`${e.toString()}\`.` : "";
      console.warn(`[nuxt] Failed to stringify dev server logs.${shortError} You can define your own reducer/reviver for rich types following the instructions in https://nuxt.com/docs/api/composables/use-nuxt-app#payload.`);
    }
  });
};
const EXCLUDE_TRACE_RE = /\/node_modules\/(?:.*\/)?(?:nuxt|nuxt-nightly|nuxt-edge|nuxt3|consola|@vue)\/|core\/runtime\/nitro/;
function onConsoleLog(callback) {
  consola$1.addReporter({
    log(logObj) {
      callback(logObj);
    }
  });
  consola$1.wrapConsole();
}

function defineNitroPlugin(def) {
  return def;
}

const scheduledTasks$1 = false;

const tasks = {
  
};

const __runningTasks__ = {};
async function runTask(name, {
  payload = {},
  context = {}
} = {}) {
  if (__runningTasks__[name]) {
    return __runningTasks__[name];
  }
  if (!(name in tasks)) {
    throw createError({
      message: `Task \`${name}\` is not available!`,
      statusCode: 404
    });
  }
  if (!tasks[name].resolve) {
    throw createError({
      message: `Task \`${name}\` is not implemented!`,
      statusCode: 501
    });
  }
  const handler = await tasks[name].resolve();
  const taskEvent = { name, payload, context };
  __runningTasks__[name] = handler.run(taskEvent);
  try {
    const res = await __runningTasks__[name];
    return res;
  } finally {
    delete __runningTasks__[name];
  }
}

class ScheduledTasks {
  constructor() {
    this.intervals = {};
    this.isRunning = false;
  }
  // Start all scheduled tasks
  start() {
    if (this.isRunning) {
      console.log("\u26A0\uFE0F Scheduled tasks already running");
      return;
    }
    console.log("\u{1F680} Starting scheduled tasks...");
    this.isRunning = true;
    this.scheduleDaily("auto-cleanup-failed-orders", 2, 0, this.autoCleanupFailedOrders);
    console.log("\u2705 All scheduled tasks started");
  }
  // Stop all scheduled tasks
  stop() {
    console.log("\u{1F6D1} Stopping scheduled tasks...");
    Object.keys(this.intervals).forEach((taskName) => {
      clearInterval(this.intervals[taskName]);
      delete this.intervals[taskName];
    });
    this.isRunning = false;
    console.log("\u2705 All scheduled tasks stopped");
  }
  // Schedule a task to run daily at specific time
  scheduleDaily(taskName, hour, minute, taskFunction) {
    const now = /* @__PURE__ */ new Date();
    const scheduledTime = /* @__PURE__ */ new Date();
    scheduledTime.setHours(hour, minute, 0, 0);
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }
    const timeUntilFirstRun = scheduledTime.getTime() - now.getTime();
    const dailyInterval = 24 * 60 * 60 * 1e3;
    console.log(`\u{1F4C5} Scheduled ${taskName} to run daily at ${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`);
    console.log(`\u23F0 Next run: ${scheduledTime.toLocaleString()}`);
    setTimeout(() => {
      this.runTask(taskName, taskFunction);
      this.intervals[taskName] = setInterval(() => {
        this.runTask(taskName, taskFunction);
      }, dailyInterval);
    }, timeUntilFirstRun);
  }
  // Run a task with error handling and logging
  async runTask(taskName, taskFunction) {
    const startTime = /* @__PURE__ */ new Date();
    console.log(`\u{1F3C3} Starting scheduled task: ${taskName} at ${startTime.toLocaleString()}`);
    try {
      await taskFunction();
      const endTime = /* @__PURE__ */ new Date();
      const duration = endTime.getTime() - startTime.getTime();
      console.log(`\u2705 Completed task: ${taskName} in ${duration}ms`);
    } catch (error) {
      console.error(`\u274C Error in scheduled task ${taskName}:`, error);
    }
  }
  // Auto-cleanup failed orders task
  async autoCleanupFailedOrders() {
    try {
      console.log("\u{1F9F9} Running auto-cleanup of failed orders...");
      const response = await $fetch("/api/admin/auto-cleanup-failed-orders", {
        method: "POST",
        baseURL: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:3000"
      });
      if (response.success) {
        console.log(`\u2705 Auto-cleanup completed: ${response.data.deleted_count} orders deleted`);
      } else {
        console.error("\u274C Auto-cleanup failed:", response.message);
      }
    } catch (error) {
      console.error("\u274C Auto-cleanup task error:", error);
    }
  }
  // Manual trigger for testing
  async triggerCleanupNow() {
    console.log("\u{1F527} Manually triggering auto-cleanup...");
    await this.autoCleanupFailedOrders();
  }
}
const scheduledTasks = new ScheduledTasks();

const _4HUMqFuC79FtDlpwbtGd_p1URZ11naDAxBUs6hl60 = defineNitroPlugin(async (nitroApp) => {
  console.log("\u{1F680} Initializing scheduled tasks...");
  try {
    scheduledTasks.start();
    console.log("\u2705 Scheduled tasks initialized successfully");
  } catch (error) {
    console.error("\u274C Failed to initialize scheduled tasks:", error);
  }
  nitroApp.hooks.hook("close", () => {
    console.log("\u{1F6D1} Shutting down scheduled tasks...");
    scheduledTasks.stop();
  });
});

const plugins = [
  _EJXL5IDN3AlHBz35lpjVoFLKYQNOkLxmXHtODzuh80,
_H35ARFHlvWo4SuvMTRYhgXpuEpceKEe0LQioaKv9xuM,
_4HUMqFuC79FtDlpwbtGd_p1URZ11naDAxBUs6hl60
];

const useSupabase = true;
const useOnlineDB = false;
const midtransConfig = {
  isProduction: false,
  // Always use sandbox for now
  serverKey: "SB-Mid-server-0-XiKyaD4PwMJvSRl7JZbZDp",
  clientKey: "SB-Mid-client-XZVBXJmESkGTZlFP",
  merchantId: "G454677231"
};

const { Pool } = pkg;
{
  dotenv.config();
}
const mysqlConfigs = {
  local: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "nixty",
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  },
  online: {
    host: process.env.ONLINE_DB_HOST || "sql12.freesqldatabase.com",
    user: process.env.ONLINE_DB_USER || "sql12782583",
    password: process.env.ONLINE_DB_PASSWORD || "vR3ku4pQn2",
    database: process.env.ONLINE_DB_NAME || "sql12782583",
    port: process.env.ONLINE_DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  }
};
const supabaseConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  // Increased pool size
  idleTimeoutMillis: 6e4,
  // Increased idle timeout
  connectionTimeoutMillis: 3e4,
  // Significantly increased timeout
  acquireTimeoutMillis: 6e4,
  // Added acquire timeout
  query_timeout: 3e4,
  // Added query timeout
  statement_timeout: 3e4
  // Added statement timeout
};
let pool$1;
let isPostgreSQL = false;
function initializeDbConnection() {
  try {
    if (useSupabase) {
      console.log("Using SUPABASE PostgreSQL database");
      console.log(`Using direct connection string: ${supabaseConfig.connectionString ? "Yes" : "No"}`);
      if (!supabaseConfig.connectionString) {
        console.log("Connection string not found, constructing manually...");
        const connectionString = `postgresql://${process.env.SUPABASE_DB_USER}:${process.env.SUPABASE_DB_PASSWORD}@${process.env.SUPABASE_DB_HOST}:${process.env.SUPABASE_DB_PORT || 6543}/${process.env.SUPABASE_DB_NAME || "postgres"}`;
        console.log(`Constructed connection string: ${connectionString.replace(/:[^:]*@/, ":****@")}`);
        supabaseConfig.connectionString = connectionString;
      }
      pool$1 = new Pool(supabaseConfig);
      isPostgreSQL = true;
    }
    if (isPostgreSQL) {
      pool$1.on("error", (err) => {
        console.error("Unexpected PostgreSQL pool error:", err);
      });
      pool$1.query("SELECT 1").then(() => {
        console.log("PostgreSQL connection successful");
      }).catch((err) => {
        console.error("PostgreSQL connection test failed:", err);
        setTimeout(() => {
          console.log("Attempting to reconnect to PostgreSQL...");
          pool$1 = new Pool(supabaseConfig);
        }, 5e3);
      });
    }
    return pool$1;
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  }
}
pool$1 = initializeDbConnection();
const db = {
  async query(sql, params = []) {
    var _a;
    try {
      if (isPostgreSQL) {
        let pgSql = sql;
        let paramIndex = 1;
        pgSql = pgSql.replace(/\?/g, () => `$${paramIndex++}`);
        let client;
        let retries = 3;
        while (retries > 0) {
          try {
            client = await Promise.race([
              pool$1.connect(),
              new Promise(
                (_, reject) => setTimeout(() => reject(new Error("Connection timeout")), 15e3)
              )
            ]);
            break;
          } catch (connError) {
            retries--;
            console.error(`Connection attempt failed (${3 - retries}/3):`, connError.message);
            if (retries === 0) {
              console.error("All connection attempts failed");
              if (true) {
                console.log("Development mode: returning empty result instead of failing");
                return [[], []];
              }
              throw connError;
            }
            await new Promise((resolve) => setTimeout(resolve, 1e3));
          }
        }
        try {
          console.log("Executing PostgreSQL query:", pgSql);
          console.log("With parameters:", params);
          const result = await client.query(pgSql, params);
          console.log("Query result rows:", ((_a = result.rows) == null ? void 0 : _a.length) || 0);
          return [result.rows, result.fields];
        } finally {
          client.release();
        }
      } else {
        console.log("Executing MySQL query:", sql);
        console.log("With parameters:", params);
        const [rows, fields] = await pool$1.execute(sql, params);
        console.log("Query result rows:", rows.length);
        return [rows, fields];
      }
    } catch (error) {
      console.error("Database query error:", {
        message: error.message,
        code: error.code,
        detail: error.detail,
        hint: error.hint,
        sql,
        params
      });
      throw error;
    }
  },
  async execute(sql, params = []) {
    return this.query(sql, params);
  },
  // Supabase-optimized methods
  async insert(tableName, data) {
    if (isPostgreSQL) {
      const fields = Object.keys(data);
      const placeholders = fields.map((_, i) => `$${i + 1}`).join(", ");
      const values = Object.values(data);
      const fullTableName = `nixty.${tableName}`;
      const query = `INSERT INTO ${fullTableName} (${fields.join(", ")}) VALUES (${placeholders}) RETURNING *`;
      const [result] = await this.query(query, values);
      return result[0];
    } else {
      const fields = Object.keys(data);
      const placeholders = fields.map(() => "?").join(", ");
      const values = Object.values(data);
      const query = `INSERT INTO ${tableName} (${fields.join(", ")}) VALUES (${placeholders})`;
      const [result] = await this.query(query, values);
      const [fetchedRecord] = await this.query(`SELECT * FROM ${tableName} WHERE id = ?`, [result.insertId]);
      return fetchedRecord[0];
    }
  },
  async update(tableName, data, id) {
    const fields = Object.keys(data);
    const values = Object.values(data);
    values.push(id);
    if (isPostgreSQL) {
      const fullTableName = `nixty.${tableName}`;
      const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(", ");
      const query = `UPDATE ${fullTableName} SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`;
      const [result] = await this.query(query, values);
      return result[0];
    } else {
      const setClause = fields.map((field) => `${field} = ?`).join(", ");
      const query = `UPDATE ${tableName} SET ${setClause} WHERE id = ?`;
      await this.query(query, values);
      const [fetchedRecord] = await this.query(`SELECT * FROM ${tableName} WHERE id = ?`, [id]);
      return fetchedRecord[0];
    }
  },
  async select(tableName, conditions = {}, options = {}) {
    const fullTableName = isPostgreSQL ? `nixty.${tableName}` : tableName;
    let query = `SELECT * FROM ${fullTableName}`;
    const params = [];
    if (Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions).map((key, i) => {
        params.push(conditions[key]);
        return isPostgreSQL ? `${key} = $${i + 1}` : `${key} = ?`;
      }).join(" AND ");
      query += ` WHERE ${whereClause}`;
    }
    if (options.orderBy) {
      query += ` ORDER BY ${options.orderBy}`;
    }
    if (options.limit) {
      query += ` LIMIT ${options.limit}`;
    }
    const [result] = await this.query(query, params);
    return result;
  },
  // Testing connection
  async testConnection() {
    try {
      if (isPostgreSQL) {
        const [result] = await this.query("SELECT NOW() as time");
        console.log("PostgreSQL connection test successful:", result[0].time);
        return true;
      } else {
        const [result] = await this.query("SELECT NOW() as time");
        console.log("MySQL connection test successful:", result[0].time);
        return true;
      }
    } catch (error) {
      console.error("Connection test failed:", error);
      return false;
    }
  }
};

const adminAuth = defineEventHandler(async (event) => {
  const url = getRequestURL(event);
  if (!url.pathname.startsWith("/api/admin/")) {
    return;
  }
  const config = useRuntimeConfig();
  const bypassAuth = config.public.bypassAdminAuth === "true";
  if (bypassAuth) {
    console.log("Admin auth bypassed for development");
    event.node.req.headers["x-user-id"] = "dev-admin-id";
    event.node.req.headers["x-user-email"] = "dev-admin@example.com";
    return;
  }
  console.log("Admin auth middleware active - Environment:", "development");
  console.log("Bypass auth setting:", config.public.bypassAdminAuth);
  const headers = getHeaders(event);
  const userId = headers["x-user-id"];
  const userEmail = headers["x-user-email"];
  console.log("Admin auth headers received:", {
    hasUserId: !!userId,
    hasUserEmail: !!userEmail,
    userId: userId ? userId.substring(0, 3) + "***" : "none",
    userEmail: userEmail ? userEmail.substring(0, 3) + "***" : "none"
  });
  if (!userId || !userEmail) {
    console.log("Missing authentication headers");
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication required - Missing user credentials"
    });
  }
  try {
    const [users] = await db.query(
      "SELECT account_type FROM nixty.users WHERE id = ? AND email = ? LIMIT 1",
      [userId, userEmail]
    );
    const isAdmin = users && users.length > 0 && users[0].account_type === "admin";
    if (!isAdmin) {
      throw createError({
        statusCode: 403,
        statusMessage: "Admin access required"
      });
    }
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    console.error("Error checking admin status:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to validate admin status"
    });
  }
});

const rateLimitStore = /* @__PURE__ */ new Map();
const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  maxRequests: 100,
  // Max 100 requests per window per IP
  adminWindowMs: 5 * 60 * 1e3,
  // 5 minutes for admin endpoints
  adminMaxRequests: 50
  // Max 50 requests per window for admin endpoints
};
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}
function getRateLimitInfo(ip, isAdmin = false) {
  const key = `${ip}:${isAdmin ? "admin" : "general"}`;
  const now = Date.now();
  const windowMs = isAdmin ? RATE_LIMIT_CONFIG.adminWindowMs : RATE_LIMIT_CONFIG.windowMs;
  const maxRequests = isAdmin ? RATE_LIMIT_CONFIG.adminMaxRequests : RATE_LIMIT_CONFIG.maxRequests;
  let rateLimitData = rateLimitStore.get(key);
  if (!rateLimitData || now > rateLimitData.resetTime) {
    rateLimitData = {
      count: 0,
      resetTime: now + windowMs,
      maxRequests
    };
    rateLimitStore.set(key, rateLimitData);
  }
  return rateLimitData;
}
function shouldRateLimit(ip, isAdmin = false) {
  const rateLimitData = getRateLimitInfo(ip, isAdmin);
  if (rateLimitData.count >= rateLimitData.maxRequests) {
    return {
      limited: true,
      resetTime: rateLimitData.resetTime,
      remaining: 0,
      total: rateLimitData.maxRequests
    };
  }
  rateLimitData.count++;
  return {
    limited: false,
    resetTime: rateLimitData.resetTime,
    remaining: rateLimitData.maxRequests - rateLimitData.count,
    total: rateLimitData.maxRequests
  };
}
function getClientIP$1(event) {
  var _a;
  const headers = [
    "x-forwarded-for",
    "x-real-ip",
    "x-client-ip",
    "cf-connecting-ip"
  ];
  for (const header of headers) {
    const value = getHeader(event, header);
    if (value) {
      return value.split(",")[0].trim();
    }
  }
  return ((_a = event.node.req.socket) == null ? void 0 : _a.remoteAddress) || "unknown";
}
const excludedPaths = [
  "/api/home-page",
  "/api/products/group/",
  // Exclude product group lookups
  "/api/products/"
  // Exclude single product lookups by slug/id
];
const _cv8hLe = defineEventHandler(async (event) => {
  const url = event.node.req.url || "";
  if (!url.startsWith("/api/")) {
    return;
  }
  if (excludedPaths.some((path) => url.startsWith(path))) {
    return;
  }
  if (Math.random() < 0.01) {
    cleanupExpiredEntries();
  }
  const isAdminEndpoint = url.startsWith("/api/admin/");
  const clientIP = getClientIP$1(event);
  const rateLimitResult = shouldRateLimit(clientIP, isAdminEndpoint);
  setHeader(event, "X-RateLimit-Limit", rateLimitResult.total.toString());
  setHeader(event, "X-RateLimit-Remaining", rateLimitResult.remaining.toString());
  setHeader(event, "X-RateLimit-Reset", Math.ceil(rateLimitResult.resetTime / 1e3).toString());
  if (rateLimitResult.limited) {
    const retryAfter = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1e3);
    setHeader(event, "Retry-After", retryAfter.toString());
    throw createError({
      statusCode: 429,
      statusMessage: "Too Many Requests",
      data: {
        error: "Rate limit exceeded",
        retryAfter,
        limit: rateLimitResult.total,
        resetTime: rateLimitResult.resetTime
      }
    });
  }
});

const _5JBCIF = defineEventHandler(async (event) => {
  if (event.node.req.method !== "GET") {
    return;
  }
  const url = event.node.req.url || "";
  if (url.startsWith("/api/") || url.startsWith("/_nuxt/") || url.startsWith("/assets/")) {
    return;
  }
  let cacheControl = "public, max-age=60, s-maxage=60";
  if (url === "/" || url === "/index.html") {
    cacheControl = "public, max-age=300, s-maxage=300";
  } else if (url.startsWith("/static/") || url.startsWith("/assets/")) {
    cacheControl = "public, max-age=31536000, s-maxage=31536000, immutable";
  } else if (url.startsWith("/profile/")) {
    cacheControl = "public, max-age=300, s-maxage=300";
  } else if (url.startsWith("/admin/")) {
    cacheControl = "public, max-age=30, s-maxage=30";
  } else if (url.startsWith("/dashboard/")) {
    cacheControl = "public, max-age=120, s-maxage=120";
  } else if (url.startsWith("/posts/") || url.startsWith("/articles/")) {
    cacheControl = "public, max-age=1800, s-maxage=1800";
  }
  const headers = {
    "Cache-Control": cacheControl,
    "Vary": "Accept-Encoding"
  };
  {
    const etagValue = `"${Buffer.from(url).toString("base64").slice(0, 16)}"`;
    headers["ETag"] = etagValue;
    const ifNoneMatch = event.node.req.headers["if-none-match"];
    if (ifNoneMatch === etagValue) {
      event.node.res.statusCode = 304;
      setResponseHeaders(event, headers);
      return;
    }
  }
  {
    headers["Last-Modified"] = (/* @__PURE__ */ new Date()).toUTCString();
  }
  headers["X-Content-Type-Options"] = "nosniff";
  headers["X-Frame-Options"] = "DENY";
  headers["X-XSS-Protection"] = "1; mode=block";
  setResponseHeaders(event, headers);
});

const VueResolver = (_, value) => {
  return isRef(value) ? toValue(value) : value;
};

const headSymbol = "usehead";
function vueInstall(head) {
  const plugin = {
    install(app) {
      app.config.globalProperties.$unhead = head;
      app.config.globalProperties.$head = head;
      app.provide(headSymbol, head);
    }
  };
  return plugin.install;
}

function resolveUnrefHeadInput(input) {
  return walkResolver(input, VueResolver);
}

function createHead(options = {}) {
  const head = createHead$1({
    ...options,
    propResolvers: [VueResolver]
  });
  head.install = vueInstall(head);
  return head;
}

const unheadOptions = {
  disableDefaults: true,
  disableCapoSorting: false,
  plugins: [DeprecationsPlugin, PromisesPlugin, TemplateParamsPlugin, AliasSortingPlugin],
};

function createSSRContext(event) {
  const ssrContext = {
    url: event.path,
    event,
    runtimeConfig: useRuntimeConfig(event),
    noSSR: event.context.nuxt?.noSSR || (false),
    head: createHead(unheadOptions),
    error: false,
    nuxt: void 0,
    /* NuxtApp */
    payload: {},
    _payloadReducers: /* @__PURE__ */ Object.create(null),
    modules: /* @__PURE__ */ new Set()
  };
  return ssrContext;
}
function setSSRError(ssrContext, error) {
  ssrContext.error = true;
  ssrContext.payload = { error };
  ssrContext.url = error.url;
}

function buildAssetsDir() {
  return useRuntimeConfig().app.buildAssetsDir;
}
function buildAssetsURL(...path) {
  return joinRelativeURL(publicAssetsURL(), buildAssetsDir(), ...path);
}
function publicAssetsURL(...path) {
  const app = useRuntimeConfig().app;
  const publicBase = app.cdnURL || app.baseURL;
  return path.length ? joinRelativeURL(publicBase, ...path) : publicBase;
}

const APP_ROOT_OPEN_TAG = `<${appRootTag}${propsToString(appRootAttrs)}>`;
const APP_ROOT_CLOSE_TAG = `</${appRootTag}>`;
const getServerEntry = () => import('file://C:/Users/E31/Downloads/project_nixty/.nuxt/dist/server/server.mjs').then((r) => r.default || r);
const getClientManifest = () => import('file://C:/Users/E31/Downloads/project_nixty/.nuxt/dist/server/client.manifest.mjs').then((r) => r.default || r).then((r) => typeof r === "function" ? r() : r);
const getSSRRenderer = lazyCachedFunction(async () => {
  const manifest = await getClientManifest();
  if (!manifest) {
    throw new Error("client.manifest is not available");
  }
  const createSSRApp = await getServerEntry();
  if (!createSSRApp) {
    throw new Error("Server bundle is not available");
  }
  const options = {
    manifest,
    renderToString: renderToString$1,
    buildAssetsURL
  };
  const renderer = createRenderer(createSSRApp, options);
  async function renderToString$1(input, context) {
    const html = await renderToString(input, context);
    if (process.env.NUXT_VITE_NODE_OPTIONS) {
      renderer.rendererContext.updateManifest(await getClientManifest());
    }
    return APP_ROOT_OPEN_TAG + html + APP_ROOT_CLOSE_TAG;
  }
  return renderer;
});
const getSPARenderer = lazyCachedFunction(async () => {
  const manifest = await getClientManifest();
  const spaTemplate = await Promise.resolve().then(function () { return _virtual__spaTemplate; }).then((r) => r.template).catch(() => "").then((r) => {
    {
      return APP_ROOT_OPEN_TAG + r + APP_ROOT_CLOSE_TAG;
    }
  });
  const options = {
    manifest,
    renderToString: () => spaTemplate,
    buildAssetsURL
  };
  const renderer = createRenderer(() => () => {
  }, options);
  const result = await renderer.renderToString({});
  const renderToString = (ssrContext) => {
    const config = useRuntimeConfig(ssrContext.event);
    ssrContext.modules ||= /* @__PURE__ */ new Set();
    ssrContext.payload.serverRendered = false;
    ssrContext.config = {
      public: config.public,
      app: config.app
    };
    return Promise.resolve(result);
  };
  return {
    rendererContext: renderer.rendererContext,
    renderToString
  };
});
function lazyCachedFunction(fn) {
  let res = null;
  return () => {
    if (res === null) {
      res = fn().catch((err) => {
        res = null;
        throw err;
      });
    }
    return res;
  };
}
function getRenderer(ssrContext) {
  return ssrContext.noSSR ? getSPARenderer() : getSSRRenderer();
}
const getSSRStyles = lazyCachedFunction(() => Promise.resolve().then(function () { return styles$1; }).then((r) => r.default || r));

async function renderInlineStyles(usedModules) {
  const styleMap = await getSSRStyles();
  const inlinedStyles = /* @__PURE__ */ new Set();
  for (const mod of usedModules) {
    if (mod in styleMap && styleMap[mod]) {
      for (const style of await styleMap[mod]()) {
        inlinedStyles.add(style);
      }
    }
  }
  return Array.from(inlinedStyles).map((style) => ({ innerHTML: style }));
}

const ROOT_NODE_REGEX = new RegExp(`^<${appRootTag}[^>]*>([\\s\\S]*)<\\/${appRootTag}>$`);
function getServerComponentHTML(body) {
  const match = body.match(ROOT_NODE_REGEX);
  return match?.[1] || body;
}
const SSR_SLOT_TELEPORT_MARKER = /^uid=([^;]*);slot=(.*)$/;
const SSR_CLIENT_TELEPORT_MARKER = /^uid=([^;]*);client=(.*)$/;
const SSR_CLIENT_SLOT_MARKER = /^island-slot=([^;]*);(.*)$/;
function getSlotIslandResponse(ssrContext) {
  if (!ssrContext.islandContext || !Object.keys(ssrContext.islandContext.slots).length) {
    return void 0;
  }
  const response = {};
  for (const [name, slot] of Object.entries(ssrContext.islandContext.slots)) {
    response[name] = {
      ...slot,
      fallback: ssrContext.teleports?.[`island-fallback=${name}`]
    };
  }
  return response;
}
function getClientIslandResponse(ssrContext) {
  if (!ssrContext.islandContext || !Object.keys(ssrContext.islandContext.components).length) {
    return void 0;
  }
  const response = {};
  for (const [clientUid, component] of Object.entries(ssrContext.islandContext.components)) {
    const html = ssrContext.teleports?.[clientUid]?.replaceAll("<!--teleport start anchor-->", "") || "";
    response[clientUid] = {
      ...component,
      html,
      slots: getComponentSlotTeleport(clientUid, ssrContext.teleports ?? {})
    };
  }
  return response;
}
function getComponentSlotTeleport(clientUid, teleports) {
  const entries = Object.entries(teleports);
  const slots = {};
  for (const [key, value] of entries) {
    const match = key.match(SSR_CLIENT_SLOT_MARKER);
    if (match) {
      const [, id, slot] = match;
      if (!slot || clientUid !== id) {
        continue;
      }
      slots[slot] = value;
    }
  }
  return slots;
}
function replaceIslandTeleports(ssrContext, html) {
  const { teleports, islandContext } = ssrContext;
  if (islandContext || !teleports) {
    return html;
  }
  for (const key in teleports) {
    const matchClientComp = key.match(SSR_CLIENT_TELEPORT_MARKER);
    if (matchClientComp) {
      const [, uid, clientId] = matchClientComp;
      if (!uid || !clientId) {
        continue;
      }
      html = html.replace(new RegExp(` data-island-uid="${uid}" data-island-component="${clientId}"[^>]*>`), (full) => {
        return full + teleports[key];
      });
      continue;
    }
    const matchSlot = key.match(SSR_SLOT_TELEPORT_MARKER);
    if (matchSlot) {
      const [, uid, slot] = matchSlot;
      if (!uid || !slot) {
        continue;
      }
      html = html.replace(new RegExp(` data-island-uid="${uid}" data-island-slot="${slot}"[^>]*>`), (full) => {
        return full + teleports[key];
      });
    }
  }
  return html;
}

const ISLAND_SUFFIX_RE = /\.json(\?.*)?$/;
const _SxA8c9 = defineEventHandler(async (event) => {
  const nitroApp = useNitroApp();
  setResponseHeaders(event, {
    "content-type": "application/json;charset=utf-8",
    "x-powered-by": "Nuxt"
  });
  const islandContext = await getIslandContext(event);
  const ssrContext = {
    ...createSSRContext(event),
    islandContext,
    noSSR: false,
    url: islandContext.url
  };
  const renderer = await getSSRRenderer();
  const renderResult = await renderer.renderToString(ssrContext).catch(async (error) => {
    await ssrContext.nuxt?.hooks.callHook("app:error", error);
    throw error;
  });
  const inlinedStyles = await renderInlineStyles(ssrContext.modules ?? []);
  await ssrContext.nuxt?.hooks.callHook("app:rendered", { ssrContext, renderResult });
  if (inlinedStyles.length) {
    ssrContext.head.push({ style: inlinedStyles });
  }
  {
    const { styles } = getRequestDependencies(ssrContext, renderer.rendererContext);
    const link = [];
    for (const resource of Object.values(styles)) {
      if ("inline" in getQuery(resource.file)) {
        continue;
      }
      if (resource.file.includes("scoped") && !resource.file.includes("pages/")) {
        link.push({ rel: "stylesheet", href: renderer.rendererContext.buildAssetsURL(resource.file), crossorigin: "" });
      }
    }
    if (link.length) {
      ssrContext.head.push({ link }, { mode: "server" });
    }
  }
  const islandHead = {};
  for (const entry of ssrContext.head.entries.values()) {
    for (const [key, value] of Object.entries(resolveUnrefHeadInput(entry.input))) {
      const currentValue = islandHead[key];
      if (Array.isArray(currentValue)) {
        currentValue.push(...value);
      }
      islandHead[key] = value;
    }
  }
  islandHead.link ||= [];
  islandHead.style ||= [];
  const islandResponse = {
    id: islandContext.id,
    head: islandHead,
    html: getServerComponentHTML(renderResult.html),
    components: getClientIslandResponse(ssrContext),
    slots: getSlotIslandResponse(ssrContext)
  };
  await nitroApp.hooks.callHook("render:island", islandResponse, { event, islandContext });
  return islandResponse;
});
async function getIslandContext(event) {
  let url = event.path || "";
  const componentParts = url.substring("/__nuxt_island".length + 1).replace(ISLAND_SUFFIX_RE, "").split("_");
  const hashId = componentParts.length > 1 ? componentParts.pop() : void 0;
  const componentName = componentParts.join("_");
  const context = event.method === "GET" ? getQuery$1(event) : await readBody(event);
  const ctx = {
    url: "/",
    ...context,
    id: hashId,
    name: componentName,
    props: destr$1(context.props) || {},
    slots: {},
    components: {}
  };
  return ctx;
}

const _lazy_MoI1it = () => Promise.resolve().then(function () { return addQuantityColumn_get$1; });
const _lazy_T9lMbO = () => Promise.resolve().then(function () { return authCredentialsInfo_get$1; });
const _lazy_NKGfeR = () => Promise.resolve().then(function () { return autoCleanupFailedOrders_post$1; });
const _lazy_e78O9y = () => Promise.resolve().then(function () { return available_get$1; });
const _lazy_ef6dVZ = () => Promise.resolve().then(function () { return chartStats_get$1; });
const _lazy_cLWnZn = () => Promise.resolve().then(function () { return checkTransaction_get$1; });
const _lazy_2MWlm4 = () => Promise.resolve().then(function () { return checkTransactionsTable_get$1; });
const _lazy_7K0pU0 = () => Promise.resolve().then(function () { return cleanupNotFoundTransactions_get$1; });
const _lazy_0FUp3i = () => Promise.resolve().then(function () { return cleanupPendingTransactions_get$1; });
const _lazy_86JI9G = () => Promise.resolve().then(function () { return debugAuth_get$1; });
const _lazy_G34eqs = () => Promise.resolve().then(function () { return deleteImage_delete$1; });
const _lazy_MDjFuw = () => Promise.resolve().then(function () { return fixProductSlugs_get$1; });
const _lazy_2anayJ = () => Promise.resolve().then(function () { return fixTransactionsTable_get$1; });
const _lazy_XsXi3h = () => Promise.resolve().then(function () { return licenseDeliveryStats_get$1; });
const _lazy_eRya6P = () => Promise.resolve().then(function () { return massAdd_post$3; });
const _lazy_QLhgDc = () => Promise.resolve().then(function () { return overview_get$1; });
const _lazy_CSFMeB = () => Promise.resolve().then(function () { return productLicenses_post$1; });
const _lazy_Yab7RA = () => Promise.resolve().then(function () { return use_post$1; });
const _lazy_OXzz7E = () => Promise.resolve().then(function () { return productNamesVersions$1; });
const _lazy_f_Svwf = () => Promise.resolve().then(function () { return retryFailedDeliveries_post$1; });
const _lazy_4iMy8R = () => Promise.resolve().then(function () { return retryLicenseDelivery_post$1; });
const _lazy_R8m6KC = () => Promise.resolve().then(function () { return tableMetadata_get$1; });
const _lazy_fVTCsr = () => Promise.resolve().then(function () { return tables_get$1; });
const _lazy_Ik2BdP = () => Promise.resolve().then(function () { return _table__get$1; });
const _lazy_DV6WhN = () => Promise.resolve().then(function () { return _table__post$1; });
const _lazy_pQZ0Vo = () => Promise.resolve().then(function () { return _id__delete$1; });
const _lazy_ZERhmF = () => Promise.resolve().then(function () { return _id__put$1; });
const _lazy_xyYl84 = () => Promise.resolve().then(function () { return massAdd_post$1; });
const _lazy__UbJWm = () => Promise.resolve().then(function () { return testEmail_get$1; });
const _lazy_mF7v2e = () => Promise.resolve().then(function () { return transactionStatus_get$1; });
const _lazy_rD2GRl = () => Promise.resolve().then(function () { return transactions_get$1; });
const _lazy_3nQAn9 = () => Promise.resolve().then(function () { return stats_get$1; });
const _lazy_WIrWki = () => Promise.resolve().then(function () { return triggerCleanup_post$1; });
const _lazy_OT6j8u = () => Promise.resolve().then(function () { return updateCategorySlugs_get$1; });
const _lazy_aS2yZX = () => Promise.resolve().then(function () { return updateProductSlugs_get$1; });
const _lazy_KZlhAS = () => Promise.resolve().then(function () { return updateStock_post$1; });
const _lazy_W4mwwb = () => Promise.resolve().then(function () { return uploadImage_post$1; });
const _lazy_k8XrGD = () => Promise.resolve().then(function () { return index_get$d; });
const _lazy_z6Vm9t = () => Promise.resolve().then(function () { return googleLogin_post$1; });
const _lazy_m3N0r7 = () => Promise.resolve().then(function () { return googleRegister_post$1; });
const _lazy_3CuRzr = () => Promise.resolve().then(function () { return categories_get$1; });
const _lazy_RAlsKj = () => Promise.resolve().then(function () { return initiate_post$1; });
const _lazy_Xu1hn8 = () => Promise.resolve().then(function () { return webhook_post$1; });
const _lazy__AJEaD = () => Promise.resolve().then(function () { return index_get$b; });
const _lazy_w5Xc92 = () => Promise.resolve().then(function () { return forgotPassword_post$1; });
const _lazy_hC4PKB = () => Promise.resolve().then(function () { return index_get$9; });
const _lazy_uR48Lt = () => Promise.resolve().then(function () { return homePageSimple_get$1; });
const _lazy_yUbGD2 = () => Promise.resolve().then(function () { return index_get$7; });
const _lazy_QuqfjW = () => Promise.resolve().then(function () { return login_post$1; });
const _lazy_uLN7g6 = () => Promise.resolve().then(function () { return notificationWithSchemaFixed_post$1; });
const _lazy_nZ4mLL = () => Promise.resolve().then(function () { return notificationWithSchema_post$1; });
const _lazy_b3hmwQ = () => Promise.resolve().then(function () { return notification_post$1; });
const _lazy_D3c0m2 = () => Promise.resolve().then(function () { return status_get$1; });
const _lazy_hIphPE = () => Promise.resolve().then(function () { return _id__get$7; });
const _lazy_bGVUju = () => Promise.resolve().then(function () { return autoCleanup_post$1; });
const _lazy_ezqliI = () => Promise.resolve().then(function () { return deleteNotFound_post$1; });
const _lazy_9o2e8r = () => Promise.resolve().then(function () { return getLicense_post$3; });
const _lazy_Xmr6Nv = () => Promise.resolve().then(function () { return getTransactionId_post$1; });
const _lazy_s9P0YJ = () => Promise.resolve().then(function () { return index_get$5; });
const _lazy_NaHr_D = () => Promise.resolve().then(function () { return processLicense_post$1; });
const _lazy_N5wDRL = () => Promise.resolve().then(function () { return repay_post$1; });
const _lazy_0UVKDP = () => Promise.resolve().then(function () { return syncAll_post$1; });
const _lazy_743kTJ = () => Promise.resolve().then(function () { return updateStatus_post$1; });
const _lazy_HDd9Rh = () => Promise.resolve().then(function () { return autoProcessLicense_post$1; });
const _lazy_tHSdxX = () => Promise.resolve().then(function () { return products_get$1; });
const _lazy_QIyrLO = () => Promise.resolve().then(function () { return _slug__get$3; });
const _lazy_aaQuDS = () => Promise.resolve().then(function () { return checkout_get$1; });
const _lazy_hQxbJj = () => Promise.resolve().then(function () { return detail$1; });
const _lazy_8zEp7Y = () => Promise.resolve().then(function () { return details_get$1; });
const _lazy_hF1kPA = () => Promise.resolve().then(function () { return _slug__get$1; });
const _lazy_aymUs9 = () => Promise.resolve().then(function () { return index$1; });
const _lazy_PeO_v8 = () => Promise.resolve().then(function () { return _id_Fixed_get$1; });
const _lazy_JYvwIo = () => Promise.resolve().then(function () { return _id__get$5; });
const _lazy_8ejs_a = () => Promise.resolve().then(function () { return changePassword_post$1; });
const _lazy_BA_blJ = () => Promise.resolve().then(function () { return index_get$3; });
const _lazy_eBtE7B = () => Promise.resolve().then(function () { return _id__get$3; });
const _lazy_GRUlhD = () => Promise.resolve().then(function () { return getLicense_post$1; });
const _lazy_svNcQc = () => Promise.resolve().then(function () { return update_post$1; });
const _lazy_XCBPWA = () => Promise.resolve().then(function () { return register_post$1; });
const _lazy_j3SzRz = () => Promise.resolve().then(function () { return resetPassword_post$1; });
const _lazy_fZlSOF = () => Promise.resolve().then(function () { return index_get$1; });
const _lazy_0rneVw = () => Promise.resolve().then(function () { return setupMissingTables_get$1; });
const _lazy_Gaj65q = () => Promise.resolve().then(function () { return _id__get$1; });
const _lazy_rBGm5E = () => Promise.resolve().then(function () { return renderer$1; });

const handlers = [
  { route: '', handler: adminAuth, lazy: false, middleware: true, method: undefined },
  { route: '', handler: _cv8hLe, lazy: false, middleware: true, method: undefined },
  { route: '', handler: _5JBCIF, lazy: false, middleware: true, method: undefined },
  { route: '/api/admin/add-quantity-column', handler: _lazy_MoI1it, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/auth-credentials-info', handler: _lazy_T9lMbO, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/auto-cleanup-failed-orders', handler: _lazy_NKGfeR, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/categories/available', handler: _lazy_e78O9y, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/chart-stats', handler: _lazy_ef6dVZ, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/check-transaction', handler: _lazy_cLWnZn, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/check-transactions-table', handler: _lazy_2MWlm4, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/cleanup-not-found-transactions', handler: _lazy_7K0pU0, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/cleanup-pending-transactions', handler: _lazy_0FUp3i, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/debug-auth', handler: _lazy_86JI9G, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/delete-image', handler: _lazy_G34eqs, lazy: true, middleware: false, method: "delete" },
  { route: '/api/admin/fix-product-slugs', handler: _lazy_MDjFuw, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/fix-transactions-table', handler: _lazy_2anayJ, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/license-delivery-stats', handler: _lazy_XsXi3h, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/mass-add', handler: _lazy_eRya6P, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/overview', handler: _lazy_QLhgDc, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/product-licenses', handler: _lazy_CSFMeB, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/product-licenses/use', handler: _lazy_Yab7RA, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/product-names-versions', handler: _lazy_OXzz7E, lazy: true, middleware: false, method: undefined },
  { route: '/api/admin/retry-failed-deliveries', handler: _lazy_f_Svwf, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/retry-license-delivery', handler: _lazy_4iMy8R, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/table-metadata', handler: _lazy_R8m6KC, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/tables', handler: _lazy_fVTCsr, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/tables/:table', handler: _lazy_Ik2BdP, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/tables/:table', handler: _lazy_DV6WhN, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/tables/:table/:id', handler: _lazy_pQZ0Vo, lazy: true, middleware: false, method: "delete" },
  { route: '/api/admin/tables/:table/:id', handler: _lazy_ZERhmF, lazy: true, middleware: false, method: "put" },
  { route: '/api/admin/tables/massAdd', handler: _lazy_xyYl84, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/test-email', handler: _lazy__UbJWm, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/transaction-status', handler: _lazy_mF7v2e, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/transactions', handler: _lazy_rD2GRl, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/transactions/stats', handler: _lazy_3nQAn9, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/trigger-cleanup', handler: _lazy_WIrWki, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/update-category-slugs', handler: _lazy_OT6j8u, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/update-product-slugs', handler: _lazy_aS2yZX, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/update-stock', handler: _lazy_KZlhAS, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/upload-image', handler: _lazy_W4mwwb, lazy: true, middleware: false, method: "post" },
  { route: '/api/announcements', handler: _lazy_k8XrGD, lazy: true, middleware: false, method: "get" },
  { route: '/api/auth/google-login', handler: _lazy_z6Vm9t, lazy: true, middleware: false, method: "post" },
  { route: '/api/auth/google-register', handler: _lazy_m3N0r7, lazy: true, middleware: false, method: "post" },
  { route: '/api/categories', handler: _lazy_3CuRzr, lazy: true, middleware: false, method: "get" },
  { route: '/api/checkout/initiate', handler: _lazy_RAlsKj, lazy: true, middleware: false, method: "post" },
  { route: '/api/checkout/webhook', handler: _lazy_Xu1hn8, lazy: true, middleware: false, method: "post" },
  { route: '/api/deals', handler: _lazy__AJEaD, lazy: true, middleware: false, method: "get" },
  { route: '/api/forgot-password', handler: _lazy_w5Xc92, lazy: true, middleware: false, method: "post" },
  { route: '/api/hero-slides', handler: _lazy_hC4PKB, lazy: true, middleware: false, method: "get" },
  { route: '/api/home-page-simple', handler: _lazy_uR48Lt, lazy: true, middleware: false, method: "get" },
  { route: '/api/home-page', handler: _lazy_yUbGD2, lazy: true, middleware: false, method: "get" },
  { route: '/api/login', handler: _lazy_QuqfjW, lazy: true, middleware: false, method: "post" },
  { route: '/api/midtrans/notification-with-schema-fixed', handler: _lazy_uLN7g6, lazy: true, middleware: false, method: "post" },
  { route: '/api/midtrans/notification-with-schema', handler: _lazy_nZ4mLL, lazy: true, middleware: false, method: "post" },
  { route: '/api/midtrans/notification', handler: _lazy_b3hmwQ, lazy: true, middleware: false, method: "post" },
  { route: '/api/midtrans/status', handler: _lazy_D3c0m2, lazy: true, middleware: false, method: "get" },
  { route: '/api/orders/:id', handler: _lazy_hIphPE, lazy: true, middleware: false, method: "get" },
  { route: '/api/orders/auto-cleanup', handler: _lazy_bGVUju, lazy: true, middleware: false, method: "post" },
  { route: '/api/orders/delete-not-found', handler: _lazy_ezqliI, lazy: true, middleware: false, method: "post" },
  { route: '/api/orders/get-license', handler: _lazy_9o2e8r, lazy: true, middleware: false, method: "post" },
  { route: '/api/orders/get-transaction-id', handler: _lazy_Xmr6Nv, lazy: true, middleware: false, method: "post" },
  { route: '/api/orders', handler: _lazy_s9P0YJ, lazy: true, middleware: false, method: "get" },
  { route: '/api/orders/process-license', handler: _lazy_NaHr_D, lazy: true, middleware: false, method: "post" },
  { route: '/api/orders/repay', handler: _lazy_N5wDRL, lazy: true, middleware: false, method: "post" },
  { route: '/api/orders/sync-all', handler: _lazy_0UVKDP, lazy: true, middleware: false, method: "post" },
  { route: '/api/orders/update-status', handler: _lazy_743kTJ, lazy: true, middleware: false, method: "post" },
  { route: '/api/payment/auto-process-license', handler: _lazy_HDd9Rh, lazy: true, middleware: false, method: "post" },
  { route: '/api/products', handler: _lazy_tHSdxX, lazy: true, middleware: false, method: "get" },
  { route: '/api/products/:slug', handler: _lazy_QIyrLO, lazy: true, middleware: false, method: "get" },
  { route: '/api/products/checkout', handler: _lazy_aaQuDS, lazy: true, middleware: false, method: "get" },
  { route: '/api/products/detail', handler: _lazy_hQxbJj, lazy: true, middleware: false, method: undefined },
  { route: '/api/products/details', handler: _lazy_8zEp7Y, lazy: true, middleware: false, method: "get" },
  { route: '/api/products/group/:slug', handler: _lazy_hF1kPA, lazy: true, middleware: false, method: "get" },
  { route: '/api/products', handler: _lazy_aymUs9, lazy: true, middleware: false, method: undefined },
  { route: '/api/products/stock/:id-fixed', handler: _lazy_PeO_v8, lazy: true, middleware: false, method: "get" },
  { route: '/api/products/stock/:id', handler: _lazy_JYvwIo, lazy: true, middleware: false, method: "get" },
  { route: '/api/profile/change-password', handler: _lazy_8ejs_a, lazy: true, middleware: false, method: "post" },
  { route: '/api/profile', handler: _lazy_BA_blJ, lazy: true, middleware: false, method: "get" },
  { route: '/api/profile/transactions/:id', handler: _lazy_eBtE7B, lazy: true, middleware: false, method: "get" },
  { route: '/api/profile/transactions/get-license', handler: _lazy_GRUlhD, lazy: true, middleware: false, method: "post" },
  { route: '/api/profile/update', handler: _lazy_svNcQc, lazy: true, middleware: false, method: "post" },
  { route: '/api/register', handler: _lazy_XCBPWA, lazy: true, middleware: false, method: "post" },
  { route: '/api/reset-password', handler: _lazy_j3SzRz, lazy: true, middleware: false, method: "post" },
  { route: '/api/search', handler: _lazy_fZlSOF, lazy: true, middleware: false, method: "get" },
  { route: '/api/setup-missing-tables', handler: _lazy_0rneVw, lazy: true, middleware: false, method: "get" },
  { route: '/api/transactions/license-status/:id', handler: _lazy_Gaj65q, lazy: true, middleware: false, method: "get" },
  { route: '/__nuxt_error', handler: _lazy_rBGm5E, lazy: true, middleware: false, method: undefined },
  { route: '/__nuxt_island/**', handler: _SxA8c9, lazy: false, middleware: false, method: undefined },
  { route: '/**', handler: _lazy_rBGm5E, lazy: true, middleware: false, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const captureError = (error, context = {}) => {
    const promise = hooks.callHookParallel("error", error, context).catch((error_) => {
      console.error("Error while capturing another error", error_);
    });
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };
  const h3App = createApp({
    debug: destr(true),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error, event);
    },
    onRequest: async (event) => {
      event.context.nitro = event.context.nitro || { errors: [] };
      const fetchContext = event.node.req?.__unenv__;
      if (fetchContext?._platform) {
        event.context = {
          _platform: fetchContext?._platform,
          // #3335
          ...fetchContext._platform,
          ...event.context
        };
      }
      if (!event.context.waitUntil && fetchContext?.waitUntil) {
        event.context.waitUntil = fetchContext.waitUntil;
      }
      event.fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = (req, init) => fetchWithEvent(event, req, init, {
        fetch: $fetch
      });
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (event.context.waitUntil) {
          event.context.waitUntil(promise);
        }
      };
      event.captureError = (error, context) => {
        captureError(error, { event, ...context });
      };
      await nitroApp$1.hooks.callHook("request", event).catch((error) => {
        captureError(error, { event, tags: ["request"] });
      });
    },
    onBeforeResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("beforeResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    },
    onAfterResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("afterResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    }
  });
  const router = createRouter$1({
    preemptive: true
  });
  const nodeHandler = toNodeListener(h3App);
  const localCall = (aRequest) => callNodeRequestHandler(nodeHandler, aRequest);
  const localFetch = (input, init) => {
    if (!input.toString().startsWith("/")) {
      return globalThis.fetch(input, init);
    }
    return fetchNodeRequestHandler(
      nodeHandler,
      input,
      init
    ).then((response) => normalizeFetchResponse(response));
  };
  const $fetch = createFetch({
    fetch: localFetch,
    Headers: Headers$1,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  h3App.use(createRouteRulesHandler({ localFetch }));
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router.handler);
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError
  };
  return app;
}
function runNitroPlugins(nitroApp2) {
  for (const plugin of plugins) {
    try {
      plugin(nitroApp2);
    } catch (error) {
      nitroApp2.captureError(error, { tags: ["plugin"] });
      throw error;
    }
  }
}
const nitroApp$1 = createNitroApp();
function useNitroApp() {
  return nitroApp$1;
}
runNitroPlugins(nitroApp$1);

function defineRenderHandler(render) {
  const runtimeConfig = useRuntimeConfig();
  return eventHandler(async (event) => {
    const nitroApp = useNitroApp();
    const ctx = { event, render, response: void 0 };
    await nitroApp.hooks.callHook("render:before", ctx);
    if (!ctx.response) {
      if (event.path === `${runtimeConfig.app.baseURL}favicon.ico`) {
        setResponseHeader(event, "Content-Type", "image/x-icon");
        return send(
          event,
          "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        );
      }
      ctx.response = await ctx.render(event);
      if (!ctx.response) {
        const _currentStatus = getResponseStatus(event);
        setResponseStatus(event, _currentStatus === 200 ? 500 : _currentStatus);
        return send(
          event,
          "No response returned from render handler: " + event.path
        );
      }
    }
    await nitroApp.hooks.callHook("render:response", ctx.response, ctx);
    if (ctx.response.headers) {
      setResponseHeaders(event, ctx.response.headers);
    }
    if (ctx.response.statusCode || ctx.response.statusMessage) {
      setResponseStatus(
        event,
        ctx.response.statusCode,
        ctx.response.statusMessage
      );
    }
    return ctx.response.body;
  });
}

if (!globalThis.crypto) {
  globalThis.crypto = crypto;
}
const { NITRO_NO_UNIX_SOCKET, NITRO_DEV_WORKER_ID } = process.env;
trapUnhandledNodeErrors();
parentPort?.on("message", (msg) => {
  if (msg && msg.event === "shutdown") {
    shutdown();
  }
});
const nitroApp = useNitroApp();
const server = new Server(toNodeListener(nitroApp.h3App));
let listener;
listen().catch(() => listen(
  true
  /* use random port */
)).catch((error) => {
  console.error("Dev worker failed to listen:", error);
  return shutdown();
});
nitroApp.router.get(
  "/_nitro/tasks",
  defineEventHandler(async (event) => {
    const _tasks = await Promise.all(
      Object.entries(tasks).map(async ([name, task]) => {
        const _task = await task.resolve?.();
        return [name, { description: _task?.meta?.description }];
      })
    );
    return {
      tasks: Object.fromEntries(_tasks),
      scheduledTasks: scheduledTasks$1
    };
  })
);
nitroApp.router.use(
  "/_nitro/tasks/:name",
  defineEventHandler(async (event) => {
    const name = getRouterParam(event, "name");
    const payload = {
      ...getQuery$1(event),
      ...await readBody(event).then((r) => r?.payload).catch(() => ({}))
    };
    return await runTask(name, { payload });
  })
);
function listen(useRandomPort = Boolean(
  NITRO_NO_UNIX_SOCKET || process.versions.webcontainer || "Bun" in globalThis && process.platform === "win32"
)) {
  return new Promise((resolve, reject) => {
    try {
      listener = server.listen(useRandomPort ? 0 : getSocketAddress(), () => {
        const address = server.address();
        parentPort?.postMessage({
          event: "listen",
          address: typeof address === "string" ? { socketPath: address } : { host: "localhost", port: address?.port }
        });
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}
function getSocketAddress() {
  const socketName = `nitro-worker-${process.pid}-${threadId}-${NITRO_DEV_WORKER_ID}-${Math.round(Math.random() * 1e4)}.sock`;
  if (process.platform === "win32") {
    return join(String.raw`\\.\pipe`, socketName);
  }
  if (process.platform === "linux") {
    const nodeMajor = Number.parseInt(process.versions.node.split(".")[0], 10);
    if (nodeMajor >= 20) {
      return `\0${socketName}`;
    }
  }
  return join(tmpdir(), socketName);
}
async function shutdown() {
  server.closeAllConnections?.();
  await Promise.all([
    new Promise((resolve) => listener?.close(resolve)),
    nitroApp.hooks.callHook("close").catch(console.error)
  ]);
  parentPort?.postMessage({ event: "exit" });
}

const _messages = { "appName": "Nuxt", "version": "", "statusCode": 500, "statusMessage": "Server error", "description": "An error occurred in the application and the page could not be served. If you are the application owner, check your server logs for details.", "stack": "" };
const template$1 = (messages) => {
  messages = { ..._messages, ...messages };
  return '<!DOCTYPE html><html lang="en"><head><title>' + escapeHtml(messages.statusCode) + " - " + escapeHtml(messages.statusMessage || "Internal Server Error") + `</title><meta charset="utf-8"><meta content="width=device-width,initial-scale=1.0,minimum-scale=1.0" name="viewport"><style>.spotlight{background:linear-gradient(45deg,#00dc82,#36e4da 50%,#0047e1);bottom:-40vh;filter:blur(30vh);height:60vh;opacity:.8}*,:after,:before{border-color:var(--un-default-border-color,#e5e7eb);border-style:solid;border-width:0;box-sizing:border-box}:after,:before{--un-content:""}html{line-height:1.5;-webkit-text-size-adjust:100%;font-family:ui-sans-serif,system-ui,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;font-feature-settings:normal;font-variation-settings:normal;-moz-tab-size:4;tab-size:4;-webkit-tap-highlight-color:transparent}body{line-height:inherit;margin:0}h1{font-size:inherit;font-weight:inherit}h1,p{margin:0}*,:after,:before{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 transparent;--un-ring-shadow:0 0 transparent;--un-shadow-inset: ;--un-shadow:0 0 transparent;--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgba(147,197,253,.5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }.pointer-events-none{pointer-events:none}.fixed{position:fixed}.left-0{left:0}.right-0{right:0}.z-10{z-index:10}.mb-6{margin-bottom:1.5rem}.mb-8{margin-bottom:2rem}.h-auto{height:auto}.min-h-screen{min-height:100vh}.flex{display:flex}.flex-1{flex:1 1 0%}.flex-col{flex-direction:column}.overflow-y-auto{overflow-y:auto}.rounded-t-md{border-top-left-radius:.375rem;border-top-right-radius:.375rem}.bg-black\\/5{background-color:#0000000d}.bg-white{--un-bg-opacity:1;background-color:rgb(255 255 255/var(--un-bg-opacity))}.p-8{padding:2rem}.px-10{padding-left:2.5rem;padding-right:2.5rem}.pt-14{padding-top:3.5rem}.text-6xl{font-size:3.75rem;line-height:1}.text-xl{font-size:1.25rem;line-height:1.75rem}.text-black{--un-text-opacity:1;color:rgb(0 0 0/var(--un-text-opacity))}.font-light{font-weight:300}.font-medium{font-weight:500}.leading-tight{line-height:1.25}.font-sans{font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji}.antialiased{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}@media (prefers-color-scheme:dark){.dark\\:bg-black{--un-bg-opacity:1;background-color:rgb(0 0 0/var(--un-bg-opacity))}.dark\\:bg-white\\/10{background-color:#ffffff1a}.dark\\:text-white{--un-text-opacity:1;color:rgb(255 255 255/var(--un-text-opacity))}}@media (min-width:640px){.sm\\:text-2xl{font-size:1.5rem;line-height:2rem}.sm\\:text-8xl{font-size:6rem;line-height:1}}</style><script>!function(){const e=document.createElement("link").relList;if(!(e&&e.supports&&e.supports("modulepreload"))){for(const e of document.querySelectorAll('link[rel="modulepreload"]'))r(e);new MutationObserver((e=>{for(const o of e)if("childList"===o.type)for(const e of o.addedNodes)"LINK"===e.tagName&&"modulepreload"===e.rel&&r(e)})).observe(document,{childList:!0,subtree:!0})}function r(e){if(e.ep)return;e.ep=!0;const r=function(e){const r={};return e.integrity&&(r.integrity=e.integrity),e.referrerPolicy&&(r.referrerPolicy=e.referrerPolicy),"use-credentials"===e.crossOrigin?r.credentials="include":"anonymous"===e.crossOrigin?r.credentials="omit":r.credentials="same-origin",r}(e);fetch(e.href,r)}}();<\/script></head><body class="antialiased bg-white dark:bg-black dark:text-white flex flex-col font-sans min-h-screen pt-14 px-10 text-black"><div class="fixed left-0 pointer-events-none right-0 spotlight"></div><h1 class="font-medium mb-6 sm:text-8xl text-6xl">` + escapeHtml(messages.statusCode) + '</h1><p class="font-light leading-tight mb-8 sm:text-2xl text-xl">' + escapeHtml(messages.description) + '</p><div class="bg-black/5 bg-white dark:bg-white/10 flex-1 h-auto overflow-y-auto rounded-t-md"><div class="font-light leading-tight p-8 text-xl z-10">' + escapeHtml(messages.stack) + "</div></div></body></html>";
};

const errorDev = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  template: template$1
}, Symbol.toStringTag, { value: 'Module' }));

const template = "";

const _virtual__spaTemplate = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  template: template
}, Symbol.toStringTag, { value: 'Module' }));

const styles = {};

const styles$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: styles
}, Symbol.toStringTag, { value: 'Module' }));

const addQuantityColumn_get = defineEventHandler(async (event) => {
  try {
    const headers = getHeaders(event);
    const userId = headers["x-user-id"];
    const userEmail = headers["x-user-email"];
    if (!userId || !userEmail) {
      throw createError({
        statusCode: 401,
        statusMessage: "Admin authentication required"
      });
    }
    console.log("Adding quantity column to transactions table...");
    const [columns] = await db.execute(`
      SHOW COLUMNS FROM transactions LIKE 'quantity'
    `);
    if (columns.length > 0) {
      return {
        success: true,
        message: "Quantity column already exists",
        action: "no_action_needed"
      };
    }
    await db.execute(`
      ALTER TABLE transactions 
      ADD COLUMN quantity INT DEFAULT 1 NOT NULL 
      AFTER product_name
    `);
    console.log("Quantity column added successfully");
    const [existingTransactions] = await db.execute(`
      SELECT id, payment_gateway_payload 
      FROM transactions 
      WHERE payment_gateway_payload IS NOT NULL
    `);
    let updatedCount = 0;
    for (const transaction of existingTransactions) {
      try {
        const payload = JSON.parse(transaction.payment_gateway_payload);
        let quantity = 1;
        if (payload.item_details && Array.isArray(payload.item_details) && payload.item_details.length > 0) {
          quantity = payload.item_details[0].quantity || 1;
        }
        await db.execute(`
          UPDATE transactions 
          SET quantity = ? 
          WHERE id = ?
        `, [quantity, transaction.id]);
        updatedCount++;
      } catch (parseError) {
        console.warn(`Could not parse payload for transaction ${transaction.id}:`, parseError.message);
      }
    }
    console.log(`Updated quantity for ${updatedCount} existing transactions`);
    return {
      success: true,
      message: "Quantity column added successfully",
      action: "column_added",
      existingTransactionsUpdated: updatedCount
    };
  } catch (error) {
    console.error("Error adding quantity column:", error);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to add quantity column: ${error.message}`
    });
  }
});

const addQuantityColumn_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: addQuantityColumn_get
}, Symbol.toStringTag, { value: 'Module' }));

async function validateUserSession(event) {
  try {
    const headers = getHeaders(event);
    const sessionUser = headers["x-user-session"];
    if (!sessionUser) {
      return null;
    }
    let user;
    try {
      user = JSON.parse(sessionUser);
    } catch (parseError) {
      console.error("Invalid session data format:", parseError);
      return null;
    }
    if (!user || !user.id || !user.email) {
      return null;
    }
    const [rows] = await db.query(
      "SELECT id, email, name, account_type, phone FROM nixty.users WHERE id = ?",
      [user.id]
    );
    if (rows.length === 0) {
      return null;
    }
    const dbUser = rows[0];
    if (dbUser.email !== user.email) {
      return null;
    }
    return dbUser;
  } catch (error) {
    console.error("Error validating user session:", error);
    return null;
  }
}
async function requireAuth(event) {
  const user = await validateUserSession(event);
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication required"
    });
  }
  return user;
}
async function requireAdmin(event) {
  const user = await requireAuth(event);
  if (user.account_type !== "admin") {
    throw createError({
      statusCode: 403,
      statusMessage: "Admin access required"
    });
  }
  return user;
}

const authCredentialsInfo_get = defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event);
    if (!user || user.account_type !== "admin") {
      throw createError({
        statusCode: 403,
        statusMessage: "Admin access required"
      });
    }
    console.log("Getting auth_credentials information...");
    const [columns] = await db.execute(
      `SELECT column_name, column_type, is_nullable, column_default 
       FROM information_schema.columns 
       WHERE table_schema = DATABASE() 
       AND table_name = 'transactions' 
       AND column_name = 'auth_credentials'`
    );
    if (columns.length === 0) {
      return {
        success: false,
        message: "auth_credentials column does not exist in transactions table"
      };
    }
    const [sampleTransactions] = await db.execute(`
      SELECT 
        id, 
        order_id, 
        product_name, 
        status, 
        auth_credentials,
        created_at
      FROM transactions 
      WHERE auth_credentials IS NOT NULL 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    const [transactionsWithLicenseOnly] = await db.execute(`
      SELECT 
        id, 
        order_id, 
        product_name, 
        status, 
        license_info,
        created_at
      FROM transactions 
      WHERE license_info IS NOT NULL 
      AND auth_credentials IS NULL 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    const [stats] = await db.execute(`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN auth_credentials IS NOT NULL THEN 1 ELSE 0 END) as with_auth_credentials,
        SUM(CASE WHEN license_info IS NOT NULL THEN 1 ELSE 0 END) as with_license_info,
        SUM(CASE WHEN auth_credentials IS NOT NULL AND license_info IS NOT NULL THEN 1 ELSE 0 END) as with_both
      FROM transactions
    `);
    return {
      success: true,
      column_info: columns[0],
      statistics: stats[0],
      sample_transactions_with_auth: sampleTransactions,
      sample_transactions_license_only: transactionsWithLicenseOnly,
      explanation: {
        purpose: "auth_credentials is designed to store authentication credentials for services that require login",
        usage: "Typically used for cloud services, subscriptions, or SaaS products",
        format: "JSON format containing login credentials like username, password, account tokens, etc",
        examples: [
          {
            type: "Cloud Service Account",
            format: {
              username: "user@service.com",
              password: "generated_password",
              account_type: "premium",
              expires_at: "2024-12-31"
            }
          },
          {
            type: "API Access",
            format: {
              api_key: "key_xxxxxxxxxxxxx",
              api_secret: "secret_yyyyyyyyy",
              endpoint: "https://api.service.com",
              permissions: ["read", "write"]
            }
          },
          {
            type: "Service Login",
            format: {
              login_url: "https://service.com/login",
              username: "customer_123",
              password: "temp_password_456",
              additional_info: "Change password on first login"
            }
          }
        ]
      }
    };
  } catch (error) {
    console.error("Error getting auth_credentials info:", error);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to get auth_credentials info: ${error.message}`
    });
  }
});

const authCredentialsInfo_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: authCredentialsInfo_get
}, Symbol.toStringTag, { value: 'Module' }));

const autoCleanupFailedOrders_post = defineEventHandler(async (event) => {
  try {
    console.log("\u{1F9F9} Starting auto-cleanup of failed orders older than 1 week...");
    const oneWeekAgo = /* @__PURE__ */ new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const [failedOrders] = await db.query(
      `SELECT id, user_id, product_id, status, created_at 
       FROM nixty.orders 
       WHERE status = 'failed' 
       AND created_at < ?`,
      [oneWeekAgo]
    );
    if (failedOrders.length === 0) {
      console.log("\u2705 No failed orders to cleanup");
      return {
        success: true,
        message: "No failed orders to cleanup",
        data: {
          deleted_count: 0,
          cleanup_date: oneWeekAgo.toISOString()
        }
      };
    }
    console.log(`\u{1F4CB} Found ${failedOrders.length} failed orders to cleanup`);
    let deletedCount = 0;
    const errors = [];
    for (const order of failedOrders) {
      try {
        console.log(`\u{1F5D1}\uFE0F Cleaning up order ${order.id} (created: ${order.created_at})`);
        await db.query("START TRANSACTION");
        await db.query(
          "DELETE FROM nixty.payment_gateway_logs WHERE transaction_id = ?",
          [order.id]
        );
        await db.query(
          "DELETE FROM nixty.orders_license WHERE transaction_id = ?",
          [order.id]
        );
        const [deleteResult] = await db.query(
          "DELETE FROM nixty.orders WHERE id = ?",
          [order.id]
        );
        if (deleteResult.affectedRows > 0) {
          deletedCount++;
          console.log(`\u2705 Successfully deleted order ${order.id}`);
        }
        await db.query("COMMIT");
      } catch (error) {
        await db.query("ROLLBACK");
        console.error(`\u274C Error deleting order ${order.id}:`, error.message);
        errors.push({
          order_id: order.id,
          error: error.message
        });
      }
    }
    console.log(`\u{1F3AF} Auto-cleanup completed: ${deletedCount}/${failedOrders.length} orders deleted`);
    return {
      success: true,
      message: `Auto-cleanup completed: ${deletedCount} failed orders deleted`,
      data: {
        deleted_count: deletedCount,
        total_found: failedOrders.length,
        cleanup_date: oneWeekAgo.toISOString(),
        errors
      }
    };
  } catch (error) {
    console.error("\u274C Auto-cleanup failed:", error);
    try {
      await db.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Rollback error:", rollbackError);
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to perform auto-cleanup of failed orders"
    });
  }
});

const autoCleanupFailedOrders_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: autoCleanupFailedOrders_post
}, Symbol.toStringTag, { value: 'Module' }));

const available_get = defineEventHandler(async (event) => {
  try {
    const [rows] = await db.execute("SELECT id, name, slug FROM categories ORDER BY name ASC");
    return {
      success: true,
      categories: rows
    };
  } catch (error) {
    console.error("Error fetching available categories:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch available categories"
    });
  }
});

const available_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: available_get
}, Symbol.toStringTag, { value: 'Module' }));

const chartStats_get = defineEventHandler(async (event) => {
  try {
    const query = getQuery$1(event);
    const period = query.period || "7days";
    const startDate = query.startDate;
    const endDate = query.endDate;
    let days = 7;
    let customDateRange = false;
    if (period === "custom" && startDate && endDate) {
      customDateRange = true;
    } else if (period === "30days") {
      days = 30;
    } else if (period === "90days") {
      days = 90;
    } else {
      days = 7;
    }
    let startDateObj, endDateObj;
    if (customDateRange) {
      startDateObj = new Date(startDate);
      endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59, 999);
    } else {
      endDateObj = /* @__PURE__ */ new Date();
      startDateObj = /* @__PURE__ */ new Date();
      startDateObj.setDate(endDateObj.getDate() - days + 1);
      startDateObj.setHours(0, 0, 0, 0);
      endDateObj.setHours(23, 59, 59, 999);
    }
    const [rows] = await db.query(`
      SELECT 
        DATE(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta') as date,
        COUNT(*) as transaction_count,
        SUM(CASE WHEN status IN ('completed', 'settlement', 'capture') THEN total::numeric ELSE 0 END) as total_revenue,
        COUNT(CASE WHEN status IN ('completed', 'settlement', 'capture') THEN 1 END) as completed_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count
      FROM nixty.orders 
      WHERE created_at >= $1 AND created_at <= $2
      GROUP BY DATE(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta')
      ORDER BY DATE(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta') ASC
    `, [startDateObj.toISOString(), endDateObj.toISOString()]);
    const chartData = [];
    const currentDate = new Date(startDateObj);
    while (currentDate <= endDateObj) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const dayData = rows.find((row) => {
        const rowDate = new Date(row.date).toISOString().split("T")[0];
        return rowDate === dateStr;
      });
      chartData.push({
        date: dateStr,
        amount: dayData ? parseFloat(dayData.total_revenue || 0) : 0,
        count: dayData ? parseInt(dayData.transaction_count || 0) : 0,
        completed_count: dayData ? parseInt(dayData.completed_count || 0) : 0,
        pending_count: dayData ? parseInt(dayData.pending_count || 0) : 0,
        failed_count: dayData ? parseInt(dayData.failed_count || 0) : 0,
        label: currentDate.toLocaleDateString("en-US", { weekday: "short" }),
        shortLabel: currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    const totalRevenue = chartData.reduce((sum, day) => sum + day.amount, 0);
    const totalOrders = chartData.reduce((sum, day) => sum + day.completed_count, 0);
    const totalTransactions = chartData.reduce((sum, day) => sum + day.count, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    return {
      success: true,
      chartData,
      summary: {
        totalRevenue,
        totalOrders,
        totalTransactions,
        avgOrderValue,
        period,
        startDate: startDateObj.toISOString().split("T")[0],
        endDate: endDateObj.toISOString().split("T")[0]
      }
    };
  } catch (error) {
    console.error("Error fetching chart statistics:", error);
    return {
      success: false,
      chartData: [],
      summary: {
        totalRevenue: 0,
        totalOrders: 0,
        totalTransactions: 0,
        avgOrderValue: 0
      },
      error: error.message
    };
  }
});

const chartStats_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: chartStats_get
}, Symbol.toStringTag, { value: 'Module' }));

const checkTransaction_get = defineEventHandler(async (event) => {
  try {
    const { order_id } = getQuery$1(event);
    if (!order_id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Order ID is required"
      });
    }
    console.log(`Checking transaction status for order: ${order_id}`);
    const [transactions] = await db.execute(`
      SELECT 
        t.id,
        t.order_id,
        t.product_id,
        t.product_name,
        t.quantity,
        t.customer_name,
        t.email,
        t.amount,
        t.payment_method,
        t.payment_gateway_status,
        t.status,
        t.created_at,
        t.updated_at,
        t.license_info IS NOT NULL AS has_license,
        (SELECT COUNT(*) FROM payment_gateway_logs WHERE transaction_id = t.id AND log_key = 'custom_email') > 0 AS has_custom_email
      FROM transactions t
      WHERE t.order_id = ?
    `, [order_id]);
    if (transactions.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: `Transaction not found for order ID: ${order_id}`
      });
    }
    const transaction = transactions[0];
    if (transaction.has_custom_email) {
      const [customEmailRows] = await db.execute(`
        SELECT log_value 
        FROM payment_gateway_logs 
        WHERE transaction_id = ? AND log_key = 'custom_email'
        LIMIT 1
      `, [transaction.id]);
      if (customEmailRows.length > 0) {
        transaction.custom_email = customEmailRows[0].log_value;
      }
    }
    if (transaction.has_license && transaction.license_info) {
      try {
        const licenseInfo = JSON.parse(transaction.license_info);
        transaction.license_count = Array.isArray(licenseInfo) ? licenseInfo.length : 1;
      } catch (e) {
        transaction.license_count = 0;
      }
    } else {
      transaction.license_count = 0;
    }
    return {
      success: true,
      transaction
    };
  } catch (error) {
    console.error("Error checking transaction:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "Failed to check transaction"
    });
  }
});

const checkTransaction_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: checkTransaction_get
}, Symbol.toStringTag, { value: 'Module' }));

const checkTransactionsTable_get = defineEventHandler(async (event) => {
  try {
    const [tableInfo] = await db.query("DESCRIBE transactions");
    const [countResult] = await db.query("SELECT COUNT(*) as count FROM transactions");
    const [duplicateCheck] = await db.query(`
            SELECT order_id, COUNT(*) as count 
            FROM transactions 
            GROUP BY order_id 
            HAVING COUNT(*) > 1
        `);
    return {
      success: true,
      tableStructure: tableInfo,
      totalTransactions: countResult[0].count,
      duplicateOrders: duplicateCheck
    };
  } catch (error) {
    console.error("Database check error:", error);
    return {
      success: false,
      error: error.message
    };
  }
});

const checkTransactionsTable_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: checkTransactionsTable_get
}, Symbol.toStringTag, { value: 'Module' }));

const cleanupNotFoundTransactions_get = defineEventHandler(async (event) => {
  try {
    const headers = getHeaders(event);
    const userId = headers["x-user-id"];
    const userEmail = headers["x-user-email"];
    if (!userId || !userEmail) {
      throw createError({
        statusCode: 401,
        statusMessage: "Admin authentication required"
      });
    }
    try {
      const [users] = await db.execute(
        "SELECT role FROM users WHERE id = ? AND email = ? LIMIT 1",
        [userId, userEmail]
      );
      const isAdmin = users && users.length > 0 && users[0].role === "admin";
      if (!isAdmin) {
        throw createError({
          statusCode: 403,
          statusMessage: "Admin access required"
        });
      }
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      console.error("Error checking admin status:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to validate admin status"
      });
    }
    const query = getQuery$1(event);
    const daysOld = parseInt(query.days || "7", 10);
    const dryRun = query.dry_run === "true";
    if (isNaN(daysOld) || daysOld < 1) {
      throw createError({
        statusCode: 400,
        statusMessage: "Days parameter must be a positive number"
      });
    }
    const [transactions] = await db.execute(
      `SELECT id, order_id, product_name, email, amount, created_at, updated_at
       FROM transactions 
       WHERE payment_gateway_status = 'not_found_in_gateway'
       AND updated_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [daysOld]
    );
    if (transactions.length === 0) {
      return {
        success: true,
        message: `No transactions with 'not_found_in_gateway' status older than ${daysOld} days found`,
        data: {
          deleted: 0,
          dry_run: dryRun
        }
      };
    }
    if (dryRun) {
      return {
        success: true,
        message: `Found ${transactions.length} transactions with 'not_found_in_gateway' status older than ${daysOld} days (DRY RUN)`,
        data: {
          transactions,
          count: transactions.length,
          dry_run: true
        }
      };
    }
    const ids = transactions.map((t) => t.id);
    const placeholders = ids.map(() => "?").join(",");
    const [result] = await db.execute(
      `DELETE FROM transactions WHERE id IN (${placeholders})`,
      ids
    );
    return {
      success: true,
      message: `Successfully deleted ${result.affectedRows} transactions with 'not_found_in_gateway' status older than ${daysOld} days`,
      data: {
        deleted: result.affectedRows,
        transactions,
        dry_run: false
      }
    };
  } catch (error) {
    console.error("Error cleaning up not found transactions:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to clean up transactions"
    });
  }
});

const cleanupNotFoundTransactions_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: cleanupNotFoundTransactions_get
}, Symbol.toStringTag, { value: 'Module' }));

const cleanupPendingTransactions_get = defineEventHandler(async (event) => {
  try {
    const headers = getHeaders(event);
    const userId = headers["x-user-id"];
    const userEmail = headers["x-user-email"];
    if (!userId || !userEmail) {
      throw createError({
        statusCode: 401,
        statusMessage: "Admin authentication required"
      });
    }
    try {
      const [users] = await db.execute(
        "SELECT role FROM users WHERE id = ? AND email = ? LIMIT 1",
        [userId, userEmail]
      );
      const isAdmin = users && users.length > 0 && users[0].role === "admin";
      if (!isAdmin) {
        throw createError({
          statusCode: 403,
          statusMessage: "Admin access required"
        });
      }
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      console.error("Error checking admin status:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to validate admin status"
      });
    }
    const query = getQuery$1(event);
    const minutesOld = parseInt(query.minutes || "1", 10);
    const dryRun = query.dry_run === "true";
    if (isNaN(minutesOld) || minutesOld < 1) {
      throw createError({
        statusCode: 400,
        statusMessage: "Minutes parameter must be a positive number"
      });
    }
    const [transactions] = await db.execute(
      `SELECT id, order_id, product_name, email, amount, status, created_at, updated_at
       FROM transactions 
       WHERE status = 'pending'
       AND created_at < DATE_SUB(NOW(), INTERVAL ? MINUTE)`,
      [minutesOld]
    );
    if (transactions.length === 0) {
      return {
        success: true,
        message: `No pending transactions older than ${minutesOld} minutes found`,
        data: {
          deleted: 0,
          dry_run: dryRun
        }
      };
    }
    if (dryRun) {
      return {
        success: true,
        message: `Found ${transactions.length} pending transactions older than ${minutesOld} minutes (DRY RUN)`,
        data: {
          transactions,
          count: transactions.length,
          dry_run: true
        }
      };
    }
    const ids = transactions.map((t) => t.id);
    const placeholders = ids.map(() => "?").join(",");
    const [result] = await db.execute(
      `DELETE FROM transactions WHERE id IN (${placeholders})`,
      ids
    );
    return {
      success: true,
      message: `Successfully deleted ${result.affectedRows} pending transactions older than ${minutesOld} minutes`,
      data: {
        deleted: result.affectedRows,
        transactions,
        dry_run: false
      }
    };
  } catch (error) {
    console.error("Error cleaning up pending transactions:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to clean up pending transactions"
    });
  }
});

const cleanupPendingTransactions_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: cleanupPendingTransactions_get
}, Symbol.toStringTag, { value: 'Module' }));

const debugAuth_get = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const headers = getHeaders(event);
  return {
    debug: "Admin Auth Debug Info",
    environment: "development",
    bypassAuth: config.public.bypassAdminAuth,
    headers: {
      hasUserId: !!headers["x-user-id"],
      hasUserEmail: !!headers["x-user-email"],
      userId: headers["x-user-id"] ? String(headers["x-user-id"]).substring(0, 8) + "***" : "none",
      userEmail: headers["x-user-email"] ? String(headers["x-user-email"]).substring(0, 5) + "***" : "none",
      allHeaders: Object.keys(headers)
    },
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
});

const debugAuth_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: debugAuth_get
}, Symbol.toStringTag, { value: 'Module' }));

const deleteImage_delete = defineEventHandler(async (event) => {
  try {
    const headers = getHeaders(event);
    const userId = headers["x-user-id"];
    const userEmail = headers["x-user-email"];
    if (!userId || !userEmail) {
      throw createError({
        statusCode: 401,
        statusMessage: "Admin authentication required"
      });
    }
    const query = getQuery$1(event);
    const imageUrl = query.url;
    if (!imageUrl) {
      throw createError({
        statusCode: 400,
        statusMessage: "Image URL is required"
      });
    }
    if (!imageUrl.startsWith("/uploads/admin/")) {
      throw createError({
        statusCode: 400,
        statusMessage: "Can only delete admin uploaded images"
      });
    }
    const filename = basename(imageUrl);
    const filenamePattern = /^\d+-[a-f0-9]{8}\.(jpg|jpeg|jfif|png|gif|webp)$/i;
    if (!filenamePattern.test(filename)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid image filename format"
      });
    }
    const filePath = join(process.cwd(), "public", "uploads", "admin", filename);
    try {
      await promises.access(filePath);
      await promises.unlink(filePath);
      return {
        success: true,
        message: "Image deleted successfully",
        data: {
          deletedUrl: imageUrl,
          filename
        }
      };
    } catch (error) {
      if (error.code === "ENOENT") {
        return {
          success: true,
          message: "Image was already deleted or does not exist",
          data: {
            deletedUrl: imageUrl,
            filename
          }
        };
      }
      throw error;
    }
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    console.error("Error deleting image:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete image"
    });
  }
});

const deleteImage_delete$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: deleteImage_delete
}, Symbol.toStringTag, { value: 'Module' }));

const ALLOWED_TABLES = [
  "users",
  "products",
  "categories",
  "announcements",
  "deals",
  "hero_slides",
  "transactions",
  "product_licenses"
];
const TABLE_VALIDATION_RULES = {
  users: {
    required: ["email"],
    email: ["email"],
    minLength: {
      password: 6,
      name: 2
    },
    maxLength: {
      email: 255,
      name: 100,
      password: 255
    },
    enum: {
      account_type: ["user", "admin"]
    }
  },
  products: {
    required: ["name", "price"],
    minLength: {
      name: 2
    },
    maxLength: {
      name: 50,
      version: 50,
      short_description: 50,
      currency: 5,
      period: 50,
      slug: 100,
      description: 1e3
    },
    slug: ["slug"],
    numeric: ["price", "discount_percentage", "sold_count", "view_count", "category_id", "min_stock_threshold"],
    positiveNumber: ["price"],
    enum: {
      status: ["active", "inactive", "out_of_stock"]
    }
  },
  categories: {
    required: ["name", "slug"],
    minLength: {
      name: 2,
      slug: 2
    },
    maxLength: {
      name: 255,
      slug: 255
    },
    slug: ["slug"]
  },
  announcements: {
    required: ["title"],
    minLength: {
      title: 2
    },
    maxLength: {
      title: 255,
      image_url: 500
    },
    enum: {
      status: ["active", "inactive"]
    }
  },
  deals: {
    required: ["title", "new_price"],
    minLength: {
      title: 2
    },
    maxLength: {
      title: 255,
      badge: 100,
      background_image_url: 500
    },
    numeric: ["old_price", "new_price", "discount_percentage"],
    positiveNumber: ["new_price"],
    enum: {
      status: ["active", "inactive", "expired"]
    }
  },
  hero_slides: {
    required: ["title"],
    minLength: {
      title: 2
    },
    maxLength: {
      title: 255,
      background_image_url: 500
    },
    numeric: ["sort_order"],
    enum: {
      status: ["active", "inactive"]
    }
  },
  transactions: {
    required: ["order_id", "product_name", "amount", "status"],
    minLength: {
      order_id: 2,
      product_name: 2
    },
    maxLength: {
      order_id: 100,
      product_name: 255,
      email: 255,
      payment_method: 50,
      va_number: 50,
      status: 20
    },
    numeric: ["amount"],
    positiveNumber: ["amount"],
    email: ["email"]
  },
  product_licenses: {
    required: ["product_id", "license_type"],
    minLength: {
      product_key: 5,
      email: 5,
      password: 6,
      product_name: 2
    },
    maxLength: {
      product_key: 500,
      email: 255,
      password: 255,
      product_name: 255,
      product_version: 50,
      notes: 1e3
    },
    numeric: ["product_id", "used_by_transaction_id", "usage_count", "max_usage"],
    positiveNumber: ["product_id"],
    email: ["email"],
    enum: {
      license_type: ["product_key", "email_password"],
      status: ["available", "used", "expired", "reserved"]
    }
  }
};
function validateTableName(tableName) {
  if (!tableName || typeof tableName !== "string") {
    throw new Error("Table name is required");
  }
  if (!ALLOWED_TABLES.includes(tableName)) {
    throw new Error("Invalid table name");
  }
  return true;
}
function sanitizeString(value) {
  if (typeof value !== "string") return value;
  return value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").replace(/<[^>]*>/g, "").trim();
}
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
function validateUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
function validateSlug(slug) {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}
function generateProductSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function validateRecordData(tableName, data, isUpdate = false) {
  validateTableName(tableName);
  if (!data || typeof data !== "object") {
    throw new Error("Invalid data provided");
  }
  const systemFields = ["id", "created_at", "updated_at"];
  systemFields.forEach((field) => {
    if (data.hasOwnProperty(field)) {
      console.log(`Removing system field '${field}' from user input`);
      delete data[field];
    }
  });
  const rules = TABLE_VALIDATION_RULES[tableName];
  if (!rules) {
    return data;
  }
  const errors = [];
  const sanitizedData = {};
  if (!isUpdate && rules.required) {
    for (const field of rules.required) {
      if (!data[field] || typeof data[field] === "string" && data[field].trim() === "") {
        errors.push(`Field '${field}' is required`);
      }
    }
  }
  for (const [field, value] of Object.entries(data)) {
    if (value === null || value === void 0 || value === "") {
      sanitizedData[field] = value;
      continue;
    }
    if (typeof value === "string") {
      sanitizedData[field] = sanitizeString(value);
    } else {
      sanitizedData[field] = value;
    }
    if (rules.email && rules.email.includes(field)) {
      if (!validateEmail(sanitizedData[field])) {
        errors.push(`Field '${field}' must be a valid email address`);
      }
    }
    if (rules.slug && rules.slug.includes(field)) {
      if (!validateSlug(sanitizedData[field])) {
        const errorMessage = `Field '${field}' must be a valid slug (lowercase, alphanumeric, hyphens only). Value: '${sanitizedData[field]}'`;
        console.error("Slug validation error:", errorMessage);
        errors.push(errorMessage);
      }
    }
    if (field.includes("url") && sanitizedData[field]) {
      if (field.includes("image")) {
        try {
          validateImageUrl(sanitizedData[field]);
        } catch (error) {
          errors.push(`Field '${field}': ${error.message}`);
        }
      } else {
        if (!validateUrl(sanitizedData[field])) {
          errors.push(`Field '${field}' must be a valid URL`);
        }
      }
    }
    if (rules.minLength && rules.minLength[field]) {
      if (typeof sanitizedData[field] === "string" && sanitizedData[field].length < rules.minLength[field]) {
        errors.push(`Field '${field}' must be at least ${rules.minLength[field]} characters long`);
      }
    }
    if (rules.maxLength && rules.maxLength[field]) {
      if (typeof sanitizedData[field] === "string" && sanitizedData[field].length > rules.maxLength[field]) {
        errors.push(`Field '${field}' must be no more than ${rules.maxLength[field]} characters long`);
      }
    }
    if (rules.numeric && rules.numeric.includes(field)) {
      if (sanitizedData[field] !== "" && sanitizedData[field] !== null && sanitizedData[field] !== void 0) {
        const numValue = parseFloat(sanitizedData[field]);
        if (isNaN(numValue)) {
          errors.push(`Field '${field}' must be a valid number`);
        } else {
          sanitizedData[field] = numValue;
        }
      }
    }
    if (rules.positiveNumber && rules.positiveNumber.includes(field)) {
      if (sanitizedData[field] !== "" && sanitizedData[field] !== null && sanitizedData[field] !== void 0) {
        const numValue = parseFloat(sanitizedData[field]);
        if (isNaN(numValue) || numValue < 0) {
          errors.push(`Field '${field}' must be a positive number`);
        }
      }
    }
    if (rules.enum && rules.enum[field]) {
      if (!rules.enum[field].includes(sanitizedData[field])) {
        errors.push(`Field '${field}' must be one of: ${rules.enum[field].join(", ")}`);
      }
    }
  }
  if (errors.length > 0) {
    const error = new Error("Validation failed");
    error.validationErrors = errors;
    throw error;
  }
  return sanitizedData;
}
function validateRecordId(id) {
  const numId = parseInt(id);
  if (isNaN(numId) || numId <= 0) {
    throw new Error("Invalid record ID");
  }
  return numId;
}
function validateImageUrl(url) {
  if (!url || typeof url !== "string") {
    return true;
  }
  if (url.startsWith("/uploads/admin/")) {
    return true;
  }
  try {
    new URL(url);
    return true;
  } catch {
    throw new Error("Invalid image URL format");
  }
}

const fixProductSlugs_get = defineEventHandler(async (event) => {
  try {
    await adminAuth(event);
    const [beforeProducts] = await db.query(`
      SELECT p.id, p.name, p.version, p.slug, c.name AS category_name, c.slug AS category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      ORDER BY p.id
    `);
    const updatePromises = beforeProducts.map(async (product) => {
      const newSlug = generateProductSlug(product.name);
      await db.query(
        "UPDATE products SET slug = ? WHERE id = ?",
        [newSlug, product.id]
      );
    });
    await Promise.all(updatePromises);
    const [afterProducts] = await db.query(`
      SELECT p.id, p.name, p.version, p.slug, c.name AS category_name, c.slug AS category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      ORDER BY p.id
    `);
    return {
      success: true,
      message: "Product slugs have been updated successfully",
      before: beforeProducts,
      after: afterProducts
    };
  } catch (error) {
    console.error("Error fixing product slugs:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fix product slugs"
    });
  }
});

const fixProductSlugs_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: fixProductSlugs_get
}, Symbol.toStringTag, { value: 'Module' }));

const fixTransactionsTable_get = defineEventHandler(async (event) => {
  try {
    console.log("Attempting to fix transactions table schema...");
    const tableInfo = await db.query(`DESCRIBE transactions`);
    console.log("Current table structure:", tableInfo);
    const showCreate = await db.query(`SHOW CREATE TABLE transactions`);
    console.log("Current CREATE TABLE statement:", showCreate);
    await db.query(`ALTER TABLE transactions MODIFY COLUMN id INT AUTO_INCREMENT`);
    console.log("Successfully added AUTO_INCREMENT to id column");
    try {
      await db.query(`ALTER TABLE transactions ADD CONSTRAINT unique_order_id UNIQUE (order_id)`);
      console.log("Added UNIQUE constraint to order_id");
    } catch (error) {
      if (error.code === "ER_DUP_KEYNAME") {
        console.log("UNIQUE constraint on order_id already exists");
      } else {
        console.log("Error adding UNIQUE constraint:", error.message);
      }
    }
    const updatedTableInfo = await db.query(`DESCRIBE transactions`);
    console.log("Updated table structure:", updatedTableInfo);
    return {
      success: true,
      message: "Transactions table schema fixed successfully",
      tableInfo: updatedTableInfo
    };
  } catch (error) {
    console.error("Error fixing transactions table:", error);
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
});

const fixTransactionsTable_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: fixTransactionsTable_get
}, Symbol.toStringTag, { value: 'Module' }));

class WebhookLogger {
  static async logWebhookStart(orderId, payload, webhookType = "midtrans") {
    try {
      const [result] = await db.execute(`
        INSERT INTO webhook_logs (
          order_id, webhook_type, status, request_payload, created_at
        ) VALUES (?, ?, ?, ?, NOW())
      `, [orderId, webhookType, "processing", JSON.stringify(payload)]);
      return result.insertId;
    } catch (error) {
      console.error("Error logging webhook start:", error);
      return null;
    }
  }
  static async logWebhookComplete(logId, responseStatus, licenseProcessingSuccess, licensesProcessed, emailSent, processingDuration) {
    try {
      if (!logId) return;
      await db.execute(`
        UPDATE webhook_logs SET 
          status = ?,
          response_status = ?,
          license_processing_success = ?,
          licenses_processed = ?,
          email_sent = ?,
          processing_duration_ms = ?
        WHERE id = ?
      `, [
        licenseProcessingSuccess ? "completed" : "failed",
        responseStatus,
        licenseProcessingSuccess,
        licensesProcessed,
        emailSent,
        processingDuration,
        logId
      ]);
    } catch (error) {
      console.error("Error logging webhook completion:", error);
    }
  }
  static async logWebhookError(logId, errorMessage, responseStatus = 500) {
    try {
      if (!logId) return;
      await db.execute(`
        UPDATE webhook_logs SET 
          status = 'error',
          response_status = ?,
          error_message = ?
        WHERE id = ?
      `, [responseStatus, errorMessage, logId]);
    } catch (error) {
      console.error("Error logging webhook error:", error);
    }
  }
  static async logLicenseDeliveryFailure(transactionId, orderId, failureReason) {
    try {
      await db.execute(`
        INSERT INTO license_delivery_failures (
          transaction_id, order_id, failure_reason, created_at
        ) VALUES (?, ?, ?, NOW())
      `, [transactionId, orderId, failureReason]);
    } catch (error) {
      console.error("Error logging license delivery failure:", error);
    }
  }
  static async incrementRetryCount(transactionId) {
    try {
      await db.execute(`
        UPDATE license_delivery_failures SET 
          retry_count = retry_count + 1,
          last_retry_at = NOW(),
          updated_at = NOW()
        WHERE transaction_id = ? AND resolved = FALSE
      `, [transactionId]);
    } catch (error) {
      console.error("Error incrementing retry count:", error);
    }
  }
  static async markLicenseDeliveryResolved(transactionId) {
    try {
      await db.execute(`
        UPDATE license_delivery_failures SET 
          resolved = TRUE,
          resolved_at = NOW(),
          updated_at = NOW()
        WHERE transaction_id = ? AND resolved = FALSE
      `, [transactionId]);
    } catch (error) {
      console.error("Error marking license delivery resolved:", error);
    }
  }
  static async getFailedDeliveries(limit = 50) {
    try {
      const [failures] = await db.execute(`
        SELECT ldf.*, t.order_id, t.product_name, t.customer_name, t.email
        FROM license_delivery_failures ldf
        JOIN transactions t ON ldf.transaction_id = t.id
        WHERE ldf.resolved = FALSE AND ldf.retry_count < ldf.max_retries
        ORDER BY ldf.created_at DESC
        LIMIT ?
      `, [limit]);
      return failures;
    } catch (error) {
      console.error("Error getting failed deliveries:", error);
      return [];
    }
  }
  static async getWebhookStats(days = 7) {
    try {
      const [stats] = await db.execute(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as total_webhooks,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successful,
          SUM(CASE WHEN status = 'failed' OR status = 'error' THEN 1 ELSE 0 END) as failed,
          AVG(processing_duration_ms) as avg_duration_ms,
          SUM(licenses_processed) as total_licenses_processed
        FROM webhook_logs 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `, [days]);
      return stats;
    } catch (error) {
      console.error("Error getting webhook stats:", error);
      return [];
    }
  }
}

const licenseDeliveryStats_get = defineEventHandler(async (event) => {
  try {
    const headers = getHeaders(event);
    const userId = headers["x-user-id"];
    const userEmail = headers["x-user-email"];
    if (!userId || !userEmail) {
      throw createError({
        statusCode: 401,
        statusMessage: "Admin authentication required"
      });
    }
    const query = getQuery$1(event);
    const days = parseInt(query.days) || 7;
    console.log(`Fetching license delivery stats for last ${days} days...`);
    const webhookStats = await WebhookLogger.getWebhookStats(days);
    const failedDeliveries = await WebhookLogger.getFailedDeliveries(50);
    const [transactionStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN status = 'completed' OR payment_gateway_status = 'settlement' THEN 1 ELSE 0 END) as completed_transactions,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_transactions,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_transactions,
        SUM(quantity) as total_licenses_requested
      FROM transactions 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    `, [days]);
    const [licenseStats] = await db.execute(`
      SELECT 
        COUNT(DISTINCT t.id) as completed_transactions_with_licenses,
        SUM(t.quantity) as total_licenses_requested_completed,
        COUNT(luh.id) as licenses_delivered
      FROM transactions t
      LEFT JOIN license_usage_history luh ON t.id = luh.transaction_id
      WHERE (t.status = 'completed' OR t.payment_gateway_status = 'settlement')
      AND t.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    `, [days]);
    const [productStats] = await db.execute(`
      SELECT 
        p.id,
        p.name,
        p.version,
        COUNT(DISTINCT t.id) as transactions,
        SUM(t.quantity) as licenses_requested,
        COUNT(luh.id) as licenses_delivered,
        ROUND((COUNT(luh.id) / SUM(t.quantity)) * 100, 2) as delivery_rate
      FROM products p
      LEFT JOIN transactions t ON p.id = t.product_id 
        AND (t.status = 'completed' OR t.payment_gateway_status = 'settlement')
        AND t.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      LEFT JOIN license_usage_history luh ON t.id = luh.transaction_id
      GROUP BY p.id, p.name, p.version
      HAVING transactions > 0
      ORDER BY transactions DESC
    `, [days]);
    const [stockStatus] = await db.execute(`
      SELECT 
        p.id,
        p.name,
        p.version,
        COUNT(pl.id) as total_licenses,
        SUM(CASE WHEN pl.status = 'available' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN pl.status = 'used' THEN 1 ELSE 0 END) as used,
        SUM(CASE WHEN pl.status = 'expired' THEN 1 ELSE 0 END) as expired,
        SUM(CASE WHEN pl.status = 'reserved' THEN 1 ELSE 0 END) as reserved
      FROM products p
      LEFT JOIN product_licenses pl ON p.id = pl.product_id
      GROUP BY p.id, p.name, p.version
      HAVING total_licenses > 0
      ORDER BY available ASC
    `);
    const totalStats = transactionStats[0];
    const licenseStatsData = licenseStats[0];
    const deliverySuccessRate = licenseStatsData.total_licenses_requested_completed > 0 ? licenseStatsData.licenses_delivered / licenseStatsData.total_licenses_requested_completed * 100 : 0;
    const alerts = [];
    if (failedDeliveries.length > 0) {
      alerts.push({
        type: "error",
        title: `${failedDeliveries.length} Failed License Deliveries`,
        message: `${failedDeliveries.length} transactions have unresolved license delivery failures.`,
        action: "retry",
        count: failedDeliveries.length
      });
    }
    const lowStockProducts = stockStatus.filter((p) => p.available <= 5 && p.available > 0);
    if (lowStockProducts.length > 0) {
      alerts.push({
        type: "warning",
        title: `${lowStockProducts.length} Products Low on Stock`,
        message: `${lowStockProducts.length} products have 5 or fewer licenses available.`,
        action: "restock",
        products: lowStockProducts.map((p) => `${p.name} (${p.available} left)`)
      });
    }
    const outOfStockProducts = stockStatus.filter((p) => p.available === 0);
    if (outOfStockProducts.length > 0) {
      alerts.push({
        type: "error",
        title: `${outOfStockProducts.length} Products Out of Stock`,
        message: `${outOfStockProducts.length} products have no available licenses.`,
        action: "restock",
        products: outOfStockProducts.map((p) => `${p.name}`)
      });
    }
    if (deliverySuccessRate < 95 && licenseStatsData.total_licenses_requested_completed > 0) {
      alerts.push({
        type: "warning",
        title: `Low License Delivery Rate`,
        message: `Only ${deliverySuccessRate.toFixed(1)}% of licenses are being delivered successfully.`,
        action: "investigate",
        rate: deliverySuccessRate
      });
    }
    return {
      success: true,
      data: {
        period: `Last ${days} days`,
        summary: {
          total_transactions: totalStats.total_transactions,
          completed_transactions: totalStats.completed_transactions,
          pending_transactions: totalStats.pending_transactions,
          failed_transactions: totalStats.failed_transactions,
          total_licenses_requested: totalStats.total_licenses_requested,
          licenses_delivered: licenseStatsData.licenses_delivered,
          delivery_success_rate: Math.round(deliverySuccessRate * 100) / 100,
          failed_deliveries_count: failedDeliveries.length
        },
        webhook_stats: webhookStats,
        product_stats: productStats,
        stock_status: stockStatus,
        failed_deliveries: failedDeliveries.slice(0, 10),
        // Only return first 10 for preview
        alerts
      }
    };
  } catch (error) {
    console.error("Error fetching license delivery stats:", error);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch stats: ${error.message}`
    });
  }
});

const licenseDeliveryStats_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: licenseDeliveryStats_get
}, Symbol.toStringTag, { value: 'Module' }));

const massAdd_post$2 = defineEventHandler(async (event) => {
  const { table, records } = await readBody(event);
  if (!table || !records || !Array.isArray(records) || records.length === 0) {
    return { success: false, message: "Invalid request body" };
  }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    for (const record of records) {
      await connection.query(`INSERT INTO ${table} SET ?`, record);
    }
    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    console.error("Error in mass-add endpoint:", error);
    return { success: false, message: "An error occurred during the mass add operation." };
  } finally {
    connection.release();
  }
});

const massAdd_post$3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: massAdd_post$2
}, Symbol.toStringTag, { value: 'Module' }));

const storage = createStorage({
  driver: memoryDriver()
});
const CACHE_TTL = 5 * 60 * 1e3;
async function useCache(key, fetcher) {
  const cached = await storage.getItem(key);
  const now = Date.now();
  if (cached && now - cached.timestamp < CACHE_TTL) {
    console.log(`\u{1F680} Serving '${key}' from cache`);
    return cached.data;
  }
  console.log(`\u{1F4E1} Fetching fresh data for '${key}'`);
  const data = await fetcher();
  await storage.setItem(key, { data, timestamp: now });
  console.log(`\u{1F4BE} Cached '${key}' for 5 minutes`);
  return data;
}

class RateLimiter {
  constructor(maxRequests = 100, windowMs = 6e4) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = /* @__PURE__ */ new Map();
    this.cleanup();
  }
  /**
   * Check if request is allowed
   * @param {string} ip - Client IP address
   * @returns {object} - { allowed: boolean, remaining: number, resetTime: number }
   */
  check(ip) {
    const now = Date.now();
    const key = ip;
    if (!this.requests.has(key)) {
      this.requests.set(key, { count: 0, resetTime: now + this.windowMs });
    }
    const requestData = this.requests.get(key);
    if (now > requestData.resetTime) {
      requestData.count = 0;
      requestData.resetTime = now + this.windowMs;
    }
    if (requestData.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: requestData.resetTime
      };
    }
    requestData.count++;
    return {
      allowed: true,
      remaining: this.maxRequests - requestData.count,
      resetTime: requestData.resetTime
    };
  }
  /**
   * Clean up expired entries
   */
  cleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, data] of this.requests) {
        if (now > data.resetTime) {
          this.requests.delete(key);
        }
      }
    }, this.windowMs);
  }
  /**
   * Get current stats
   * @returns {object} - Rate limiter statistics
   */
  getStats() {
    return {
      totalTrackedIPs: this.requests.size,
      maxRequests: this.maxRequests,
      windowMs: this.windowMs
    };
  }
}
const apiLimiter = new RateLimiter(60, 6e4);
const adminLimiter = new RateLimiter(30, 6e4);
function rateLimiter(type = "api") {
  const limiter = type === "admin" ? adminLimiter : apiLimiter;
  return (event) => {
    const ip = getClientIP(event);
    const result = limiter.check(ip);
    if (!result.allowed) {
      console.warn(`Rate limit exceeded for IP: ${ip}`);
      throw createError({
        statusCode: 429,
        statusMessage: "Too Many Requests - Rate limit exceeded",
        data: {
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1e3)
        }
      });
    }
    setHeaders(event, {
      "X-RateLimit-Limit": limiter.maxRequests.toString(),
      "X-RateLimit-Remaining": result.remaining.toString(),
      "X-RateLimit-Reset": new Date(result.resetTime).toISOString()
    });
    return result;
  };
}
function getClientIP(event) {
  var _a, _b, _c, _d, _e, _f, _g;
  const headers = getHeaders(event);
  return ((_a = headers["x-forwarded-for"]) == null ? void 0 : _a.split(",")[0]) || headers["x-real-ip"] || headers["x-client-ip"] || ((_d = (_c = (_b = event.node) == null ? void 0 : _b.req) == null ? void 0 : _c.connection) == null ? void 0 : _d.remoteAddress) || ((_g = (_f = (_e = event.node) == null ? void 0 : _e.req) == null ? void 0 : _f.socket) == null ? void 0 : _g.remoteAddress) || "unknown";
}

const overview_get = defineEventHandler(async (event) => {
  try {
    rateLimiter("admin")(event);
    const query = getQuery$1(event);
    const { startDate, endDate, period } = query;
    console.log("Admin overview API called with filters:", { startDate, endDate, period });
    try {
      const [testResult] = await db.query("SELECT 1 as test");
      console.log("Database connection test successful:", testResult);
    } catch (error) {
      console.error("Database connection test failed:", error);
      throw createError({
        statusCode: 500,
        statusMessage: `Database connection failed: ${error.message}`
      });
    }
    const stats = {};
    const chartData = {};
    let existingTables = [];
    try {
      const [tableResult] = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'nixty'");
      existingTables = tableResult.map((row) => row.table_name);
      console.log("Existing tables:", existingTables);
    } catch (error) {
      console.error("Error getting table list:", error);
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to get table list: ${error.message}`
      });
    }
    const tables = existingTables.filter((table) => {
      return !table.startsWith("_") && !table.includes("pg_");
    });
    console.log("Tables to query:", tables);
    await Promise.all(tables.map(async (table) => {
      try {
        const count = await useCache(`count_${table}`, async () => {
          const [result] = await db.query(`SELECT COUNT(*) as count FROM nixty.${table}`);
          return result[0].count;
        });
        stats[table] = count;
        console.log(`${table}: ${stats[table]} records (cached)`);
      } catch (error) {
        console.error(`Error counting ${table}:`, error);
        stats[table] = 0;
      }
    }));
    const dateClauses = [];
    const dateParams = [];
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateClauses.push(`created_at >= ?`);
      dateParams.push(start);
      dateClauses.push(`created_at <= ?`);
      dateParams.push(end);
    }
    const buildQuery = (baseQuery, conditions = [], params = []) => {
      let whereClause = "";
      const allConditions = [...conditions, ...dateClauses];
      if (allConditions.length > 0) {
        whereClause = ` WHERE ${allConditions.join(" AND ")}`;
      }
      return {
        sql: `${baseQuery}${whereClause}`,
        params: [...params, ...dateParams]
      };
    };
    if (tables.includes("transactions")) {
      try {
        const { groupBy } = getQuery$1(event);
        let dateGroupFormat;
        switch (groupBy) {
          case "daily":
            dateGroupFormat = "%Y-%m-%d";
            break;
          case "weekly":
            dateGroupFormat = "%x-%v";
            break;
          case "monthly":
          default:
            dateGroupFormat = "%Y-%m";
            break;
        }
        const chartQueryBase = `
          SELECT
            TO_CHAR(created_at, ?) AS period,
            SUM(amount) AS total
          FROM transactions`;
        let pgDateFormat;
        switch (groupBy) {
          case "daily":
            pgDateFormat = "YYYY-MM-DD";
            break;
          case "weekly":
            pgDateFormat = "IYYY-IW";
            break;
          case "monthly":
          default:
            pgDateFormat = "YYYY-MM";
            break;
        }
        const chartConditions = [`(status = 'settlement' OR status = 'completed')`];
        const chartQuery = buildQuery(chartQueryBase, chartConditions, [pgDateFormat]);
        chartQuery.sql += ` GROUP BY period`;
        console.log("Executing chart query:", chartQuery.sql, "with params:", chartQuery.params);
        const [chartResult] = await db.query(chartQuery.sql, chartQuery.params);
        chartData.labels = chartResult.map((row) => row.period);
        chartData.values = chartResult.map((row) => parseFloat(row.total));
        console.log(`Generated chart data with ${chartResult.length} results grouped by '${groupBy || "monthly"}'`);
      } catch (error) {
        console.error("Error generating chart data:", error);
        chartData.labels = [];
        chartData.values = [];
      }
    }
    try {
      if (tables.includes("transactions")) {
        try {
          const txCountQuery = buildQuery("SELECT COUNT(*) as count FROM nixty.transactions", ["(status = 'settlement' OR status = 'completed')"]);
          const [totalTransactions] = await db.query(txCountQuery.sql, txCountQuery.params);
          stats.transactions = totalTransactions[0].count;
          stats.totalOrders = stats.transactions;
          const revenueQuery = buildQuery("SELECT COALESCE(SUM(amount), 0) as total FROM nixty.transactions", ["(status = 'settlement' OR status = 'completed')"]);
          const [revenue] = await db.query(revenueQuery.sql, revenueQuery.params);
          stats.totalRevenue = parseFloat(revenue[0].total);
          try {
            const activeUsersQuery = buildQuery(
              "SELECT COUNT(DISTINCT user_id) as count FROM nixty.transactions",
              [
                "(status = 'settlement' OR status = 'completed')",
                "user_id IS NOT NULL"
              ]
            );
            const [activeUsers] = await db.query(activeUsersQuery.sql, activeUsersQuery.params);
            stats.activeUsers = activeUsers[0].count;
          } catch (error) {
            console.error("Error getting active users stats:", error);
            stats.activeUsers = 0;
          }
          try {
            const productsSoldQuery = buildQuery(
              "SELECT COALESCE(SUM(quantity), 0) as total FROM nixty.transactions",
              ["(status = 'settlement' OR status = 'completed')"]
            );
            const [productsSold] = await db.query(productsSoldQuery.sql, productsSoldQuery.params);
            stats.productsSold = parseInt(productsSold[0].total, 10);
          } catch (error) {
            console.error("Error getting products sold stats:", error);
            stats.productsSold = 0;
          }
        } catch (error) {
          console.error("Error getting transaction stats:", error);
          stats.transactions = 0;
          stats.totalRevenue = 0;
        }
      }
      if (tables.includes("products")) {
        try {
          const [activeProducts] = await db.query(
            "SELECT COUNT(*) as count FROM nixty.products WHERE status = $1",
            ["active"]
          );
          stats.activeProducts = activeProducts[0].count;
          const [featuredProducts] = await db.query(
            "SELECT COUNT(*) as count FROM nixty.products WHERE is_featured = $1",
            [true]
          );
          stats.featuredProducts = featuredProducts[0].count;
        } catch (error) {
          console.error("Error getting product stats:", error);
          stats.activeProducts = 0;
          stats.featuredProducts = 0;
        }
      }
      if (tables.includes("users")) {
        try {
          const [adminUsers] = await db.query(
            "SELECT COUNT(*) as count FROM nixty.users WHERE account_type = $1",
            ["admin"]
          );
          stats.adminUsers = adminUsers[0].count;
        } catch (error) {
          console.error("Error getting user stats:", error);
          stats.adminUsers = 0;
        }
      }
      if (tables.includes("announcements")) {
        try {
          const [activeAnnouncements] = await db.query(
            "SELECT COUNT(*) as count FROM nixty.announcements WHERE status = $1",
            ["active"]
          );
          stats.activeAnnouncements = activeAnnouncements[0].count;
        } catch (error) {
          console.error("Error getting announcement stats:", error);
          stats.activeAnnouncements = 0;
        }
      }
      if (tables.includes("product_license_base")) {
        try {
          const [availableLicenses] = await db.query(
            "SELECT COUNT(*) as count FROM nixty.product_license_base WHERE status = $1",
            ["available"]
          );
          stats.availableLicenses = availableLicenses[0].count;
          const [usedLicenses] = await db.query(
            "SELECT COUNT(*) as count FROM nixty.product_license_base WHERE status = $1",
            ["used"]
          );
          stats.usedLicenses = usedLicenses[0].count;
        } catch (error) {
          console.error("Error getting license stats:", error);
          stats.availableLicenses = 0;
          stats.usedLicenses = 0;
        }
      }
    } catch (error) {
      console.error("Error getting additional stats:", error);
    }
    let percentChange = {};
    if (startDate && endDate) {
      try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const periodMs = end.getTime() - start.getTime();
        const prevEnd = new Date(start.getTime() - 1);
        const prevStart = new Date(prevEnd.getTime() - periodMs);
        const prevDateClauses = [];
        const prevDateParams = [];
        prevDateClauses.push(`created_at >= ?`);
        prevDateParams.push(prevStart);
        prevDateClauses.push(`created_at <= ?`);
        prevDateParams.push(prevEnd);
        const buildPrevQuery = (baseQuery, conditions = [], params = []) => {
          let whereClause = "";
          const allConditions = [...conditions, ...prevDateClauses];
          if (allConditions.length > 0) {
            whereClause = ` WHERE ${allConditions.join(" AND ")}`;
          }
          return {
            sql: `${baseQuery}${whereClause}`,
            params: [...params, ...prevDateParams]
          };
        };
        let prevOrders = 0;
        if (tables.includes("transactions")) {
          const prevOrdersQuery = buildPrevQuery("SELECT COUNT(*) as count FROM nixty.transactions", ["(status = 'settlement' OR status = 'completed')"]);
          const [prevOrdersRes] = await db.query(prevOrdersQuery.sql, prevOrdersQuery.params);
          prevOrders = prevOrdersRes[0].count;
        }
        let prevActiveUsers = 0;
        if (tables.includes("transactions")) {
          const prevUsersQuery = buildPrevQuery("SELECT COUNT(DISTINCT user_id) as count FROM nixty.transactions", ["(status = 'settlement' OR status = 'completed')", "user_id IS NOT NULL"]);
          const [prevUsersRes] = await db.query(prevUsersQuery.sql, prevUsersQuery.params);
          prevActiveUsers = prevUsersRes[0].count;
        }
        let prevProductsSold = 0;
        if (tables.includes("transactions")) {
          const prevSoldQuery = buildPrevQuery("SELECT COALESCE(SUM(quantity),0) as total FROM nixty.transactions", ["(status = 'settlement' OR status = 'completed')"]);
          const [prevSoldRes] = await db.query(prevSoldQuery.sql, prevSoldQuery.params);
          prevProductsSold = parseInt(prevSoldRes[0].total, 10);
        }
        let prevRevenue = 0;
        if (tables.includes("transactions")) {
          const prevRevenueQuery = buildPrevQuery("SELECT COALESCE(SUM(amount),0) as total FROM nixty.transactions", ["(status = 'settlement' OR status = 'completed')"]);
          const [prevRevRes] = await db.query(prevRevenueQuery.sql, prevRevenueQuery.params);
          prevRevenue = parseFloat(prevRevRes[0].total);
        }
        const calcPct = (current, prev) => {
          if (!prev || prev === 0) return null;
          return Number(((current - prev) / prev * 100).toFixed(1));
        };
        percentChange = {
          totalOrders: calcPct(stats.totalOrders || 0, prevOrders),
          activeUsers: calcPct(stats.activeUsers || 0, prevActiveUsers),
          productsSold: calcPct(stats.productsSold || 0, prevProductsSold),
          totalRevenue: calcPct(stats.totalRevenue || 0, prevRevenue)
        };
      } catch (err) {
        console.error("Failed to compute previous period stats:", err);
      }
    }
    let recentActivity = [];
    if (tables.includes("transactions")) {
      try {
        const recentActivityData = await useCache("recent_activity", async () => {
          const activityQuery = buildQuery("SELECT id, product_id, total, status, created_at FROM nixty.transactions");
          const finalActivityQuery = `${activityQuery.sql} ORDER BY created_at DESC LIMIT 10`;
          console.log("Executing recent activity query with date filter:", { sql: finalActivityQuery, params: activityQuery.params });
          const [activity] = await db.query(finalActivityQuery, activityQuery.params);
          console.log(`Found ${activity.length} recent transactions`);
          return activity;
        });
        recentActivity = recentActivityData;
      } catch (error) {
        console.error("Error getting recent activity:", error);
      }
    }
    const tableInfo = {};
    for (const table of tables) {
      try {
        const [columns] = await db.query(`
            SELECT column_name as "Field", data_type as "Type", 
                   is_nullable as "Null", column_default as "Default",
                   '' as "Key", '' as "Extra"
            FROM information_schema.columns 
            WHERE table_name = $1 AND table_schema = 'nixty'
            ORDER BY ordinal_position
          `, [table]);
        tableInfo[table] = {
          name: table,
          displayName: table.charAt(0).toUpperCase() + table.slice(1).replace(/_/g, " "),
          columnCount: columns.length,
          recordCount: stats[table] || 0,
          columns: columns.map((col) => ({
            name: col.Field,
            type: col.Type,
            nullable: col.Null === "YES",
            key: col.Key,
            default: col.Default,
            extra: col.Extra
          }))
        };
        console.log(`Table info for ${table}: ${columns.length} columns, ${stats[table]} records`);
      } catch (error) {
        console.error(`Error getting info for ${table}:`, error);
        tableInfo[table] = {
          name: table,
          displayName: table.charAt(0).toUpperCase() + table.slice(1).replace(/_/g, " "),
          columnCount: 0,
          recordCount: 0,
          columns: []
        };
      }
    }
    return {
      success: true,
      data: {
        statistics: stats,
        recentActivity,
        tables: tableInfo,
        chartData,
        percentChange
      }
    };
  } catch (error) {
    console.error("Error getting admin overview:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to get admin overview: ${error.message}`
    });
  }
});

const overview_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: overview_get
}, Symbol.toStringTag, { value: 'Module' }));

const productLicenses_post = defineEventHandler(async (event) => {
  try {
    const headers = getHeaders(event);
    const userId = headers["x-user-id"];
    const userEmail = headers["x-user-email"];
    if (!userId || !userEmail) {
      throw createError({
        statusCode: 401,
        statusMessage: "Admin authentication required"
      });
    }
    const body = await readBody(event);
    console.log("Product license creation request:", body);
    if (!body || typeof body !== "object") {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid request body"
      });
    }
    if (!body.product_id || !body.license_type) {
      throw createError({
        statusCode: 400,
        statusMessage: "product_id and license_type are required"
      });
    }
    if (!["product_key", "email_password"].includes(body.license_type)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'license_type must be either "product_key" or "email_password"'
      });
    }
    const [productRows] = await db.query(
      "SELECT id, name FROM nixty.products WHERE id = $1 AND status = $2",
      [body.product_id, "active"]
    );
    if (productRows.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "Product not found or inactive"
      });
    }
    const baseLicenseData = {
      product_id: body.product_id,
      license_type: body.license_type,
      status: body.status || "available",
      notes: body.notes || null,
      send_license: 0,
      max_usage: body.license_type === "product_key" ? 5 : 1
    };
    const baseLicense = await db.insert("product_license_base", baseLicenseData);
    const licenseId = baseLicense.id;
    if (body.license_type === "product_key") {
      const licenseKey = body.license_key || generateLicenseKey();
      console.log("Processing license key - provided:", body.license_key, "final:", licenseKey);
      await db.insert("product_license_keys", {
        id: licenseId,
        product_key: licenseKey
      });
    } else if (body.license_type === "email_password") {
      if (!body.email || !body.password) {
        throw createError({
          statusCode: 400,
          statusMessage: "email and password are required for email_password license type"
        });
      }
      await db.insert("product_license_accounts", {
        id: licenseId,
        email: body.email,
        password: body.password
      });
    }
    let licenseData;
    if (body.license_type === "product_key") {
      const [rows] = await db.query(`
        SELECT 
          plb.id, plb.product_id, plb.license_type, plb.status, plb.notes,
          plk.product_key as license_key,
          p.name as product_name
        FROM nixty.product_license_base plb
        JOIN nixty.product_license_keys plk ON plb.id = plk.id
        JOIN nixty.products p ON plb.product_id = p.id
        WHERE plb.id = $1
      `, [licenseId]);
      licenseData = rows[0];
    } else {
      const [rows] = await db.query(`
        SELECT 
          plb.id, plb.product_id, plb.license_type, plb.status, plb.notes,
          pla.email, pla.password,
          p.name as product_name
        FROM nixty.product_license_base plb
        JOIN nixty.product_license_accounts pla ON plb.id = pla.id
        JOIN nixty.products p ON plb.product_id = p.id
        WHERE plb.id = $1
      `, [licenseId]);
      licenseData = rows[0];
    }
    return {
      success: true,
      message: "Product license created successfully",
      data: licenseData
    };
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    console.error("Error creating product license:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create product license"
    });
  }
});
function generateLicenseKey() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) result += "-";
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const productLicenses_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: productLicenses_post
}, Symbol.toStringTag, { value: 'Module' }));

const use_post = defineEventHandler(async (event) => {
  try {
    const headers = getHeaders(event);
    const userId = headers["x-user-id"];
    const userEmail = headers["x-user-email"];
    if (!userId || !userEmail) {
      throw createError({
        statusCode: 401,
        statusMessage: "Admin authentication required"
      });
    }
    const body = await readBody(event);
    console.log("License usage request:", body);
    const { license_id, transaction_id } = body;
    if (!license_id) {
      throw createError({
        statusCode: 400,
        statusMessage: "license_id is required"
      });
    }
    const [licenseRows] = await db.query(`
      SELECT 
        pl.*,
        p.name as product_name,
        p.version as product_version
      FROM product_licenses pl
      JOIN products p ON pl.product_id = p.id
      WHERE pl.id = ?
    `, [license_id]);
    if (licenseRows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "License not found"
      });
    }
    const license = licenseRows[0];
    if (license.send_license >= license.max_usage) {
      throw createError({
        statusCode: 400,
        statusMessage: "License has reached maximum usage limit"
      });
    }
    if (license.expires_at && new Date(license.expires_at) < /* @__PURE__ */ new Date()) {
      throw createError({
        statusCode: 400,
        statusMessage: "License has expired"
      });
    }
    if (license.status === "reserved" || license.status === "expired") {
      throw createError({
        statusCode: 400,
        statusMessage: `License is ${license.status} and cannot be used`
      });
    }
    let newStatus;
    if (newSendLicense >= license.max_usage) {
      newStatus = "used";
    } else {
      newStatus = "partially_used";
    }
    const updateQuery = `
      UPDATE product_licenses 
      SET send_license = ?, status = ?,
        updated_at = NOW()
      WHERE id = ?
    `;
    await db.query(updateQuery, [
      newSendLicense,
      newSendLicense,
      newStatus,
      transaction_id || null,
      license_id
    ]);
    const [updatedLicense] = await db.query(`
      SELECT 
        pl.*,
        p.name as product_name,
        p.version as product_version,
        (pl.max_usage - pl.usage_count) as remaining_uses
      FROM product_licenses pl
      JOIN products p ON pl.product_id = p.id
      WHERE pl.id = ?
    `, [license_id]);
    console.log(`License ${license_id} used. Usage: ${newSendLicense}/${license.max_usage}, Status: ${newStatus}`);
    return {
      success: true,
      message: `License used successfully. ${license.max_usage - newSendLicense} uses remaining.`,
      data: {
        license: updatedLicense[0],
        usage_info: {
          previous_usage: license.send_license,
          new_usage: newSendLicense,
          max_usage: license.max_usage,
          remaining_uses: license.max_usage - newSendLicense,
          status_changed: license.status !== newStatus,
          previous_status: license.status,
          new_status: newStatus
        }
      }
    };
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    console.error("Error using license:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to use license"
    });
  }
});

const use_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: use_post
}, Symbol.toStringTag, { value: 'Module' }));

const productNamesVersions = defineEventHandler(async (event) => {
  try {
    const query = getQuery$1(event);
    const type = query.type || "all";
    const productName = query.product_name || "";
    console.log(`Fetching product ${type} ${productName ? "for " + productName : ""}`);
    let sql = "";
    let params = [];
    const schemaPrefix = "nixty.";
    if (type === "names") {
      sql = `SELECT DISTINCT name FROM ${schemaPrefix}products ORDER BY name ASC`;
    } else if (type === "versions" && productName) {
      sql = `SELECT DISTINCT version FROM ${schemaPrefix}products WHERE name = ? ORDER BY version ASC`;
      params = [productName];
    } else {
      sql = `SELECT id, name, version FROM ${schemaPrefix}products ORDER BY id ASC`;
    }
    const [results] = await db.query(sql, params);
    let data = [];
    if (results && results.length > 0) {
      if (type === "names") {
        data = results.map((r) => r.name).filter(Boolean);
      } else if (type === "versions") {
        data = results.map((r) => r.version).filter(Boolean);
      } else {
        data = results.map((p) => ({
          id: p.id,
          name: p.name || "",
          version: p.version || ""
        }));
      }
    }
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      success: false,
      error: "Failed to fetch product list",
      message: error.message
    };
  }
});

const productNamesVersions$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: productNamesVersions
}, Symbol.toStringTag, { value: 'Module' }));

const getAvailableLicense = async (productId) => {
  try {
    const [licenses] = await db.execute(
      `SELECT * FROM product_licenses 
       WHERE product_id = ? 
         AND status = 'available' 
         AND (send_license < max_usage OR send_license IS NULL)
       ORDER BY 
         CASE WHEN send_license IS NULL OR send_license = 0 THEN 0 ELSE 1 END,
         send_license ASC,
         created_at ASC 
       LIMIT 1
       FOR UPDATE SKIP LOCKED`,
      [productId]
    );
    if (licenses.length === 0) {
      return { success: false, message: "No available licenses for this product" };
    }
    return { success: true, license: licenses[0] };
  } catch (error) {
    console.error("Error getting available license:", error);
    return { success: false, error: error.message };
  }
};
const assignLicenseToTransaction$2 = async (licenseId, transactionId) => {
  try {
    const [currentLicense] = await db.execute(
      `SELECT product_id, send_license, max_usage FROM product_licenses WHERE id = ?`,
      [licenseId]
    );
    if (currentLicense.length === 0) {
      return { success: false, error: "License not found" };
    }
    const license = currentLicense[0];
    const productId = license.product_id;
    const currentUsage = license.send_license || 0;
    const maxUsage = license.max_usage || 1;
    const newUsage = currentUsage + 1;
    if (newUsage > maxUsage) {
      return { success: false, error: "License usage limit exceeded" };
    }
    const newStatus = newUsage >= maxUsage ? "used" : "available";
    await db.execute(
      `UPDATE product_licenses 
       SET send_license = ?, status = ?, updated_at = NOW()
       WHERE id = ?`,
      [newUsage, newStatus, licenseId]
    );
    try {
      await db.execute(
        `INSERT INTO license_usage_history (license_id, transaction_id, used_at, usage_number)
         VALUES (?, ?, NOW(), ?)`,
        [licenseId, transactionId, newUsage]
      );
      console.log(`License usage history recorded for transaction ${transactionId}`);
    } catch (historyError) {
      console.warn(`Could not record license usage history: ${historyError.message}`);
    }
    console.log(`License ${licenseId} assigned to transaction ${transactionId} (usage ${newUsage}/${maxUsage})`);
    console.log(`License status updated to ${newStatus}`);
    return { success: true, send_license: newUsage, max_usage: maxUsage };
  } catch (error) {
    console.error("Error assigning license to transaction:", error);
    return { success: false, error: error.message };
  }
};
const getProductInfo = async (productId) => {
  try {
    const [products] = await db.execute(
      `SELECT id, name, version, price, image_url, license_type_default
       FROM products WHERE id = ?`,
      [productId]
    );
    if (products.length === 0) {
      return { success: false, message: "Product not found" };
    }
    return { success: true, product: products[0] };
  } catch (error) {
    console.error("Error getting product info:", error);
    return { success: false, error: error.message };
  }
};
const processLicenseDelivery = async (transactionId, productId, customerEmail, customerName) => {
  try {
    console.log(`Processing license delivery for transaction ${transactionId}`);
    const productResult = await getProductInfo(productId);
    if (!productResult.success) {
      return productResult;
    }
    const product = productResult.product;
    const productName = `${product.name} ${product.version || ""}`.trim();
    const licenseResult = await getAvailableLicense(productId);
    if (!licenseResult.success) {
      console.error(`No available license for product ${productId}:`, licenseResult.message);
      return licenseResult;
    }
    const license = licenseResult.license;
    console.log(`Selected license ${license.id} for transaction ${transactionId}`);
    const assignResult = await assignLicenseToTransaction$2(license.id, transactionId);
    if (!assignResult.success) {
      return assignResult;
    }
    const licenseInfo = {
      license_id: license.id,
      license_type: license.license_type,
      product_key: license.product_key,
      email: license.email,
      password: license.password,
      additional_info: license.additional_info,
      notes: license.notes,
      send_license: assignResult.send_license || 1,
      max_usage: license.max_usage || 1,
      expires_at: license.expires_at
    };
    console.log(`License ${license.id} prepared for delivery to ${customerEmail}`);
    return {
      success: true,
      license: licenseInfo,
      productName,
      customerEmail,
      customerName
    };
  } catch (error) {
    console.error("Error processing license delivery:", error);
    return { success: false, error: error.message };
  }
};
const processMultipleLicenses = async (transactionId, productId, quantity, customerEmail, customerName) => {
  try {
    console.log(`Processing ${quantity} licenses for transaction ${transactionId}`);
    const productResult = await getProductInfo(productId);
    if (!productResult.success) {
      return productResult;
    }
    const product = productResult.product;
    const productName = `${product.name} ${product.version || ""}`.trim();
    const allLicenses = [];
    const processedLicenseIds = [];
    for (let i = 0; i < quantity; i++) {
      console.log(`Processing license ${i + 1}/${quantity}...`);
      const licenseResult = await getAvailableLicense(productId);
      if (!licenseResult.success) {
        console.error(`No available license ${i + 1} for product ${productId}:`, licenseResult.message);
        for (const licenseId of processedLicenseIds) {
          await db.execute(
            `UPDATE product_licenses SET send_license = send_license - 1, 
             status = CASE WHEN send_license - 1 < max_usage THEN 'available' ELSE status END 
             WHERE id = ?`,
            [licenseId]
          );
        }
        return { success: false, message: `Only ${i} licenses available, but ${quantity} requested` };
      }
      const license = licenseResult.license;
      console.log(`Selected license ${license.id} for transaction ${transactionId} (${i + 1}/${quantity})`);
      const assignResult = await assignLicenseToTransaction$2(license.id, transactionId);
      if (!assignResult.success) {
        console.error(`Failed to assign license ${license.id}:`, assignResult.error);
        for (const licenseId of processedLicenseIds) {
          await db.execute(
            `UPDATE product_licenses SET send_license = send_license - 1, 
             status = CASE WHEN send_license - 1 < max_usage THEN 'available' ELSE status END 
             WHERE id = ?`,
            [licenseId]
          );
        }
        return assignResult;
      }
      const licenseInfo = {
        license_id: license.id,
        license_type: license.license_type,
        product_key: license.product_key,
        email: license.email,
        password: license.password,
        additional_info: license.additional_info,
        notes: license.notes,
        send_license: assignResult.send_license || 1,
        max_usage: license.max_usage || 1,
        expires_at: license.expires_at
      };
      allLicenses.push(licenseInfo);
      processedLicenseIds.push(license.id);
      console.log(`License ${license.id} processed successfully (${i + 1}/${quantity})`);
    }
    console.log(`Successfully processed ${allLicenses.length} licenses for transaction ${transactionId}`);
    return {
      success: true,
      licenses: allLicenses,
      productName,
      customerEmail,
      customerName
    };
  } catch (error) {
    console.error("Error processing multiple licenses:", error);
    return { success: false, error: error.message };
  }
};

const __filename = fileURLToPath(globalThis._importMeta_.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
const emailConfig = {
  host: process.env.MAIL_HOST || process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.MAIL_PORT || process.env.SMTP_PORT || "587"),
  secure: false,
  // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER || process.env.SMTP_USER || "",
    // Your email
    pass: process.env.MAIL_PASS || process.env.SMTP_PASS || ""
    // Your email password or app password
  },
  // Add required Gmail settings for external recipients
  tls: {
    rejectUnauthorized: false
  },
  debug: true,
  // Enable debug output to help diagnose issues
  logger: true
  // Enable logging
};
let transporter = null;
const getTransporter = async () => {
  console.log("[EMAIL SERVICE] Initializing email transporter...");
  console.log("[EMAIL SERVICE] Email config:", JSON.stringify({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    auth: { user: emailConfig.auth.user ? `${emailConfig.auth.user.slice(0, 3)}***` : "NOT SET" }
  }));
  if (!transporter) {
    try {
      const { createTransport } = await import('file://C:/Users/E31/Downloads/project_nixty/node_modules/nodemailer/lib/nodemailer.js');
      transporter = createTransport(emailConfig);
      console.log("[EMAIL SERVICE] Transporter created successfully");
    } catch (error) {
      console.error("[EMAIL SERVICE] Failed to create transporter:", error);
      throw error;
    }
  }
  return transporter;
};
const getLicenseEmailTemplate = (customerName, productName, licenseInfo, orderId = null) => {
  const { license_type, product_key, email, password, additional_info, notes, send_license, max_usage } = licenseInfo;
  let licenseContent = "";
  switch (license_type) {
    case "product_key":
      licenseContent = `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2c3e50; margin-top: 0;">Product License Key</h3>
          <p style="font-size: 18px; font-weight: bold; color: #e74c3c; font-family: monospace; background: white; padding: 15px; border: 2px dashed #3498db; border-radius: 5px; text-align: center;">
            ${product_key}
          </p>
          ${additional_info ? `<p><strong>Additional Information:</strong> ${additional_info}</p>` : ""}
          ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ""}
        </div>
      `;
      break;
    case "email_password":
      licenseContent = `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2c3e50; margin-top: 0;">Account Credentials</h3>
          <div style="background: white; padding: 15px; border-radius: 5px; border: 1px solid #dee2e6;">
            <p><strong>Email:</strong> <span style="font-family: monospace; color: #2980b9;">${email}</span></p>
            <p><strong>Password:</strong> <span style="font-family: monospace; color: #e74c3c;">${password}</span></p>
          </div>
          ${additional_info ? `<p><strong>Additional Information:</strong> ${additional_info}</p>` : ""}
          ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ""}
        </div>
      `;
      break;
  }
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your ${productName} License</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; border-bottom: 3px solid #3498db; padding-bottom: 20px; margin-bottom: 30px;">
        <h1 style="color: #2c3e50; margin: 0;">Nixty</h1>
        <p style="color: #7f8c8d; margin: 5px 0;">Digital Software Solutions</p>
      </div>
      
      <h2 style="color: #2c3e50;">Thank you for your purchase!</h2>
      
      <p>Dear ${customerName},</p>
      
      <p>Thank you for purchasing <strong>${productName}</strong> from Nixty. Your payment has been successfully processed${orderId ? ` with Order ID: <strong>${orderId}</strong>` : ""}, and below are your license details:</p>
      
      ${licenseContent}
      
      <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
        <h4 style="color: #856404; margin-top: 0;">Installation & Usage Guide:</h4>
        <div style="background: #e8f4f8; border: 1px solid #bee5eb; border-radius: 5px; padding: 15px; margin: 10px 0;">
          <p style="margin: 0; color: #0c5460; font-weight: 600;">
            \u{1F4C1} <strong>Complete Installation Guide:</strong><br>
            <a href="https://drive.google.com/drive/folders/152-8EDjMmHhhKkTF4Fzj9EuqQ3OprfV0?usp=sharing" 
               style="color: #0366d6; text-decoration: none; font-size: 14px;"
               target="_blank">
              https://drive.google.com/drive/folders/152-8EDjMmHhhKkTF4Fzj9EuqQ3OprfV0?usp=sharing
            </a>
          </p>
        </div>
        <ol style="color: #856404; margin-bottom: 10px;">
          <li>Download the software from the official website or provided link</li>
          <li>Install the software following the installation wizard</li>
          <li>When prompted for activation, use the license information provided above</li>
          <li>For product keys: Copy and paste the key exactly as shown</li>
          <li>For account credentials: Use the email and password combination provided</li>
        </ol>
        <h4 style="color: #856404; margin-top: 15px;">Important Information:</h4>
        <ul style="color: #856404; margin-bottom: 0;">
          <li>Please save this email for your records</li>
          <li>Refer to the installation guide link above for step-by-step instructions</li>
          <li>Keep your license information secure and confidential</li>
          <li>Each license can only be used according to its terms and limitations</li>
          ${orderId ? `<li>Reference Order ID <strong>${orderId}</strong> for any support inquiries</li>` : ""}
          <li>For technical support, please contact our support team</li>
        </ul>
      </div>
      
      <div style="border-top: 1px solid #dee2e6; padding-top: 20px; margin-top: 30px; text-align: center; color: #6c757d; font-size: 14px;">
        <p>This email was sent from Nixty. If you have any questions, please contact our support team.</p>
        <p>\xA9 2025 Nixty. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
};
const getMultipleLicenseEmailTemplate = (customerName, productName, licenseInfoArray, orderId = null) => {
  let licenseContentArray = [];
  licenseInfoArray.forEach((licenseInfo, index) => {
    const { license_type, product_key, email, password, additional_info, notes, send_license, max_usage } = licenseInfo;
    let licenseContent = "";
    switch (license_type) {
      case "product_key":
        licenseContent = `
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3498db;">
            <h4 style="color: #2c3e50; margin-top: 0;">Product Key #${index + 1}</h4>
            <p style="font-size: 16px; font-weight: bold; color: #e74c3c; font-family: monospace; background: white; padding: 12px; border: 2px dashed #3498db; border-radius: 5px; text-align: center;">
              ${product_key}
            </p>
            ${additional_info ? `<p><strong>Additional Information:</strong> ${additional_info}</p>` : ""}
            ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ""}
          </div>
        `;
        break;
      case "email_password":
        licenseContent = `
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #27ae60;">
            <h4 style="color: #2c3e50; margin-top: 0;">Account Credentials #${index + 1}</h4>
            <div style="background: white; padding: 15px; border-radius: 5px; border: 1px solid #dee2e6;">
              <p><strong>Email:</strong> <span style="font-family: monospace; color: #2980b9;">${email}</span></p>
              <p><strong>Password:</strong> <span style="font-family: monospace; color: #e74c3c;">${password}</span></p>
            </div>
            ${additional_info ? `<p><strong>Additional Information:</strong> ${additional_info}</p>` : ""}
            ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ""}
          </div>
        `;
        break;
    }
    licenseContentArray.push(licenseContent);
  });
  const allLicenseContent = licenseContentArray.join("");
  const licenseCount = licenseInfoArray.length;
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your ${productName} License${licenseCount > 1 ? "s" : ""}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; border-bottom: 3px solid #3498db; padding-bottom: 20px; margin-bottom: 30px;">
        <h1 style="color: #2c3e50; margin: 0;">Nixty</h1>
        <p style="color: #7f8c8d; margin: 5px 0;">Digital Software Solutions</p>
      </div>
      
      <h2 style="color: #2c3e50;">Thank you for your purchase!</h2>
      
      <p>Dear ${customerName},</p>
      
      <p>Thank you for purchasing <strong>${productName}</strong> from Nixty. Your payment has been successfully processed${orderId ? ` with Order ID: <strong>${orderId}</strong>` : ""}, and below are your ${licenseCount} license${licenseCount > 1 ? "s" : ""}:</p>
      
      ${allLicenseContent}
      
      <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
        <h4 style="color: #856404; margin-top: 0;">Installation & Usage Guide:</h4>
        <div style="background: #e8f4f8; border: 1px solid #bee5eb; border-radius: 5px; padding: 15px; margin: 10px 0;">
          <p style="margin: 0; color: #0c5460; font-weight: 600;">
            \u{1F4C1} <strong>Complete Installation Guide:</strong><br>
            <a href="https://drive.google.com/drive/folders/152-8EDjMmHhhKkTF4Fzj9EuqQ3OprfV0?usp=sharing" 
               style="color: #0366d6; text-decoration: none; font-size: 14px;"
               target="_blank">
              https://drive.google.com/drive/folders/152-8EDjMmHhhKkTF4Fzj9EuqQ3OprfV0?usp=sharing
            </a>
          </p>
        </div>
        <ol style="color: #856404; margin-bottom: 10px;">
          <li>Download the software from the official website or provided link</li>
          <li>Install the software following the installation wizard</li>
          <li>When prompted for activation, choose the appropriate license from those provided above</li>
          <li>For product keys: Copy and paste each key exactly as shown</li>
          <li>For account credentials: Use the respective email and password combinations</li>
          <li>${licenseCount > 1 ? "You can use different licenses for different installations or devices as per the terms" : "Use this license for your installation"}</li>
        </ol>
        <h4 style="color: #856404; margin-top: 15px;">Important Information:</h4>
        <ul style="color: #856404; margin-bottom: 0;">
          <li>Please save this email for your records</li>
          <li>Refer to the installation guide link above for step-by-step instructions</li>
          <li>Keep your license information secure and confidential</li>
          <li>${licenseCount > 1 ? "Each license can be used according to its individual terms and limitations" : "Use this license according to its terms and limitations"}</li>
          ${orderId ? `<li>Reference Order ID <strong>${orderId}</strong> for any support inquiries</li>` : ""}
          <li>For technical support, please contact our support team</li>
        </ul>
      </div>
      
      <div style="border-top: 1px solid #dee2e6; padding-top: 20px; margin-top: 30px; text-align: center; color: #6c757d; font-size: 14px;">
        <p>This email was sent from Nixty. If you have any questions, please contact our support team.</p>
        <p>\xA9 2025 Nixty. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
};
const sendMultipleLicenseEmail = async (customerEmail, customerName, productName, licenseInfoArray, orderId = null, customEmail = null) => {
  try {
    console.log("[EMAIL SERVICE] Sending multiple license email");
    console.log(`[EMAIL SERVICE] Recipients: ${customerEmail}${customEmail ? ", " + customEmail : ""}`);
    console.log(`[EMAIL SERVICE] Product: ${productName}, Order ID: ${orderId || "N/A"}`);
    console.log(`[EMAIL SERVICE] Licenses count: ${licenseInfoArray.length}`);
    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      console.log("Email service not configured. Multiple licenses info:", licenseInfoArray);
      return { success: false, message: "Email service not configured" };
    }
    let finalRecipient2 = null;
    if (customerEmail && customerEmail.trim() !== "") {
      finalRecipient2 = customerEmail.trim();
    }
    if (customEmail && customEmail.trim() !== "" && customEmail.trim() !== (customerEmail == null ? void 0 : customerEmail.trim())) {
      finalRecipient2 = customEmail.trim();
      console.log("[EMAIL SERVICE] Using custom email as priority recipient");
    }
    if (!finalRecipient2) {
      console.error("[EMAIL SERVICE] No valid email recipients provided");
      await logEmailResult(orderId, "No recipients", null, "failed", "No valid email recipients provided");
      return { success: false, error: "No valid email recipients provided" };
    }
    console.log("[EMAIL SERVICE] Final recipient:", finalRecipient2);
    const transporter2 = await getTransporter();
    const mailOptions = {
      from: `"no-reply@nixty" <${emailConfig.auth.user}>`,
      to: finalRecipient2,
      subject: `Your ${productName} License${licenseInfoArray.length > 1 ? "s" : ""} ${orderId ? `- Order #${orderId}` : ""} - Nixty`,
      html: getMultipleLicenseEmailTemplate(customerName, productName, licenseInfoArray, orderId)
    };
    console.log("[EMAIL SERVICE] Sending email with options:", {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      hasHTML: !!mailOptions.html
    });
    const info = await transporter2.sendMail(mailOptions);
    console.log("Multiple license email sent successfully:", info.messageId);
    await logEmailResult(orderId, finalRecipient2, null, "success", null);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("[EMAIL SERVICE] Error sending multiple license email:", error);
    console.error("[EMAIL SERVICE] Error details:", {
      code: error.code,
      command: error.command,
      message: error.message,
      stack: error.stack
    });
    try {
      await logEmailResult(orderId, finalRecipient || customerEmail || "unknown", null, "failed", error.message);
    } catch (logError) {
      console.error("[EMAIL SERVICE] Failed to log email error:", logError);
    }
    return { success: false, error: error.message };
  }
};
const sendLicenseEmail = async (customerEmail, customerName, productName, licenseInfo, orderId = null, customEmail = null) => {
  try {
    console.log("[EMAIL SERVICE] Sending single license email");
    console.log(`[EMAIL SERVICE] Recipients: ${customerEmail}${customEmail ? ", " + customEmail : ""}`);
    console.log(`[EMAIL SERVICE] Product: ${productName}, Order ID: ${orderId || "N/A"}`);
    console.log(`[EMAIL SERVICE] License type: ${licenseInfo.license_type}`);
    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      console.log("Email service not configured. License info:", licenseInfo);
      return { success: false, message: "Email service not configured" };
    }
    let finalRecipient2 = null;
    if (customerEmail && customerEmail.trim() !== "") {
      finalRecipient2 = customerEmail.trim();
    }
    if (customEmail && customEmail.trim() !== "" && customEmail.trim() !== (customerEmail == null ? void 0 : customerEmail.trim())) {
      finalRecipient2 = customEmail.trim();
      console.log("[EMAIL SERVICE] Using custom email as priority recipient");
    }
    if (!finalRecipient2) {
      console.error("[EMAIL SERVICE] No valid email recipients provided");
      await logEmailResult(orderId, "No recipients", null, "failed", "No valid email recipients provided");
      return { success: false, error: "No valid email recipients provided" };
    }
    console.log("[EMAIL SERVICE] Final recipient:", finalRecipient2);
    const transporter2 = await getTransporter();
    const mailOptions = {
      from: `"no-reply@nixty" <${emailConfig.auth.user}>`,
      to: finalRecipient2,
      subject: `Your ${productName} License${orderId ? ` - Order #${orderId}` : ""} - Nixty`,
      html: getLicenseEmailTemplate(customerName, productName, licenseInfo, orderId)
    };
    console.log("[EMAIL SERVICE] Sending email with options:", {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      hasHTML: !!mailOptions.html
    });
    const info = await transporter2.sendMail(mailOptions);
    console.log("License email sent successfully:", info.messageId);
    await logEmailResult(orderId, finalRecipient2, null, "success", null);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("[EMAIL SERVICE] Error sending license email:", error);
    console.error("[EMAIL SERVICE] Error details:", {
      code: error.code,
      command: error.command,
      message: error.message,
      stack: error.stack
    });
    try {
      await logEmailResult(orderId, finalRecipient || customerEmail || "unknown", null, "failed", error.message);
    } catch (logError) {
      console.error("[EMAIL SERVICE] Failed to log email error:", logError);
    }
    return { success: false, error: error.message };
  }
};
const testEmailConnection = async () => {
  try {
    console.log("[EMAIL SERVICE] Testing email connection to", emailConfig.host);
    const transporter2 = await getTransporter();
    console.log("[EMAIL SERVICE] Verifying SMTP connection...");
    const verifyResult = await transporter2.verify();
    console.log("[EMAIL SERVICE] Verification successful:", verifyResult);
    console.log("Email service is ready");
    return { success: true };
  } catch (error) {
    console.error("Email service connection failed:", error);
    return { success: false, error: error.message };
  }
};
const logEmailResult = async (orderId, recipients, ccRecipient, status, errorMessage = null) => {
  try {
    await db.execute(
      `INSERT INTO nixty.email_logs (order_id, recipients, status, error_message) VALUES (?, ?, ?, ?)`,
      [orderId, recipients, status, errorMessage]
    );
  } catch (dbError) {
    console.error("[EMAIL SERVICE] Failed to log email result to database:", dbError.message);
  }
};

const retryFailedDeliveries_post = defineEventHandler(async (event) => {
  try {
    const headers = getHeaders(event);
    const userId = headers["x-user-id"];
    const userEmail = headers["x-user-email"];
    if (!userId || !userEmail) {
      throw createError({
        statusCode: 401,
        statusMessage: "Admin authentication required"
      });
    }
    const body = await readBody(event);
    const { transactionId, retryAll = false } = body;
    console.log("\u{1F504} Starting manual retry for failed license deliveries...");
    let results = [];
    if (retryAll) {
      const failedDeliveries = await WebhookLogger.getFailedDeliveries(100);
      console.log(`Found ${failedDeliveries.length} failed deliveries to retry`);
      for (const failure of failedDeliveries) {
        const retryResult = await retryLicenseDelivery(failure.transaction_id, failure.order_id);
        results.push({
          transaction_id: failure.transaction_id,
          order_id: failure.order_id,
          ...retryResult
        });
      }
    } else if (transactionId) {
      const [transactions] = await db.execute(
        "SELECT order_id FROM transactions WHERE id = ?",
        [transactionId]
      );
      if (transactions.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: "Transaction not found"
        });
      }
      const retryResult = await retryLicenseDelivery(transactionId, transactions[0].order_id);
      results.push({
        transaction_id: transactionId,
        order_id: transactions[0].order_id,
        ...retryResult
      });
    } else {
      throw createError({
        statusCode: 400,
        statusMessage: "Either transactionId or retryAll=true is required"
      });
    }
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;
    return {
      success: true,
      message: `Retry completed: ${successful} successful, ${failed} failed`,
      results,
      summary: {
        total: results.length,
        successful,
        failed
      }
    };
  } catch (error) {
    console.error("Error retrying failed deliveries:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "Failed to retry deliveries"
    });
  }
});
async function retryLicenseDelivery(transactionId, orderId) {
  var _a;
  console.log(`\u{1F504} Retrying license delivery for transaction ${transactionId} (${orderId})`);
  try {
    await WebhookLogger.incrementRetryCount(transactionId);
    const [transactions] = await db.execute(
      "SELECT * FROM transactions WHERE id = ?",
      [transactionId]
    );
    if (transactions.length === 0) {
      throw new Error("Transaction not found");
    }
    const transaction = transactions[0];
    if (transaction.status !== "completed" && !["settlement", "capture"].includes((_a = transaction.payment_gateway_status) == null ? void 0 : _a.toLowerCase())) {
      throw new Error("Transaction is not completed");
    }
    let customEmail = transaction.email;
    if (transaction.payment_gateway_payload) {
      try {
        const payload = JSON.parse(transaction.payment_gateway_payload);
        if (payload.custom_email) {
          customEmail = payload.custom_email;
        }
      } catch (parseError) {
        console.warn("Could not parse payload for custom email:", parseError.message);
      }
    }
    const [existingLicenses] = await db.execute(
      "SELECT COUNT(*) as count FROM license_usage_history WHERE transaction_id = ?",
      [transactionId]
    );
    const existingCount = existingLicenses[0].count;
    const quantity = transaction.quantity || 1;
    const remainingQuantity = quantity - existingCount;
    console.log(`Transaction ${transactionId}: ${existingCount}/${quantity} licenses already processed, ${remainingQuantity} remaining`);
    if (remainingQuantity <= 0) {
      await WebhookLogger.markLicenseDeliveryResolved(transactionId);
      return {
        success: true,
        message: "All licenses already processed",
        licenses_processed: existingCount,
        total_quantity: quantity
      };
    }
    await db.execute("START TRANSACTION");
    try {
      const allLicenses = [];
      let licensesProcessed = 0;
      const [existingLicenseData] = await db.execute(`
        SELECT 
          pl.license_type,
          pl.product_key,
          pl.email,
          pl.password,
          pl.additional_info,
          pl.notes,
          pl.expires_at,
          pl.usage_count,
          pl.max_usage
        FROM license_usage_history luh
        JOIN product_licenses pl ON pl.id = luh.license_id
        WHERE luh.transaction_id = ?
        ORDER BY luh.used_at ASC
      `, [transactionId]);
      existingLicenseData.forEach((license) => {
        allLicenses.push(license);
      });
      for (let i = 0; i < remainingQuantity; i++) {
        console.log(`Processing remaining license ${i + 1}/${remainingQuantity}...`);
        const licenseResult = await processLicenseDelivery(
          transaction.id,
          transaction.product_id,
          customEmail,
          transaction.customer_name || "Customer"
        );
        if (licenseResult.success) {
          allLicenses.push(licenseResult.license);
          licensesProcessed++;
        } else {
          throw new Error(`Failed to process license ${i + 1}: ${licenseResult.error || licenseResult.message}`);
        }
      }
      let emailSent = false;
      if (allLicenses.length > 0) {
        const emailResult = await sendMultipleLicenseEmail(
          customEmail,
          transaction.customer_name || "Customer",
          transaction.product_name,
          allLicenses
        );
        if (emailResult.success) {
          emailSent = true;
          console.log(`License email sent successfully to ${customEmail} with ${allLicenses.length} license(s)`);
        } else {
          console.warn(`Failed to send license email: ${emailResult.error || emailResult.message}`);
        }
      }
      await db.execute("COMMIT");
      if (licensesProcessed === remainingQuantity) {
        await WebhookLogger.markLicenseDeliveryResolved(transactionId);
      }
      return {
        success: true,
        message: `Successfully processed ${licensesProcessed} remaining licenses`,
        licenses_processed: licensesProcessed,
        total_licenses: allLicenses.length,
        email_sent: emailSent,
        total_quantity: quantity
      };
    } catch (processingError) {
      await db.execute("ROLLBACK");
      throw processingError;
    }
  } catch (error) {
    console.error(`Failed to retry license delivery for transaction ${transactionId}:`, error);
    return {
      success: false,
      error: error.message,
      licenses_processed: 0
    };
  }
}

const retryFailedDeliveries_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: retryFailedDeliveries_post
}, Symbol.toStringTag, { value: 'Module' }));

const retryLicenseDelivery_post = defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { transactionId } = body;
    if (!transactionId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Transaction ID is required"
      });
    }
    const [transactions] = await db.execute(
      "SELECT * FROM transactions WHERE id = ?",
      [transactionId]
    );
    if (transactions.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Transaction not found"
      });
    }
    const transaction = transactions[0];
    if (transaction.status !== "completed") {
      throw createError({
        statusCode: 400,
        statusMessage: "Transaction must be completed to retry license delivery"
      });
    }
    let customEmail = transaction.email;
    if (transaction.payment_gateway_payload) {
      try {
        const payload = JSON.parse(transaction.payment_gateway_payload);
        if (payload.custom_email) {
          customEmail = payload.custom_email;
        }
      } catch (parseError) {
        console.error("Error parsing payment gateway payload:", parseError);
      }
    }
    const [existingLicenses] = await db.execute(
      `SELECT COUNT(*) as count FROM license_usage_history WHERE transaction_id = ?`,
      [transactionId]
    );
    const existingCount = existingLicenses[0].count;
    let totalQuantity = 1;
    if (transaction.payment_gateway_payload) {
      try {
        const payload = JSON.parse(transaction.payment_gateway_payload);
        if (payload.licenses_requested) {
          totalQuantity = payload.licenses_requested;
        }
      } catch (parseError) {
        console.error("Error parsing quantity from payload:", parseError);
      }
    }
    const remainingQuantity = totalQuantity - existingCount;
    if (remainingQuantity <= 0) {
      return {
        success: true,
        message: "All licenses already processed",
        existingCount,
        totalQuantity
      };
    }
    console.log(`Retrying license delivery: ${remainingQuantity} remaining out of ${totalQuantity}`);
    const allLicenses = [];
    let processSuccess = true;
    const [existingLicenseData] = await db.execute(
      `SELECT 
        pl.license_type,
        pl.product_key,
        pl.email,
        pl.password,
        pl.additional_info,
        pl.notes,
        pl.expires_at,
        pl.usage_count,
        pl.max_usage
      FROM license_usage_history luh
      JOIN product_licenses pl ON pl.id = luh.license_id
      WHERE luh.transaction_id = ?
      ORDER BY luh.used_at ASC`,
      [transactionId]
    );
    existingLicenseData.forEach((license) => {
      allLicenses.push(license);
    });
    for (let i = 0; i < remainingQuantity; i++) {
      console.log(`Processing remaining license ${i + 1}/${remainingQuantity}...`);
      const licenseResult = await processLicenseDelivery(
        transaction.id,
        transaction.product_id,
        customEmail,
        transaction.customer_name || "Customer"
      );
      if (licenseResult.success) {
        allLicenses.push(licenseResult.license);
        console.log(`Remaining license ${i + 1} processed successfully`);
      } else {
        console.error(`Failed to process remaining license ${i + 1}: ${licenseResult.error || licenseResult.message}`);
        processSuccess = false;
        break;
      }
    }
    if (allLicenses.length > 0) {
      const emailResult = await sendMultipleLicenseEmail(
        customEmail,
        transaction.customer_name || "Customer",
        transaction.product_name,
        allLicenses
      );
      if (emailResult.success) {
        console.log(`Updated license email sent successfully to ${customEmail} with ${allLicenses.length} license(s)`);
        if (processSuccess && allLicenses.length === totalQuantity) {
          await db.execute(
            `UPDATE transactions SET 
             payment_gateway_payload = JSON_REMOVE(
               COALESCE(payment_gateway_payload, '{}'),
               '$.partial_license_delivery'
             ) WHERE id = ?`,
            [transactionId]
          );
        }
      } else {
        console.error(`Failed to send updated license email: ${emailResult.error || emailResult.message}`);
        processSuccess = false;
      }
    }
    return {
      success: processSuccess,
      message: processSuccess ? "License delivery retry completed successfully" : "License delivery retry completed with errors",
      licensesProcessed: allLicenses.length,
      totalQuantity,
      remainingQuantity: processSuccess ? 0 : totalQuantity - allLicenses.length
    };
  } catch (error) {
    console.error("Error retrying license delivery:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "Failed to retry license delivery"
    });
  }
});

const retryLicenseDelivery_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: retryLicenseDelivery_post
}, Symbol.toStringTag, { value: 'Module' }));

const tableMetadata_get = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  try {
    await requireAdmin(event);
    const query = getQuery$1(event);
    const tableName = query.table;
    if (!tableName) {
      throw createError({
        statusCode: 400,
        statusMessage: "Table name is required"
      });
    }
    const [columns] = await db.query(`
      SELECT 
        COLUMN_NAME as name,
        DATA_TYPE as type,
        IS_NULLABLE as nullable,
        COLUMN_DEFAULT as \`default\`,
        EXTRA as extra,
        COLUMN_TYPE as full_type,
        ORDINAL_POSITION as position,
        COLUMN_COMMENT as comment,
        CHARACTER_MAXIMUM_LENGTH as max_length
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION ASC
    `, [process.env.DB_NAME || "nixty", tableName]);
    const processedColumns = columns.map((column) => ({
      name: column.name,
      type: column.full_type || column.type,
      nullable: column.nullable === "YES",
      default: column.default,
      extra: column.extra || "",
      position: column.position,
      comment: column.comment || "",
      maxLength: column.max_length,
      // Add display metadata
      displayName: formatColumnName(column.name),
      isHidden: shouldHideColumn(column.name),
      isReadonly: isReadonlyColumn(column.name),
      inputType: getInputType(column),
      validation: getValidationRules(column)
    }));
    const visibleColumns = processedColumns.filter((col) => !col.isHidden);
    const [tableInfo] = await db.query(`
      SELECT 
        TABLE_COMMENT as comment,
        ENGINE as engine,
        TABLE_ROWS as row_count,
        CREATE_TIME as created_at
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
    `, [process.env.DB_NAME || "nixty", tableName]);
    console.log(`Table metadata fetched for ${tableName}: ${visibleColumns.length} visible columns`);
    return {
      success: true,
      table: {
        name: tableName,
        displayName: getTableDisplayName(tableName),
        comment: ((_a = tableInfo[0]) == null ? void 0 : _a.comment) || "",
        engine: ((_b = tableInfo[0]) == null ? void 0 : _b.engine) || "",
        rowCount: ((_c = tableInfo[0]) == null ? void 0 : _c.row_count) || 0,
        createdAt: ((_d = tableInfo[0]) == null ? void 0 : _d.created_at) || null
      },
      columns: processedColumns,
      visibleColumns,
      totalColumns: processedColumns.length
    };
  } catch (error) {
    console.error("Error fetching table metadata:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch table metadata"
    });
  }
});
function formatColumnName(name) {
  return name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}
function shouldHideColumn(columnName) {
  const hiddenColumns = [
    "created_at",
    "updated_at"
    // Hide system timestamps in edit forms
  ];
  return hiddenColumns.includes(columnName);
}
function isReadonlyColumn(columnName) {
  const readonlyColumns = [
    "id",
    "created_at",
    "updated_at"
  ];
  return readonlyColumns.includes(columnName);
}
function getInputType(column) {
  const { name, type } = column;
  if (name === "email") return "email";
  if (name === "password") return "password";
  if (name.includes("url") || name.includes("link")) return "url";
  if (type.includes("int") || type.includes("decimal") || type.includes("float")) {
    return "number";
  }
  if (type.includes("date") || type.includes("timestamp")) {
    return "datetime-local";
  }
  if (type.includes("tinyint(1)") || name.startsWith("is_")) {
    return "checkbox";
  }
  if (type.includes("text") || ["description", "content", "notes"].includes(name)) {
    return "textarea";
  }
  if (type.includes("enum") || ["status", "account_type", "license_type", "payment_method"].includes(name) || name.endsWith("_id")) {
    return "select";
  }
  if (name.includes("image") || name.includes("picture") || name.includes("photo")) {
    return "file";
  }
  return "text";
}
function getValidationRules(column) {
  const rules = {};
  if (column.nullable === false && !column.default && !column.extra.includes("auto_increment")) {
    rules.required = true;
  }
  if (column.maxLength) {
    rules.maxLength = column.maxLength;
  }
  if (column.type.includes("int")) {
    rules.type = "integer";
  } else if (column.type.includes("decimal") || column.type.includes("float")) {
    rules.type = "number";
  } else if (column.name === "email") {
    rules.type = "email";
  }
  return rules;
}
function getTableDisplayName(tableName) {
  const displayNames = {
    "users": "Users",
    "products": "Products",
    "categories": "Categories",
    "transactions": "Transactions",
    "product_licenses": "Product Licenses",
    "announcements": "Announcements",
    "deals": "Deals",
    "hero_slides": "Hero Slides"
  };
  return displayNames[tableName] || tableName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

const tableMetadata_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: tableMetadata_get
}, Symbol.toStringTag, { value: 'Module' }));

const tables_get = defineEventHandler(async (event) => {
  try {
    let dbName, tables;
    if (useSupabase) {
      const [dbResult] = await db.query("SELECT current_database() as db_name");
      dbName = dbResult[0].db_name;
      const [rows] = await db.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'nixty' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `);
      tables = rows.map((row) => row.table_name);
    }
    console.log(`Found ${tables.length} tables in database: ${dbName}`);
    return {
      success: true,
      tables
    };
  } catch (error) {
    console.error("Error fetching tables:", error);
    return {
      success: false,
      message: "An error occurred while fetching tables"
    };
  }
});

const tables_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: tables_get
}, Symbol.toStringTag, { value: 'Module' }));

const _table__get = defineEventHandler(async (event) => {
  try {
    const tableName = getRouterParam(event, "table");
    console.log(`Fetching data from table: ${tableName}`);
    if (!tableName) {
      throw createError({
        statusCode: 400,
        statusMessage: "Table name is required"
      });
    }
    const allowedTables = [
      "users",
      "products",
      "categories",
      "transactions",
      "product_license_base",
      "product_license_keys",
      "product_license_accounts",
      "product_tags",
      "transaction_license",
      "payment_gateway_logs"
    ];
    if (!allowedTables.includes(tableName)) {
      throw createError({
        statusCode: 403,
        statusMessage: `Access to table '${tableName}' is not allowed`
      });
    }
    const schemaPrefix = useSupabase ? "nixty." : "";
    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM ${schemaPrefix}${tableName}`);
    const total = useSupabase ? parseInt(countResult[0].total) : countResult[0].total;
    console.log(`Total records found: ${total}`);
    let joinClauses = [];
    let joinFields = [];
    let groupByFields = [];
    if (tableName === "products") {
      joinClauses.push(`LEFT JOIN ${schemaPrefix}categories c ON t.category_id = c.id`);
      joinClauses.push(`LEFT JOIN (SELECT product_id, COUNT(*) as total_licenses, COUNT(CASE WHEN status = 'available' THEN 1 END) as available_stock FROM ${schemaPrefix}product_license_base GROUP BY product_id) plb ON t.id = plb.product_id`);
      joinFields.push("c.name AS categoryName");
      joinFields.push("COALESCE(plb.available_stock, 0) as stock");
      joinFields.push("COALESCE(plb.total_licenses, 0) as total_licenses");
    } else if (tableName === "product_licenses") {
      joinClauses.push(`LEFT JOIN ${schemaPrefix}products p ON t.product_id = p.id`);
      joinFields.push("p.name AS product_name");
      joinFields.push("p.version AS product_version");
    } else if (tableName === "transactions") {
      joinClauses.push(`LEFT JOIN ${schemaPrefix}products p ON t.product_id = p.id`);
      joinFields.push("p.name AS product_name");
      joinFields.push("p.version AS product_version");
    }
    const page = parseInt(getQuery$1(event).page) || 1;
    const pageSize = parseInt(getQuery$1(event).pageSize) || 20;
    const offset = (page - 1) * pageSize;
    const search = getQuery$1(event).search || "";
    const orderBy = getQuery$1(event).orderBy || "id";
    const orderDir = getQuery$1(event).orderDir || "desc";
    let columns;
    if (useSupabase) {
      [columns] = await db.query(`
        SELECT column_name as "Field", data_type as "Type", 
               is_nullable as "Null", column_default as "Default",
               '' as "Key", '' as "Extra"
        FROM information_schema.columns 
        WHERE table_name = ? AND table_schema = 'nixty'
        ORDER BY ordinal_position
      `, [tableName]);
    }
    const searchableColumns = columns.map((col) => col.Field);
    console.log("Searchable columns:", searchableColumns);
    let searchConditions = "WHERE 1=1";
    const searchParams = [];
    if (search) {
      const searchTerms = search.split(" ").filter((term) => term);
      if (searchTerms.length > 0) {
        const searchQueries = [];
        searchTerms.forEach((term) => {
          const columnConditions = searchableColumns.map((col) => `${col} LIKE ?`);
          searchQueries.push(`(${columnConditions.join(" OR ")})`);
          searchableColumns.forEach(() => {
            searchParams.push(`%${term}%`);
          });
        });
        searchConditions += ` AND (${searchQueries.join(" AND ")})`;
      }
    } else {
      searchConditions = "WHERE 1=1";
    }
    const filterParams = getQuery$1(event).filters ? JSON.parse(getQuery$1(event).filters) : {};
    Object.keys(filterParams).forEach((key) => {
      const value = filterParams[key];
      if (value !== void 0 && value !== "") {
        searchConditions += ` AND t.${key} = ?`;
        searchParams.push(value);
      }
    });
    const selectedFields = ["t.*", ...joinFields];
    let query = `SELECT ${selectedFields.join(", ")} FROM ${schemaPrefix}${tableName} t ${joinClauses.join(" ")} ${searchConditions}`;
    if (groupByFields.length > 0) {
      const mainTableColumns = columns.map((col) => `t.${col.Field}`).join(", ");
      query += ` GROUP BY ${mainTableColumns}, ${groupByFields.join(", ")}`;
    }
    query += ` ORDER BY ${orderBy} ${orderDir} LIMIT ${pageSize} OFFSET ${offset}`;
    console.log("SQL Query:", query);
    console.log("SQL Params:", searchParams);
    const [records] = await db.query(query, searchParams);
    console.log(`Retrieved ${records.length} records`);
    const columnInfo = columns.map((col) => ({
      name: col.Field,
      type: col.Type,
      nullable: col.Null === "YES",
      key: col.Key,
      default: col.Default,
      extra: col.Extra
    }));
    let categories = [];
    if (tableName === "products") {
      const [categoryRows] = await db.query(`SELECT id, name, slug FROM ${schemaPrefix}categories ORDER BY name ASC`);
      categories = categoryRows;
    }
    console.log("Column info:", JSON.stringify(columnInfo));
    console.log("First record sample:", records.length > 0 ? JSON.stringify(records[0]) : "No records");
    const response = {
      success: true,
      data: records,
      meta: {
        total,
        page,
        pageSize,
        pageCount: Math.ceil(total / pageSize),
        columns: columnInfo,
        relations: {
          categories
        }
      }
    };
    console.log("Response structure:", JSON.stringify({
      success: response.success,
      dataLength: response.data.length,
      meta: {
        total: response.meta.total,
        page: response.meta.page,
        pageSize: response.meta.pageSize,
        pageCount: response.meta.pageCount,
        columnsCount: response.meta.columns.length
      }
    }));
    return response;
  } catch (error) {
    console.error("Error fetching table data:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch table data"
    });
  }
});

const _table__get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: _table__get
}, Symbol.toStringTag, { value: 'Module' }));

const _table__post = defineEventHandler(async (event) => {
  try {
    const tableName = getRouterParam(event, "table");
    const body = await readBody(event);
    validateTableName(tableName);
    if (!body || typeof body !== "object") {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid request body"
      });
    }
    let validData;
    try {
      validData = validateRecordData(tableName, body, false);
    } catch (error) {
      if (error.validationErrors) {
        throw createError({
          statusCode: 400,
          statusMessage: "Validation errors",
          data: { errors: error.validationErrors }
        });
      }
      throw error;
    }
    if (tableName === "users") {
      if (validData.email) {
        const userTable = useSupabase ? "nixty.users" : "users";
        const [existingUser] = await db.execute(
          `SELECT id FROM ${userTable} WHERE email = ?`,
          [validData.email]
        );
        if (existingUser.length > 0) {
          throw createError({
            statusCode: 400,
            statusMessage: "A user with this email already exists"
          });
        }
      }
      if (validData.password) {
        validData.password = await bcrypt.hash(validData.password, 10);
      }
    }
    if (!useSupabase) ;
    if (Object.keys(validData).length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "No valid data provided"
      });
    }
    const newRecord = await db.insert(tableName, validData);
    return {
      success: true,
      message: "Record created successfully",
      data: newRecord
    };
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    console.error("Error creating record:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create record"
    });
  }
});

const _table__post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: _table__post
}, Symbol.toStringTag, { value: 'Module' }));

const _id__delete = defineEventHandler(async (event) => {
  try {
    const tableName = getRouterParam(event, "table");
    const recordId = getRouterParam(event, "id");
    validateTableName(tableName);
    const validRecordId = validateRecordId(recordId);
    const [existingRecord] = await db.query(
      `SELECT * FROM ${tableName} WHERE id = ?`,
      [validRecordId]
    );
    if (existingRecord.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Record not found"
      });
    }
    if (tableName === "users") {
      if (existingRecord[0].account_type === "admin") {
        const schemaPrefix = useSupabase ? "nixty." : "";
        const [adminCount] = await db.query(
          `SELECT COUNT(*) as count FROM ${schemaPrefix}users WHERE account_type = ?`,
          ["admin"]
        );
        const countValue = useSupabase ? parseInt(adminCount[0].count) : adminCount[0].count;
        if (countValue <= 1) {
          throw createError({
            statusCode: 400,
            statusMessage: "Cannot delete the last admin user"
          });
        }
      }
    }
    if (tableName === "products") {
      try {
        const [deleteLicensesResult] = await db.query(
          "DELETE FROM product_licenses WHERE product_id = ?",
          [validRecordId]
        );
        const deletedLicensesCount = useSupabase ? deleteLicensesResult.rowCount : deleteLicensesResult.affectedRows;
        console.log(`Deleted ${deletedLicensesCount} related product licenses.`);
      } catch (licenseError) {
        console.error("Error deleting related product licenses:", licenseError);
        throw createError({
          statusCode: 500,
          statusMessage: "Failed to delete related product licenses. Please check for dependencies on transactions."
        });
      }
    }
    const [result] = await db.query(
      `DELETE FROM ${tableName} WHERE id = ?`,
      [validRecordId]
    );
    const affectedRows = useSupabase ? result.rowCount : result.affectedRows;
    if (affectedRows === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Record not found or already deleted"
      });
    }
    return {
      success: true,
      message: "Record deleted successfully",
      data: {
        deletedRecord: existingRecord[0],
        affectedRows
      }
    };
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    console.error("Error deleting record:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete record"
    });
  }
});

const _id__delete$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: _id__delete
}, Symbol.toStringTag, { value: 'Module' }));

const _id__put = defineEventHandler(async (event) => {
  try {
    const tableName = getRouterParam(event, "table");
    const recordId = getRouterParam(event, "id");
    const body = await readBody(event);
    validateTableName(tableName);
    const validRecordId = validateRecordId(recordId);
    if (!body || typeof body !== "object") {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid request body"
      });
    }
    let validData;
    try {
      console.log("Update request body:", JSON.stringify(body, null, 2));
      validData = validateRecordData(tableName, body, true);
      console.log("Validated data:", JSON.stringify(validData, null, 2));
    } catch (error) {
      console.error("Validation error details:", error.validationErrors || error.message);
      if (error.validationErrors) {
        throw createError({
          statusCode: 400,
          statusMessage: "Validation errors",
          data: { errors: error.validationErrors }
        });
      }
      throw error;
    }
    const [existingRecord] = await db.execute(
      `SELECT * FROM ${tableName} WHERE id = ?`,
      [validRecordId]
    );
    if (existingRecord.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Record not found"
      });
    }
    if (tableName === "users") {
      if (validData.email) {
        const [existingUser] = await db.execute(
          "SELECT id FROM users WHERE email = ? AND id != ?",
          [validData.email, validRecordId]
        );
        if (existingUser.length > 0) {
          throw createError({
            statusCode: 400,
            statusMessage: "A user with this email already exists"
          });
        }
      }
      if (validData.password) {
        validData.password = await bcrypt.hash(validData.password, 10);
      }
    }
    if (!useSupabase) ;
    if (Object.keys(validData).length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "No valid data provided"
      });
    }
    const updatedRecord = await db.update(tableName, validData, recordId);
    return {
      success: true,
      data: updatedRecord
    };
  } catch (error) {
    console.error("Error updating record:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update record"
    });
  }
});

const _id__put$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: _id__put
}, Symbol.toStringTag, { value: 'Module' }));

const massAdd_post = defineEventHandler(async (event) => {
  var _a;
  try {
    console.log("Mass add request received");
    const form = await readMultipartFormData(event);
    console.log("Form data received:", (form == null ? void 0 : form.length) || 0, "items");
    if (!form || form.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "No form data received"
      });
    }
    const formData = {};
    const imageFiles = {};
    form.forEach((item) => {
      if (item.name && item.data) {
        if (item.filename) {
          imageFiles[item.name] = {
            filename: item.filename,
            type: item.type,
            data: item.data
          };
        } else {
          formData[item.name] = item.data.toString();
        }
      }
    });
    console.log("Form fields:", Object.keys(formData));
    console.log("Image files:", Object.keys(imageFiles));
    if (formData.tableName !== "products") {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid table name"
      });
    }
    const products = JSON.parse(formData.products || "[]");
    console.log("Products to add:", products.length);
    if (products.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "No products to add"
      });
    }
    const categoriesResult = await db.execute("SELECT id, name, slug FROM categories");
    const categories = categoriesResult[0] || [];
    const categoryMap = new Map(categories.map((category) => [category.name.toLowerCase(), { id: category.id, slug: category.slug }]));
    console.log("Available categories:", Array.from(categoryMap.keys()));
    const createProductQueries = [];
    const processingErrors = [];
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`Processing product ${i + 1}:`, product.name);
      let imageUrl = null;
      if (!product.name || !product.name.trim()) {
        processingErrors.push(`Product ${i + 1}: Name is required`);
        continue;
      }
      if (!product.price || isNaN(parseFloat(product.price)) || parseFloat(product.price) <= 0) {
        processingErrors.push(`Product ${i + 1}: Valid price is required`);
        continue;
      }
      if (product.category) {
        const categoryData = categoryMap.get(product.category.toLowerCase());
        if (categoryData) {
          product.category_id = categoryData.id;
          product.slug = categoryData.slug;
          console.log(`Found category ID ${categoryData.id} and using slug '${categoryData.slug}' for category: ${product.category}`);
        } else {
          console.warn(`Category not found: ${product.category}. Available categories: ${Array.from(categoryMap.keys()).join(", ")}`);
          processingErrors.push(`Product ${i + 1}: Category '${product.category}' not found`);
          product.category_id = null;
          product.slug = null;
        }
      } else {
        processingErrors.push(`Product ${i + 1}: Category is required`);
        product.category_id = null;
        product.slug = null;
      }
      if (!product.slug) {
        continue;
      }
      const imageKey = `image_${i}`;
      const imageFile = imageFiles[imageKey];
      if (imageFile) {
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
        if (!allowedTypes.includes((_a = imageFile.type) == null ? void 0 : _a.toLowerCase())) {
          throw createError({
            statusCode: 400,
            statusMessage: `Invalid file type for product ${i + 1}. Only JPEG, PNG, GIF, and WebP are allowed.`
          });
        }
        const maxSize = 5 * 1024 * 1024;
        if (imageFile.data.length > maxSize) {
          throw createError({
            statusCode: 400,
            statusMessage: `File too large for product ${i + 1}. Maximum size is 5MB.`
          });
        }
        const timestamp = Date.now();
        const hash = createHash("md5").update(imageFile.data).digest("hex").substring(0, 8);
        const extension = extname(imageFile.filename || "") || ".jpg";
        const filename = `${timestamp}-${hash}${extension}`;
        const uploadDir = join(process.cwd(), "public", "uploads", "products");
        try {
          await promises.access(uploadDir);
        } catch {
          await promises.mkdir(uploadDir, { recursive: true });
        }
        const filePath = join(uploadDir, filename);
        await promises.writeFile(filePath, imageFile.data);
        imageUrl = `/uploads/products/${filename}`;
      }
      const query = db.execute(`
        INSERT INTO products (name, slug, price, category_id, description, image_url, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        product.name,
        product.slug,
        parseFloat(product.price),
        product.category_id,
        product.description || "",
        imageUrl
      ]);
      createProductQueries.push(query);
    }
    if (processingErrors.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `Product validation failed: ${processingErrors.join("; ")}`
      });
    }
    if (createProductQueries.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "No valid products to add after validation"
      });
    }
    await Promise.all(createProductQueries);
    const successMessage = `Successfully added ${createProductQueries.length} products`;
    if (processingErrors.length > 0) {
      return {
        success: true,
        message: `${successMessage}. Some products had warnings: ${processingErrors.join("; ")}`
      };
    }
    return {
      success: true,
      message: successMessage
    };
  } catch (error) {
    console.error("Error in mass add:", error.message);
    console.error("Full error object:", JSON.stringify(error, null, 2));
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to add products. Error: ${error.message}`
    });
  }
});

const massAdd_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: massAdd_post
}, Symbol.toStringTag, { value: 'Module' }));

const testEmail_get = defineEventHandler(async (event) => {
  try {
    const connectionTest = await testEmailConnection();
    if (!connectionTest.success) {
      return {
        success: false,
        message: "Failed to connect to email service",
        error: connectionTest.error
      };
    }
    const testLicense = {
      license_type: "product_key",
      product_key: "TEST-KEY-12345-ABCDE",
      send_license: 1,
      max_usage: 1,
      additional_info: "This is a test email to verify email configuration.",
      notes: "Test email sent from Nixty admin panel."
    };
    const emailTest = await sendLicenseEmail(
      "nixtydemo@gmail.com",
      // Send test email to same address
      "Admin Test",
      "Test Product License",
      testLicense,
      "TEST-ORDER-001",
      null
      // no custom email
    );
    if (emailTest.success) {
      return {
        success: true,
        message: "Email service is working correctly",
        details: {
          connection: "OK",
          testEmail: "Sent successfully",
          messageId: emailTest.messageId
        }
      };
    } else {
      return {
        success: false,
        message: "Email connection OK but sending failed",
        error: emailTest.error
      };
    }
  } catch (error) {
    console.error("Email test error:", error);
    return {
      success: false,
      message: "Email test failed",
      error: error.message
    };
  }
});

const testEmail_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: testEmail_get
}, Symbol.toStringTag, { value: 'Module' }));

const transactionStatus_get = defineEventHandler(async (event) => {
  const { order_id } = getQuery$1(event);
  const core = new midtransClient.CoreApi({
    isProduction: midtransConfig.isProduction,
    serverKey: midtransConfig.serverKey,
    clientKey: midtransConfig.clientKey
  });
  try {
    const status = await core.transaction.status(order_id);
    return status;
  } catch (err) {
    return { error: err.message };
  }
});

const transactionStatus_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: transactionStatus_get
}, Symbol.toStringTag, { value: 'Module' }));

const transactions_get = defineEventHandler(async (event) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        o.order_id as id,
        o.*,
        p.name as product_name,
        u.name as user_name,
        u.email as user_email
      FROM nixty.orders o
      LEFT JOIN nixty.products p ON o.product_id = p.id
      LEFT JOIN nixty.users u ON o.user_id = u.id
      ORDER BY o.created_at DESC 
      LIMIT 100
    `);
    return {
      success: true,
      data: rows
    };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return {
      success: false,
      data: [],
      message: "Failed to fetch transactions"
    };
  }
});

const transactions_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: transactions_get
}, Symbol.toStringTag, { value: 'Module' }));

const getValidatedQueryParams = (event) => {
  const query = getQuery$1(event);
  const { period, date, startDate, endDate } = query;
  if (!["hour", "day", "month", "year"].includes(period)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid period specified" });
  }
  if (period === "hour" || period === "day") {
    if (!startDate || !endDate) {
      throw createError({ statusCode: 400, statusMessage: "startDate and endDate are required for hour/day period" });
    }
    return { period, startDate, endDate };
  } else {
    if (!date) {
      throw createError({ statusCode: 400, statusMessage: "Date is required" });
    }
    return { period, date };
  }
};
const getHourlyStats = async (startDate, endDate) => {
  try {
    const start = /* @__PURE__ */ new Date(startDate + "T00:00:00.000Z");
    const end = /* @__PURE__ */ new Date(endDate + "T23:59:59.999Z");
    const [rows] = await db.query(`
            SELECT 
                TO_CHAR(created_at, 'YYYY-MM-DD') as date,
                EXTRACT(HOUR FROM created_at) as hour, 
                COUNT(*) as transaction_count, 
                SUM(total::numeric) as total_revenue
            FROM nixty.orders
            WHERE created_at >= $1 AND created_at <= $2 AND (status = 'settlement' OR status = 'completed')
            GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD'), EXTRACT(HOUR FROM created_at)
            ORDER BY date ASC, hour ASC
        `, [start, end]);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.floor(diffTime / (1e3 * 60 * 60 * 24)) + 1;
    const totalHours = Math.min(diffDays * 24, 48);
    const labels = [];
    const transactionData = Array(totalHours).fill(0);
    const revenueData = Array(totalHours).fill(0);
    const currentDate = new Date(start);
    for (let i = 0; i < totalHours; i++) {
      const hour = i % 24;
      const dayOffset = Math.floor(i / 24);
      const labelDate = new Date(start);
      labelDate.setDate(start.getDate() + dayOffset);
      if (diffDays > 1) {
        const monthDay = labelDate.toLocaleDateString("id-ID", { month: "2-digit", day: "2-digit" });
        labels.push(`${monthDay} ${hour.toString().padStart(2, "0")}:00`);
      } else {
        labels.push(`${hour.toString().padStart(2, "0")}:00`);
      }
    }
    for (const row of rows) {
      const rowDate = /* @__PURE__ */ new Date(row.date + "T00:00:00.000Z");
      const dayDiff = Math.floor((rowDate - start) / (1e3 * 60 * 60 * 24));
      const hourIndex = dayDiff * 24 + Number(row.hour);
      if (hourIndex >= 0 && hourIndex < totalHours) {
        transactionData[hourIndex] = Number(row.transaction_count);
        revenueData[hourIndex] = Number(row.total_revenue);
      }
    }
    return { labels, transactionData, revenueData };
  } catch (error) {
    console.error("Error in getHourlyStats:", error);
    return { labels: [], transactionData: [], revenueData: [] };
  }
};
const getDailyStats = async (startDate, endDate) => {
  try {
    const start = /* @__PURE__ */ new Date(startDate + "T00:00:00.000Z");
    const end = /* @__PURE__ */ new Date(endDate + "T23:59:59.999Z");
    const isSingleDay = start.toDateString() === end.toDateString();
    if (isSingleDay) {
      const [rows] = await db.query(`
                SELECT 
                    EXTRACT(HOUR FROM created_at) as hour, 
                    COUNT(*) as transaction_count, 
                    SUM(total::numeric) as total_revenue
                FROM nixty.orders
                WHERE created_at >= $1 AND created_at <= $2 AND (status = 'settlement' OR status = 'completed')
                GROUP BY EXTRACT(HOUR FROM created_at)
                ORDER BY hour ASC
            `, [start, end]);
      const labels = Array.from({ length: 24 }, (_, i) => i.toString());
      const transactionData = Array(24).fill(0);
      const revenueData = Array(24).fill(0);
      for (const row of rows) {
        const hourIndex = Number(row.hour);
        transactionData[hourIndex] = Number(row.transaction_count);
        revenueData[hourIndex] = Number(row.total_revenue);
      }
      return { labels, transactionData, revenueData };
    } else {
      const [rows] = await db.query(`
                SELECT 
                    TO_CHAR(created_at, 'YYYY-MM-DD') as date,
                    COUNT(*) as transaction_count, 
                    SUM(total::numeric) as total_revenue
                FROM nixty.orders
                WHERE created_at >= $1 AND created_at <= $2 AND (status = 'settlement' OR status = 'completed')
                GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
                ORDER BY date ASC
            `, [start, end]);
      const dateMap = /* @__PURE__ */ new Map();
      const dateCursor = new Date(start);
      while (dateCursor <= end) {
        dateMap.set(dateCursor.toISOString().split("T")[0], { transaction_count: 0, total_revenue: 0 });
        dateCursor.setDate(dateCursor.getDate() + 1);
      }
      for (const row of rows) {
        dateMap.set(row.date, {
          transaction_count: Number(row.transaction_count),
          total_revenue: Number(row.total_revenue)
        });
      }
      const labels = Array.from(dateMap.keys());
      const transactionData = Array.from(dateMap.values()).map((d) => d.transaction_count);
      const revenueData = Array.from(dateMap.values()).map((d) => d.total_revenue);
      return { labels, transactionData, revenueData };
    }
  } catch (error) {
    console.error("Error in getDailyStats:", error);
    return { labels: [], transactionData: [], revenueData: [] };
  }
};
const getMonthlyStats = async (date) => {
  try {
    const [year, month] = date.split("-");
    const daysInMonth = new Date(year, month, 0).getDate();
    const startDate = /* @__PURE__ */ new Date(`${year}-${month}-01`);
    startDate.setHours(0, 0, 0, 0);
    const endDate = /* @__PURE__ */ new Date(`${year}-${month}-${daysInMonth}`);
    endDate.setHours(23, 59, 59, 999);
    const [rows] = await db.query(`
            SELECT 
                EXTRACT(DAY FROM created_at) as day, 
                COUNT(*) as transaction_count, 
                SUM(total::numeric) as total_revenue
            FROM nixty.orders
            WHERE created_at >= $1 AND created_at <= $2 AND (status = 'settlement' OR status = 'completed')
            GROUP BY EXTRACT(DAY FROM created_at)
            ORDER BY day ASC
        `, [startDate, endDate]);
    const labels = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
    const transactionData = Array(daysInMonth).fill(0);
    const revenueData = Array(daysInMonth).fill(0);
    for (const row of rows) {
      const dayIndex = row.day - 1;
      transactionData[dayIndex] = Number(row.transaction_count);
      revenueData[dayIndex] = Number(row.total_revenue);
    }
    return { labels, transactionData, revenueData };
  } catch (error) {
    console.error("Error in getMonthlyStats:", error);
    const [year, month] = date.split("-");
    const daysInMonth = new Date(year, month, 0).getDate();
    return {
      labels: Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString()),
      transactionData: Array(daysInMonth).fill(0),
      revenueData: Array(daysInMonth).fill(0)
    };
  }
};
const getYearlyStats = async (year) => {
  try {
    const startDate = /* @__PURE__ */ new Date(`${year}-01-01`);
    startDate.setHours(0, 0, 0, 0);
    const endDate = /* @__PURE__ */ new Date(`${year}-12-31`);
    endDate.setHours(23, 59, 59, 999);
    const [rows] = await db.query(`
            SELECT 
                EXTRACT(MONTH FROM created_at) as month, 
                COUNT(*) as transaction_count, 
                SUM(total::numeric) as total_revenue
            FROM nixty.orders
            WHERE created_at >= $1 AND created_at <= $2 AND (status = 'settlement' OR status = 'completed')
            GROUP BY EXTRACT(MONTH FROM created_at)
            ORDER BY month ASC
        `, [startDate, endDate]);
    const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const transactionData = Array(12).fill(0);
    const revenueData = Array(12).fill(0);
    for (const row of rows) {
      const monthIndex = row.month - 1;
      transactionData[monthIndex] = Number(row.transaction_count);
      revenueData[monthIndex] = Number(row.total_revenue);
    }
    return { labels, transactionData, revenueData };
  } catch (error) {
    console.error("Error in getYearlyStats:", error);
    return {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      transactionData: Array(12).fill(0),
      revenueData: Array(12).fill(0)
    };
  }
};
const stats_get = defineEventHandler(async (event) => {
  try {
    const validatedParams = getValidatedQueryParams(event);
    const { period } = validatedParams;
    let stats;
    if (period === "hour") {
      const { startDate, endDate } = validatedParams;
      stats = await getHourlyStats(startDate, endDate);
    } else if (period === "day") {
      const { startDate, endDate } = validatedParams;
      stats = await getDailyStats(startDate, endDate);
    } else if (period === "month") {
      const { date } = validatedParams;
      stats = await getMonthlyStats(date);
    } else if (period === "year") {
      const { date } = validatedParams;
      stats = await getYearlyStats(date);
    }
    return stats || {
      labels: [],
      transactionData: [],
      revenueData: []
    };
  } catch (error) {
    console.error("Error fetching transaction stats:", error);
    return {
      labels: [],
      transactionData: [],
      revenueData: [],
      error: error.message
    };
  }
});

const stats_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: stats_get
}, Symbol.toStringTag, { value: 'Module' }));

const triggerCleanup_post = defineEventHandler(async (event) => {
  try {
    console.log("\u{1F527} Manual cleanup trigger requested");
    await scheduledTasks.triggerCleanupNow();
    return {
      success: true,
      message: "Manual cleanup triggered successfully",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  } catch (error) {
    console.error("\u274C Manual cleanup trigger failed:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to trigger manual cleanup"
    });
  }
});

const triggerCleanup_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: triggerCleanup_post
}, Symbol.toStringTag, { value: 'Module' }));

const updateCategorySlugs_get = defineEventHandler(async (event) => {
  try {
    await adminAuth(event);
    const [beforeCategories] = await db.query(`
      SELECT id, name, slug
      FROM categories
      ORDER BY id
    `);
    await db.query(`
      UPDATE categories
      SET slug = 'office'
      WHERE id = 1
    `);
    await db.query(`
      UPDATE categories
      SET slug = 'project'
      WHERE id = 2
    `);
    await db.query(`
      UPDATE categories
      SET slug = 'visio'
      WHERE id = 3
    `);
    const [afterCategories] = await db.query(`
      SELECT id, name, slug
      FROM categories
      ORDER BY id
    `);
    return {
      success: true,
      message: "Slug kategori berhasil diperbarui",
      before: beforeCategories,
      after: afterCategories
    };
  } catch (error) {
    console.error("Error updating category slugs:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update category slugs"
    });
  }
});

const updateCategorySlugs_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: updateCategorySlugs_get
}, Symbol.toStringTag, { value: 'Module' }));

const updateProductSlugs_get = defineEventHandler(async (event) => {
  try {
    await requireAdmin(event);
    console.log("Starting product slug update...");
    const updates = [
      { categoryId: 1, slug: "office" },
      // Microsoft Office
      { categoryId: 2, slug: "project" },
      // Microsoft Project  
      { categoryId: 3, slug: "visio" }
      // Microsoft Visio
    ];
    let totalUpdated = 0;
    for (const update of updates) {
      const [result] = await db.query(
        "UPDATE products SET slug = ? WHERE category_id = ?",
        [update.slug, update.categoryId]
      );
      totalUpdated += result.affectedRows;
      console.log(`Updated ${result.affectedRows} products with category_id ${update.categoryId} to slug '${update.slug}'`);
    }
    const [updatedProducts] = await db.query(`
      SELECT p.id, p.name, p.version, p.slug, p.category_id, c.name as category_name, c.slug as category_slug 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      ORDER BY p.category_id, p.version
    `);
    console.log("Product slug update completed successfully");
    return {
      success: true,
      message: `Successfully updated ${totalUpdated} product slugs`,
      totalUpdated,
      updatedProducts
    };
  } catch (error) {
    console.error("Error updating product slugs:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update product slugs"
    });
  }
});

const updateProductSlugs_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: updateProductSlugs_get
}, Symbol.toStringTag, { value: 'Module' }));

const updateStock_post = defineEventHandler(async (event) => {
  try {
    const headers = getHeaders(event);
    const userId = headers["x-user-id"];
    const userEmail = headers["x-user-email"];
    if (!userId || !userEmail) {
      throw createError({
        statusCode: 401,
        statusMessage: "Admin authentication required"
      });
    }
    const body = await readBody(event);
    console.log("Stock update request:", body);
    const productId = body.productId || body.product_id;
    const newStock = body.stock || body.new_stock;
    const licenseType = body.license_type;
    if (!productId) {
      throw createError({
        statusCode: 400,
        statusMessage: "productId is required"
      });
    }
    if (newStock === void 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "new_stock is required"
      });
    }
    if (newStock < 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "Stock cannot be negative"
      });
    }
    const [productRows] = await db.query(`
      SELECT 
        p.id, p.name, p.version, p.license_type_default,
        COALESCE(psv.available_stock, 0) as current_stock
      FROM products p
      LEFT JOIN product_stock_view psv ON p.id = psv.product_id
      WHERE p.id = ?
    `, [productId]);
    if (productRows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Product not found"
      });
    }
    const product = productRows[0];
    const oldStock = product.current_stock || 0;
    const licenseTypeToUse = licenseType || product.license_type_default || "product_key";
    const stockDifference = newStock - oldStock;
    if (stockDifference <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "Cannot reduce stock through this API. Use the licenses management interface to manage individual licenses."
      });
    }
    const licenseAddPromises = [];
    for (let i = 0; i < stockDifference; i++) {
      const productKey = `${product.name.substring(0, 3).toUpperCase()}-${product.version}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      const licenseData = {
        product_id: productId,
        license_type: licenseTypeToUse,
        product_key: licenseTypeToUse === "product_key" ? productKey : null,
        email: licenseTypeToUse === "email_password" ? `auto-gen-${productId}-${i}@example.com` : null,
        password: licenseTypeToUse === "email_password" ? `auto-pass-${Math.random().toString(36).substring(2, 10)}` : null,
        additional_info: JSON.stringify({ generated_by: userEmail, generated_at: (/* @__PURE__ */ new Date()).toISOString() }),
        status: "available",
        notes: "Auto-generated license by stock management system",
        send_license: 0,
        max_usage: 1,
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      licenseAddPromises.push(db.insert("product_licenses", licenseData));
    }
    await Promise.all(licenseAddPromises);
    const [updatedStockView] = await db.query(`
      SELECT * FROM product_stock_view WHERE product_id = ?
    `, [productId]);
    const updatedStock = updatedStockView.length > 0 ? updatedStockView[0] : { available_stock: 0 };
    console.log(`Stock updated for product ${productId}: ${oldStock} \u2192 ${updatedStock.available_stock}`);
    return {
      success: true,
      message: `Stock updated successfully from ${oldStock} to ${updatedStock.available_stock}`,
      data: {
        product: {
          id: product.id,
          name: product.name,
          version: product.version,
          stock: updatedStock.available_stock,
          available_stock: updatedStock.available_stock,
          used_licenses: updatedStock.used_licenses || 0,
          expired_licenses: updatedStock.expired_licenses || 0,
          reserved_licenses: updatedStock.reserved_licenses || 0,
          total_licenses: updatedStock.total_licenses || 0
        },
        stock_change: {
          old_stock: oldStock,
          new_stock: updatedStock.available_stock,
          difference: updatedStock.available_stock - oldStock,
          licenses_added: stockDifference
        }
      }
    };
  } catch (error) {
    console.error("Error updating stock:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "An error occurred while updating stock"
    });
  }
});

const updateStock_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: updateStock_post
}, Symbol.toStringTag, { value: 'Module' }));

function getExtensionFromMimeType(mimeType) {
  const mimeToExt = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/jfif": ".jfif",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp"
  };
  return mimeToExt[mimeType.toLowerCase()] || ".jpg";
}
const uploadImage_post = defineEventHandler(async (event) => {
  try {
    console.log("Image upload request received");
    const headers = getHeaders(event);
    const userId = headers["x-user-id"];
    const userEmail = headers["x-user-email"];
    console.log("Auth headers:", { userId, userEmail });
    if (!userId || !userEmail) {
      throw createError({
        statusCode: 401,
        statusMessage: "Admin authentication required"
      });
    }
    const form = await readMultipartFormData(event);
    console.log("Form data received:", (form == null ? void 0 : form.length) || 0, "items");
    if (form && form.length > 0) {
      console.log("Form items:");
      form.forEach((item, index) => {
        var _a;
        console.log(`  Item ${index}:`, {
          name: item.name,
          filename: item.filename,
          type: item.type,
          dataLength: ((_a = item.data) == null ? void 0 : _a.length) || 0
        });
      });
    }
    if (!form || form.length === 0) {
      console.error("No form data received");
      throw createError({
        statusCode: 400,
        statusMessage: "No file uploaded"
      });
    }
    const file = form.find((item) => item.name === "image");
    console.log("Image file found:", !!file, file ? `${file.filename} (${file.data.length} bytes)` : "none");
    if (!file) {
      throw createError({
        statusCode: 400,
        statusMessage: "No image file found"
      });
    }
    const allowedTypes = ["image/jpeg", "image/jpg", "image/jfif", "image/png", "image/gif", "image/webp"];
    const fileType = file.type || "";
    if (!allowedTypes.includes(fileType.toLowerCase())) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."
      });
    }
    const maxSize = 5 * 1024 * 1024;
    if (file.data.length > maxSize) {
      throw createError({
        statusCode: 400,
        statusMessage: "File too large. Maximum size is 5MB."
      });
    }
    const timestamp = Date.now();
    const hash = createHash("md5").update(file.data).digest("hex").substring(0, 8);
    const extension = extname(file.filename || "") || getExtensionFromMimeType(fileType);
    const filename = `${timestamp}-${hash}${extension}`;
    const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
    let publicUrl;
    if (isServerless) {
      try {
        const blobPath = `admin/images/${filename}`;
        console.log(`Uploading to Vercel Blob: ${blobPath}`);
        const blob = await put(blobPath, file.data, {
          access: "public",
          contentType: fileType
        });
        publicUrl = blob.url;
        console.log(`Blob uploaded successfully: ${publicUrl}`);
      } catch (blobError) {
        console.error("Vercel Blob upload error:", blobError);
        throw createError({
          statusCode: 500,
          statusMessage: "Failed to upload image to blob storage"
        });
      }
    } else {
      const uploadDir = join(process.cwd(), "public", "uploads", "admin");
      try {
        await promises.access(uploadDir);
      } catch {
        await promises.mkdir(uploadDir, { recursive: true });
      }
      const filePath = join(uploadDir, filename);
      await promises.writeFile(filePath, file.data);
      publicUrl = `/uploads/admin/${filename}`;
    }
    return {
      success: true,
      message: "Image uploaded successfully",
      data: {
        filename,
        originalName: file.filename,
        size: file.data.length,
        type: fileType,
        url: publicUrl
      }
    };
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    console.error("Error uploading image:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to upload image"
    });
  }
});

const uploadImage_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: uploadImage_post
}, Symbol.toStringTag, { value: 'Module' }));

const index_get$c = defineEventHandler(async (event) => {
  try {
    const query = getQuery$1(event);
    const {
      limit = 10,
      offset = 0,
      status = "active"
    } = query;
    const [rows] = await db.query(`
      SELECT *
      FROM nixty.announcements
      WHERE status = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `, [status, parseInt(limit), parseInt(offset)]);
    const announcements = rows.map((row) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      date: new Date(row.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      }),
      isNew: Boolean(row.is_new),
      image: row.image_url,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    return {
      success: true,
      data: announcements,
      total: announcements.length
    };
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return {
      success: false,
      message: "An error occurred while fetching announcements",
      data: []
    };
  }
});

const index_get$d = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: index_get$c
}, Symbol.toStringTag, { value: 'Module' }));

const googleLogin_post = defineEventHandler(async (event) => {
  try {
    const { email, name, google_id, picture } = await readBody(event);
    if (!email || !google_id) {
      return {
        success: false,
        message: "Email and Google ID are required"
      };
    }
    const [existingUsers] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    const users = existingUsers;
    let user;
    if (users.length === 0) {
      const randomPassword = Math.random().toString(36).substring(2, 15);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      const [result] = await db.query(
        "INSERT INTO users (email, name, password, account_type, google_id, profile_picture) VALUES (?, ?, ?, ?, ?, ?)",
        [email, name, hashedPassword, "user", google_id, picture]
      );
      const insertId = result.insertId;
      const [newUsers] = await db.query(
        "SELECT * FROM users WHERE id = ?",
        [insertId]
      );
      user = newUsers[0];
    } else {
      user = users[0];
      if (!user.google_id) {
        await db.query(
          "UPDATE users SET google_id = ?, profile_picture = ? WHERE id = ?",
          [google_id, picture, user.id]
        );
        user.google_id = google_id;
        user.profile_picture = picture;
      }
    }
    const { password: _, ...userWithoutPassword } = user;
    return {
      success: true,
      message: "Google login successful",
      user: userWithoutPassword
    };
  } catch (error) {
    console.error("Google login error:", error);
    return {
      success: false,
      message: "An error occurred during Google login"
    };
  }
});

const googleLogin_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: googleLogin_post
}, Symbol.toStringTag, { value: 'Module' }));

const googleRegister_post = defineEventHandler(async (event) => {
  try {
    const { email, name, google_id, picture } = await readBody(event);
    if (!email || !google_id) {
      return {
        success: false,
        message: "Email and Google ID are required"
      };
    }
    const [existingUsers] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    const users = existingUsers;
    if (users.length > 0) {
      return {
        success: false,
        message: "A user with this email already exists"
      };
    }
    const randomPassword = Math.random().toString(36).substring(2, 15);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);
    const [result] = await db.query(
      "INSERT INTO users (email, name, password, account_type, google_id, profile_picture) VALUES (?, ?, ?, ?, ?, ?)",
      [email, name, hashedPassword, "user", google_id, picture]
    );
    const insertId = result.insertId;
    const [newUsers] = await db.query(
      "SELECT * FROM users WHERE id = ?",
      [insertId]
    );
    const user = newUsers[0];
    const { password: _, ...userWithoutPassword } = user;
    return {
      success: true,
      message: "Google registration successful",
      user: userWithoutPassword
    };
  } catch (error) {
    console.error("Google registration error:", error);
    return {
      success: false,
      message: "An error occurred during Google registration"
    };
  }
});

const googleRegister_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: googleRegister_post
}, Symbol.toStringTag, { value: 'Module' }));

const categories_get = defineEventHandler(async (event) => {
  try {
    const [categories] = await db.query("SELECT id, name, slug FROM nixty.categories ORDER BY name");
    return {
      success: true,
      data: categories
    };
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch categories"
    });
  }
});

const categories_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: categories_get
}, Symbol.toStringTag, { value: 'Module' }));

function generateOrderId(options = {}) {
  const {
    prefix = "NIXTY",
    userId = null,
    productId = null
  } = options;
  const now = /* @__PURE__ */ new Date();
  const dateStr = now.getFullYear().toString() + (now.getMonth() + 1).toString().padStart(2, "0") + now.getDate().toString().padStart(2, "0");
  const timeStr = now.getHours().toString().padStart(2, "0") + now.getMinutes().toString().padStart(2, "0");
  const timestamp = now.getTime();
  const userPart = userId ? userId.toString().padStart(3, "0").slice(-3) : "000";
  const randomPart = crypto.randomInt(100, 999);
  const uniqueId = (timestamp % 1e3).toString().padStart(3, "0") + userPart.slice(-3) + randomPart.toString();
  const shortId = uniqueId.slice(-6);
  return `${prefix}-${shortId}-${dateStr}-${timeStr}`;
}
function generateOrderIdWithProduct(userId, productId) {
  return generateOrderId({
    prefix: "NIXTY",
    userId,
    productId
  });
}

const { public: { baseUrl } } = useRuntimeConfig();
const snap = new midtransClient.Snap({
  isProduction: midtransConfig.isProduction,
  serverKey: midtransConfig.serverKey,
  clientKey: midtransConfig.clientKey
});
const initiate_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { product, customer, quantity = 1 } = body;
  if (!product || !customer || !customer.email || !customer.name || !product.id || !product.price) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: Missing required product or customer data."
    });
  }
  if (quantity <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: Quantity must be greater than 0."
    });
  }
  if (!customer.email.includes("@")) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: Invalid email format."
    });
  }
  if (body.payment_method || body.enabled_payments) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: Payment method cannot be overridden."
    });
  }
  const user = await requireAuth(event);
  try {
    const [stockResult] = await db.query(
      `SELECT 
        COUNT(*) as total_licenses,
        SUM(CASE 
          WHEN status = 'available' AND (COALESCE(send_license, 0) < max_usage)
          THEN (max_usage - COALESCE(send_license, 0))
          ELSE 0 
        END) as available_stock
      FROM nixty.product_license_base 
      WHERE product_id = ?`,
      [product.id]
    );
    if (stockResult.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "Product is out of stock."
      });
    }
    const availableStock = parseInt(stockResult[0].available_stock || 0);
    if (availableStock < quantity) {
      throw createError({
        statusCode: 400,
        statusMessage: `Not enough stock available. Requested: ${quantity}, Available: ${availableStock}`
      });
    }
    console.log(`Stock check passed: ${availableStock} available, ${quantity} requested`);
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    console.error("Error checking stock:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to verify product stock."
    });
  }
  const order_id = generateOrderIdWithProduct(user.id, product.id);
  const parameter = {
    transaction_details: {
      order_id,
      gross_amount: Math.round(product.price) * quantity
    },
    item_details: [{
      id: product.id,
      price: Math.round(product.price),
      quantity,
      name: `${product.name} ${product.version}`.substring(0, 50),
      // Max 50 chars
      category: product.category ? product.category.name : "Digital Product",
      merchant_name: "Nixty"
    }],
    customer_details: {
      first_name: customer.name.split(" ")[0],
      last_name: customer.name.split(" ").slice(1).join(" ") || customer.name.split(" ")[0],
      email: customer.email
    }
    // Enable all available payment methods (let user choose)
    // enabled_payments will be determined by Midtrans dashboard settings
  };
  parameter.callbacks = {
    finish: `${baseUrl}/payment/finish`,
    unfinish: `${baseUrl}/payment/unfinish`,
    error: `${baseUrl}/payment/error`
  };
  let snapToken, midtransResponse;
  try {
    console.log("Midtrans config being used:", {
      isProduction: midtransConfig.isProduction,
      serverKey: midtransConfig.serverKey ? midtransConfig.serverKey.substring(0, 10) + "..." : "MISSING",
      clientKey: midtransConfig.clientKey ? midtransConfig.clientKey.substring(0, 10) + "..." : "MISSING"
    });
    console.log("Transaction parameter being sent to Midtrans:", JSON.stringify(parameter, null, 2));
    snapToken = await snap.createTransactionToken(parameter);
    midtransResponse = {
      status_code: "201",
      transaction_id: null,
      // Will be updated via webhook
      gross_amount: (product.price * quantity).toString(),
      currency: "IDR",
      order_id,
      payment_type: null,
      // Will be updated when user selects payment method
      transaction_status: "pending",
      fraud_status: "accept",
      status_message: "Success, transaction is found",
      merchant_id: midtransConfig.merchantId || "G454677231",
      transaction_time: (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " "),
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      custom_email: customer.email
      // Store the custom email for license delivery
    };
    console.log("Midtrans transaction created:", {
      token: snapToken,
      order_id,
      status: "pending"
    });
  } catch (error) {
    console.error("Midtrans API Error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to get payment token from Midtrans."
    });
  }
  try {
    const [result] = await db.query(
      `INSERT INTO nixty.orders (user_id, product_id, quantity, total, status, order_id) 
       VALUES (?, ?, ?, ?, 'pending', ?) RETURNING id`,
      [
        user.id,
        product.id,
        quantity,
        product.price * quantity,
        order_id
      ]
    );
    const transactionId = result.length > 0 ? result[0].id : null;
    console.log("Transaction created with ID:", transactionId, "for user ID:", user.id);
    if (transactionId) {
      await db.query(
        `INSERT INTO nixty.payment_gateway_logs (transaction_id, key, value) VALUES (?, ?, ?)`,
        [transactionId, "midtrans_order_id", order_id]
      );
      await db.query(
        `INSERT INTO nixty.payment_gateway_logs (transaction_id, key, value) VALUES (?, ?, ?)`,
        [transactionId, "midtrans_response", JSON.stringify(midtransResponse)]
      );
      await db.query(
        `INSERT INTO nixty.payment_gateway_logs (transaction_id, key, value) VALUES (?, ?, ?)`,
        [transactionId, "customer_email", customer.email]
      );
      await db.query(
        `INSERT INTO nixty.payment_gateway_logs (transaction_id, key, value) VALUES (?, ?, ?)`,
        [transactionId, "custom_email", body.custom_email || customer.email]
      );
    }
  } catch (error) {
    console.error("Database Error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create transaction record."
    });
  }
  return { token: snapToken, order_id };
});

const initiate_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: initiate_post
}, Symbol.toStringTag, { value: 'Module' }));

new midtransClient.CoreApi({
  isProduction: midtransConfig.isProduction,
  serverKey: midtransConfig.serverKey,
  clientKey: midtransConfig.clientKey
});
const webhook_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  console.log("Received Midtrans Webhook:", body);
  const { order_id, status_code, gross_amount, signature_key, transaction_status, fraud_status } = body;
  let newStatus = "pending";
  if (transaction_status == "capture") {
    if (fraud_status == "accept") {
      newStatus = "completed";
    }
  } else if (transaction_status == "settlement") {
    newStatus = "completed";
  } else if (transaction_status == "cancel" || transaction_status == "deny" || transaction_status == "expire") {
    newStatus = "failed";
  } else if (transaction_status == "pending") {
    newStatus = "pending";
  }
  try {
    const [result] = await db.query(
      `UPDATE nixty.transactions SET status = ?, payment_method = ?, payment_gateway_status = ?, payment_gateway_payload = ?, updated_at = NOW() WHERE order_id = ?`,
      [newStatus, body.payment_type || "midtrans", transaction_status, JSON.stringify(body), order_id]
    );
    if (result.affectedRows > 0) {
      console.log(`Transaction ${order_id} updated to ${newStatus}`);
      if (newStatus === "completed") {
        const [transactionRows] = await db.query("SELECT id, product_id, quantity, user_id, email, customer_name, product_name FROM nixty.transactions WHERE order_id = ?", [order_id]);
        if (transactionRows.length > 0) {
          const transactionId = transactionRows[0].id;
          const productId = transactionRows[0].product_id;
          const quantity = transactionRows[0].quantity || 1;
          const userId = transactionRows[0].user_id;
          const customerEmail = transactionRows[0].email;
          const customerName = transactionRows[0].customer_name || "Customer";
          const productName = transactionRows[0].product_name || `Product ${productId}`;
          const [availableLicenses] = await db.query(
            `SELECT id, license_type, product_key, email, password, additional_info, send_license, max_usage, notes 
             FROM nixty.product_licenses 
             WHERE product_id = ? 
             AND status = 'available' 
             AND (send_license \x7F max_usage OR send_license IS NULL)
             ORDER BY created_at ASC 
             LIMIT ?`,
            [productId, quantity]
          );
          if (availableLicenses.length >= quantity) {
            const licenseInfo = availableLicenses.map((license) => ({
              license_id: license.id,
              license_type: license.license_type,
              product_key: license.product_key,
              email: license.email,
              password: license.password,
              additional_info: license.additional_info,
              notes: license.notes,
              send_license: (license.send_license || 0) + 1,
              max_usage: license.max_usage || 1
            }));
            await db.query(
              `UPDATE nixty.transactions SET license_info = ? WHERE id = ?`,
              [JSON.stringify(licenseInfo), transactionId]
            );
            for (const license of availableLicenses) {
              const newSendLicense = (license.send_license || 0) + 1;
              const newStatus2 = newSendLicense >= license.max_usage ? "used" : "available";
              await db.query(
                `UPDATE nixty.product_licenses 
                 SET send_license = ?, status = ?, updated_at = NOW() 
                 WHERE id = ?`,
                [newSendLicense, newStatus2, license.id]
              );
            }
            console.log(`\u2705 ${quantity} license(s) assigned to transaction ${transactionId}:`);
            licenseInfo.forEach((license, index) => {
              console.log(`   License ${index + 1}: ${license.license_type} - ${license.product_key || license.email}`);
            });
            let customEmail = null;
            try {
              const [customEmailLogs] = await db.query(
                "SELECT log_value FROM nixty.payment_gateway_logs WHERE transaction_id = ? AND log_key = 'custom_email' LIMIT 1",
                [transactionId]
              );
              if (customEmailLogs.length > 0 && customEmailLogs[0].log_value) {
                customEmail = customEmailLogs[0].log_value;
                console.log(`Found custom email in logs: ${customEmail}`);
              }
            } catch (logError) {
              console.error(`Error fetching custom email from logs:`, logError);
            }
            try {
              let emailResult;
              if (quantity > 1) {
                emailResult = await sendMultipleLicenseEmail(
                  customerEmail,
                  customerName,
                  productName,
                  licenseInfo,
                  order_id,
                  customEmail !== customerEmail ? customEmail : null
                );
                console.log("Email sending result:", emailResult);
                if (!emailResult.success) {
                  console.error(`Failed to send license email: ${emailResult.error || emailResult.message}`);
                } else {
                  console.log(`\u2705 License email sent successfully to: ${customerEmail}${customEmail ? ` and ${customEmail}` : ""}`);
                }
              } else {
                emailResult = await sendLicenseEmail(
                  customerEmail,
                  customerName,
                  productName,
                  licenseInfo[0],
                  order_id,
                  customEmail !== customerEmail ? customEmail : null
                );
                console.log("Email sending result:", emailResult);
                if (!emailResult.success) {
                  console.error(`Failed to send license email: ${emailResult.error || emailResult.message}`);
                } else {
                  console.log(`\u2705 License email sent successfully to: ${customerEmail}${customEmail ? ` and ${customEmail}` : ""}`);
                }
              }
            } catch (emailError) {
              console.error("Error sending license email:", emailError);
            }
          } else {
            console.warn(`\u26A0\uFE0F  Insufficient licenses available for product ${productId}. Required: ${quantity}, Available: ${availableLicenses.length}`);
          }
        }
      }
    } else {
      console.warn(`No transaction found with order_id: ${order_id}`);
    }
  } catch (error) {
    console.error("Webhook DB Error:", error);
    throw createError({ statusCode: 500, statusMessage: "Internal Server Error" });
  }
  return { message: "Webhook processed successfully" };
});

const webhook_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: webhook_post
}, Symbol.toStringTag, { value: 'Module' }));

const index_get$a = defineEventHandler(async (event) => {
  try {
    const query = getQuery$1(event);
    const {
      featured,
      limit = 10,
      offset = 0,
      status = "active"
    } = query;
    let sql = `
      SELECT 
        d.*,
        p.name as product_name,
        p.description as product_description,
        p.image_url as product_image,
        c.name as category_name,
        c.slug as category_slug
      FROM deals d
      LEFT JOIN products p ON d.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE d.status = ?
    `;
    const params = [status];
    if (featured === "true") {
      sql += " AND d.is_featured = 1";
    }
    sql += " AND (d.expires_at IS NULL OR d.expires_at > NOW())";
    sql += " ORDER BY d.is_featured DESC, d.created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));
    const [rows] = await db.query(sql, params);
    const deals = rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      oldPrice: row.old_price ? `Rp${Math.floor(row.old_price).toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : null,
      newPrice: `Rp${Math.floor(row.new_price).toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      price: `Rp${Math.floor(row.new_price).toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      // For compatibility
      discount: row.discount_percentage ? `${row.discount_percentage}% OFF` : null,
      badge: row.badge,
      backgroundImage: row.background_image_url,
      image: row.background_image_url,
      // For compatibility
      isFeatured: Boolean(row.is_featured),
      product: row.product_id ? {
        id: row.product_id,
        name: row.product_name,
        description: row.product_description,
        image: row.product_image,
        category: row.category_slug
      } : null,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    const featuredDeals = deals.filter((deal) => deal.isFeatured);
    const sideDeals = deals.filter((deal) => !deal.isFeatured);
    return {
      success: true,
      data: {
        all: deals,
        featured: featuredDeals,
        side: sideDeals
      },
      total: deals.length
    };
  } catch (error) {
    console.error("Error fetching deals:", error);
    return {
      success: false,
      message: "An error occurred while fetching deals",
      data: {
        all: [],
        featured: [],
        side: []
      }
    };
  }
});

const index_get$b = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: index_get$a
}, Symbol.toStringTag, { value: 'Module' }));

const forgotPassword_post = defineEventHandler(async (event) => {
  try {
    const { email } = await readBody(event);
    if (!email) {
      return {
        success: false,
        message: "Email is required"
      };
    }
    const [users] = await db.query(
      "SELECT id, email, name FROM nixty.users WHERE email = ?",
      [email]
    );
    if (users.length === 0) {
      console.log(`Reset password requested for non-existent email: ${email}`);
      return {
        success: true,
        message: "If an account with this email exists, a password reset link has been sent."
      };
    }
    const user = users[0];
    const resetToken = randomBytes(32).toString("hex");
    const tokenExpiry = /* @__PURE__ */ new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 1);
    await db.query(
      "UPDATE nixty.users SET reset_token = ?, reset_token_expires = ? WHERE id = ?",
      [resetToken, tokenExpiry, user.id]
    );
    const resetUrl = `${event.node.req.headers.origin || "http://localhost:3000"}/reset-password?token=${resetToken}`;
    console.log(`Password reset link for ${email}: ${resetUrl}`);
    return {
      success: true,
      message: "If an account with this email exists, a password reset link has been sent.",
      // In production, remove the resetUrl from response
      resetUrl
    };
  } catch (error) {
    console.error("Forgot password error:", error);
    return {
      success: false,
      message: "An error occurred while processing your request"
    };
  }
});

const forgotPassword_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: forgotPassword_post
}, Symbol.toStringTag, { value: 'Module' }));

const index_get$8 = defineEventHandler(async (event) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        h.*,
        p.name as product_name,
        p.price as product_price,
        p.period as product_period,
        c.name as category_name,
        c.slug as category_slug
      FROM hero_slides h
      LEFT JOIN products p ON h.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE h.status = 'active'
      ORDER BY h.sort_order ASC, h.created_at DESC
    `);
    const heroSlides = rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      rating: row.rating,
      categories: row.category_name ? [row.category_name] : [],
      isNew: Boolean(row.is_new),
      backgroundImage: row.background_image_url,
      product: row.product_id ? {
        id: row.product_id,
        name: row.product_name,
        price: row.product_price,
        period: row.product_period,
        category: row.category_slug
      } : null,
      sortOrder: row.sort_order,
      createdAt: row.created_at
    }));
    return {
      success: true,
      data: heroSlides
    };
  } catch (error) {
    console.error("Error fetching hero slides:", error);
    return {
      success: false,
      message: "An error occurred while fetching hero slides",
      data: []
    };
  }
});

const index_get$9 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: index_get$8
}, Symbol.toStringTag, { value: 'Module' }));

const homePageSimple_get = defineEventHandler(async (event) => {
  try {
    console.log("Fetching home page data...");
    const [announcements] = await db.query(`
      SELECT id, title, image_url, created_at, is_new
      FROM nixty.announcements 
      WHERE status = 'active' 
      ORDER BY created_at DESC 
      LIMIT 3
    `);
    const [categories] = await db.query(`
      SELECT id, name, slug
      FROM nixty.categories
      ORDER BY name ASC
      LIMIT 10
    `);
    const [heroSlides] = await db.query(`
      SELECT id, title, description, background_image_url, is_new
      FROM nixty.hero_slides 
      WHERE status = 'active' 
      ORDER BY sort_order ASC 
      LIMIT 5
    `);
    const [products] = await db.query(`
      SELECT 
        p.id, p.name, p.slug, p.price, p.image_url, p.is_featured, p.is_trending,
        c.name as category_name
      FROM nixty.products p
      LEFT JOIN nixty.categories c ON p.category_id = c.id
      WHERE p.status = 'active' 
      ORDER BY p.is_featured DESC, p.created_at DESC 
      LIMIT 20
    `);
    console.log("Data loaded:", {
      announcements: announcements.length,
      categories: categories.length,
      heroSlides: heroSlides.length,
      products: products.length
    });
    return {
      success: true,
      data: {
        announcements,
        categories,
        heroSlides,
        products,
        featuredProducts: products.filter((p) => p.is_featured),
        trendingProducts: products.filter((p) => p.is_trending)
      }
    };
  } catch (error) {
    console.error("Error fetching home page data:", error);
    return {
      success: false,
      message: "An error occurred while fetching home page data",
      error: error.message
    };
  }
});

const homePageSimple_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: homePageSimple_get
}, Symbol.toStringTag, { value: 'Module' }));

async function fetchHomePageData() {
  const announcementsQuery = db.query(`
    SELECT id, title, image_url, created_at, is_new
    FROM nixty.announcements 
    WHERE status = 'active' 
    ORDER BY created_at DESC 
    LIMIT 3
  `);
  const categoriesQuery = db.query(`
    SELECT 
      c.id, c.name, c.slug,
      COUNT(p.id) as product_count,
      (SELECT image_url FROM nixty.products WHERE category_id = c.id AND status = 'active' ORDER BY created_at DESC LIMIT 1) as image_url
    FROM nixty.categories c
    LEFT JOIN nixty.products p ON c.id = p.category_id AND p.status = 'active'
    GROUP BY c.id, c.name, c.slug
    ORDER BY c.name ASC
    LIMIT 10
  `);
  const dealsQuery = db.query(`
    SELECT p.id, p.name, p.slug, p.price, p.discount_price, p.image_url
    FROM nixty.products p
    WHERE p.status = 'active' AND p.discount_price IS NOT NULL AND p.discount_price > 0
    ORDER BY (p.price - p.discount_price) DESC
    LIMIT 3
  `);
  const heroSlidesQuery = db.query(`
    SELECT id, title, description, background_image_url, is_new
    FROM nixty.hero_slides 
    WHERE status = 'active' 
    ORDER BY sort_order ASC 
    LIMIT 5
  `);
  const allProductsQuery = db.query(`
    SELECT 
      p.id, p.name, p.version, p.slug, p.short_description, p.price,
      p.image_url, p.is_featured, p.is_trending, p.discount_price,
      p.tags, p.is_multi_license,
      c.slug as category_slug, c.name as category_name
    FROM nixty.products p
    LEFT JOIN nixty.categories c ON p.category_id = c.id
    WHERE p.status = 'active' 
    ORDER BY p.is_featured DESC, p.is_trending DESC, p.created_at DESC 
    LIMIT 50
  `);
  const [
    [announcements],
    [categories],
    [deals],
    [heroSlides],
    [allProducts]
  ] = await Promise.all([
    announcementsQuery,
    categoriesQuery,
    dealsQuery,
    heroSlidesQuery,
    allProductsQuery
  ]);
  const mappedCategories = categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    productCount: parseInt(category.product_count, 10),
    imageUrl: category.image_url || "/placeholder-product.png"
  }));
  const processedProducts = allProducts.map((product) => {
    const originalPrice = parseFloat(product.price) || 0;
    const discountPrice = parseFloat(product.discount_price) || 0;
    let discountPercentage = 0;
    if (discountPrice > 0 && originalPrice > 0) {
      discountPercentage = Math.round((originalPrice - discountPrice) / originalPrice * 100);
    }
    return {
      ...product,
      discount_percentage: discountPercentage
    };
  });
  const processedDeals = deals.map((deal) => {
    const price = parseFloat(deal.price) || 0;
    const discountPrice = parseFloat(deal.discount_price) || 0;
    let discountPercentage = 0;
    if (discountPrice > 0 && price > 0) {
      discountPercentage = Math.round((price - discountPrice) / price * 100);
    }
    return {
      ...deal,
      discount_percentage: discountPercentage
    };
  });
  return {
    announcements,
    categories: mappedCategories,
    deals: processedDeals,
    heroSlides,
    allProducts: processedProducts.slice(0, 30),
    featuredProducts: processedProducts.filter((p) => p.is_featured).slice(0, 12),
    newProducts: processedProducts.filter((p) => p.created_at && new Date(p.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3)).slice(0, 12),
    trendingProducts: processedProducts.filter((p) => p.is_trending).slice(0, 12)
  };
}
const index_get$6 = defineEventHandler(async (event) => {
  try {
    const data = await useCache("home_page_data", fetchHomePageData);
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error("Error fetching home page data:", error);
    return {
      success: false,
      message: "An error occurred while fetching home page data.",
      data: {
        allProducts: [],
        featuredProducts: [],
        newProducts: [],
        trendingProducts: [],
        categories: [],
        announcements: [],
        deals: [],
        heroSlides: []
      }
    };
  }
});

const index_get$7 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: index_get$6
}, Symbol.toStringTag, { value: 'Module' }));

const login_post = defineEventHandler(async (event) => {
  try {
    const { email, password } = await readBody(event);
    if (!email || !password) {
      return {
        success: false,
        message: "Email and password are required"
      };
    }
    const [users] = await db.query(
      "SELECT * FROM nixty.users WHERE email = ?",
      [email]
    );
    if (users.length === 0) {
      return {
        success: false,
        message: "User not found"
      };
    }
    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return {
        success: false,
        message: "Invalid password"
      };
    }
    const { password: _, ...userWithoutPassword } = user;
    return {
      success: true,
      message: "Login successful",
      user: userWithoutPassword
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      message: "An error occurred during login"
    };
  }
});

const login_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: login_post
}, Symbol.toStringTag, { value: 'Module' }));

async function verifySignature$1(orderId, statusCode, grossAmount, serverKey) {
  try {
    const stringToSign = `${orderId}${statusCode}${grossAmount}${serverKey}`;
    const hash = crypto.createHash("sha512").update(stringToSign).digest("hex");
    return hash;
  } catch (error) {
    console.error("Error verifying signature:", error);
    throw error;
  }
}

async function setPaymentGatewayLog$1(transactionId, key, value) {
  try {
    const [existing] = await db.execute(
      `SELECT id FROM nixty.payment_gateway_logs 
       WHERE transaction_id = ? AND key = ? LIMIT 1`,
      [transactionId, key]
    );
    if (existing.length > 0) {
      await db.execute(
        `UPDATE nixty.payment_gateway_logs SET value = ?
         WHERE transaction_id = ? AND key = ?`,
        [value.toString(), transactionId, key]
      );
    } else {
      await db.execute(
        `INSERT INTO nixty.payment_gateway_logs (transaction_id, key, value)
         VALUES (?, ?, ?)`,
        [transactionId, key, value.toString()]
      );
    }
    return true;
  } catch (error) {
    console.error(`Error setting payment gateway log ${key}:`, error);
    return false;
  }
}
async function assignLicenseToTransaction$1(transactionId, productId, quantity) {
  try {
    await db.execute("START TRANSACTION");
    const [availableLicenses] = await db.execute(`
      SELECT id, license_type FROM nixty.product_license_base
      WHERE product_id = ? AND status = 'available'
      LIMIT ?
    `, [productId, quantity]);
    if (availableLicenses.length < quantity) {
      await db.execute("ROLLBACK");
      return {
        success: false,
        message: `Not enough licenses available: requested ${quantity}, found ${availableLicenses.length}`
      };
    }
    for (const license of availableLicenses) {
      await db.execute(`
        UPDATE nixty.product_license_base
        SET status = 'used'
        WHERE id = ?
      `, [license.id]);
      await db.execute(`
        INSERT INTO nixty.transaction_license (transaction_id, license_id)
        VALUES (?, ?)
      `, [transactionId, license.id]);
    }
    await db.execute("COMMIT");
    return {
      success: true,
      licenses: availableLicenses,
      count: availableLicenses.length
    };
  } catch (error) {
    await db.execute("ROLLBACK");
    console.error("Error assigning licenses:", error);
    return {
      success: false,
      message: error.message
    };
  }
}
const notificationWithSchemaFixed_post = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const serverKey = config.midtransServerKey;
  try {
    const body = await readBody(event);
    const orderId = body.order_id;
    console.log(`Midtrans notification received for order ${orderId}`);
    const receivedSignature = body.signature_key;
    const expectedSignature = await verifySignature$1(
      body.order_id,
      body.status_code,
      body.gross_amount,
      serverKey
    );
    if (receivedSignature !== expectedSignature) {
      console.error("Midtrans Notification: Invalid signature.");
      throw createError({ statusCode: 400, statusMessage: "Invalid signature" });
    }
    const transactionStatus = body.transaction_status;
    const fraudStatus = body.fraud_status;
    const paymentType = body.payment_type;
    const [transactionIdResult] = await db.execute(`
      SELECT transaction_id FROM nixty.payment_gateway_logs
      WHERE key = 'order_id' AND value = ?
      LIMIT 1
    `, [orderId]);
    if (transactionIdResult.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Transaction not found for order_id: " + orderId
      });
    }
    const transactionId = transactionIdResult[0].transaction_id;
    const [transactions] = await db.execute(`
      SELECT t.*, p.id as product_id
      FROM nixty.transactions t
      JOIN nixty.products p ON t.product_id = p.id
      WHERE t.id = ?
    `, [transactionId]);
    if (transactions.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Transaction details not found: " + transactionId
      });
    }
    const transaction = transactions[0];
    let dbStatus = "pending";
    if (transactionStatus === "capture") {
      if (fraudStatus === "accept") {
        dbStatus = "completed";
      }
    } else if (transactionStatus === "settlement") {
      dbStatus = "completed";
    } else if (["cancel", "expire", "deny"].includes(transactionStatus)) {
      dbStatus = "failed";
    }
    await db.execute(`
      UPDATE nixty.transactions
      SET status = ?
      WHERE id = ?
    `, [dbStatus, transactionId]);
    await setPaymentGatewayLog$1(transactionId, "transaction_status", transactionStatus);
    await setPaymentGatewayLog$1(transactionId, "payment_type", paymentType);
    await setPaymentGatewayLog$1(transactionId, "notification_received", (/* @__PURE__ */ new Date()).toISOString());
    await setPaymentGatewayLog$1(transactionId, "full_notification", JSON.stringify(body));
    console.log(`Transaction ${transactionId} status updated to ${dbStatus}`);
    let licenseResult = { success: false, count: 0 };
    if (dbStatus === "completed") {
      const [existingLicenses] = await db.execute(`
        SELECT COUNT(*) as count
        FROM nixty.transaction_license
        WHERE transaction_id = ?
      `, [transactionId]);
      const hasLicenses = existingLicenses[0].count > 0;
      if (!hasLicenses) {
        console.log(`Assigning licenses for transaction ${transactionId}`);
        const quantity = transaction.quantity || 1;
        licenseResult = await assignLicenseToTransaction$1(
          transactionId,
          transaction.product_id,
          quantity
        );
        if (licenseResult.success) {
          console.log(`Successfully assigned ${licenseResult.count} licenses to transaction ${transactionId}`);
        } else {
          console.error(`Failed to assign licenses to transaction ${transactionId}: ${licenseResult.message}`);
        }
      } else {
        console.log(`Licenses already assigned for transaction ${transactionId}`);
        licenseResult = { success: true, count: existingLicenses[0].count };
      }
    }
    return {
      status: "ok",
      message: "Notification processed successfully.",
      transaction_status: dbStatus,
      licenses_processed: licenseResult.count
    };
  } catch (err) {
    console.error("Error processing notification:", err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.message || "Failed to process notification"
    });
  }
});

const notificationWithSchemaFixed_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: notificationWithSchemaFixed_post
}, Symbol.toStringTag, { value: 'Module' }));

async function setPaymentGatewayLog(transactionId, key, value) {
  try {
    const [existing] = await db.execute(
      `SELECT id FROM nixty.payment_gateway_logs 
       WHERE transaction_id = ? AND key = ? LIMIT 1`,
      [transactionId, key]
    );
    if (existing.length > 0) {
      await db.execute(
        `UPDATE nixty.payment_gateway_logs SET value = ?
         WHERE transaction_id = ? AND key = ?`,
        [value.toString(), transactionId, key]
      );
    } else {
      await db.execute(
        `INSERT INTO nixty.payment_gateway_logs (transaction_id, key, value)
         VALUES (?, ?, ?)`,
        [transactionId, key, value.toString()]
      );
    }
    return true;
  } catch (error) {
    console.error(`Error setting payment gateway log ${key}:`, error);
    return false;
  }
}
async function assignLicenseToTransaction(transactionId, productId, quantity) {
  try {
    await db.execute("START TRANSACTION");
    const [availableLicenses] = await db.execute(`
      SELECT id, license_type FROM nixty.product_license_base
      WHERE product_id = ? AND status = 'available'
      LIMIT ?
    `, [productId, quantity]);
    if (availableLicenses.length < quantity) {
      await db.execute("ROLLBACK");
      return {
        success: false,
        message: `Not enough licenses available: requested ${quantity}, found ${availableLicenses.length}`
      };
    }
    for (const license of availableLicenses) {
      await db.execute(`
        UPDATE nixty.product_license_base
        SET status = 'used'
        WHERE id = ?
      `, [license.id]);
      await db.execute(`
        INSERT INTO nixty.transaction_license (transaction_id, license_id)
        VALUES (?, ?)
      `, [transactionId, license.id]);
    }
    await db.execute("COMMIT");
    return {
      success: true,
      licenses: availableLicenses,
      count: availableLicenses.length
    };
  } catch (error) {
    await db.execute("ROLLBACK");
    console.error("Error assigning licenses:", error);
    return {
      success: false,
      message: error.message
    };
  }
}
const notificationWithSchema_post = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const serverKey = config.midtransServerKey;
  try {
    const body = await readBody(event);
    const orderId = body.order_id;
    console.log(`Midtrans notification received for order ${orderId}`);
    const receivedSignature = body.signature_key;
    const expectedSignature = await verifySignature$1(
      body.order_id,
      body.status_code,
      body.gross_amount,
      serverKey
    );
    if (receivedSignature !== expectedSignature) {
      console.error("Midtrans Notification: Invalid signature.");
      throw createError({ statusCode: 400, statusMessage: "Invalid signature" });
    }
    const transactionStatus = body.transaction_status;
    const fraudStatus = body.fraud_status;
    const paymentType = body.payment_type;
    const [transactionIdResult] = await db.execute(`
      SELECT transaction_id FROM nixty.payment_gateway_logs
      WHERE key = 'order_id' AND value = ?
      LIMIT 1
    `, [orderId]);
    if (transactionIdResult.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Transaction not found for order_id: " + orderId
      });
    }
    const transactionId = transactionIdResult[0].transaction_id;
    const [transactions] = await db.execute(`
      SELECT t.*, p.id as product_id
      FROM nixty.transactions t
      JOIN nixty.products p ON t.product_id = p.id
      WHERE t.id = ?
    `, [transactionId]);
    if (transactions.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Transaction details not found: " + transactionId
      });
    }
    const transaction = transactions[0];
    let dbStatus = "pending";
    if (transactionStatus === "capture") {
      if (fraudStatus === "accept") {
        dbStatus = "completed";
      }
    } else if (transactionStatus === "settlement") {
      dbStatus = "completed";
    } else if (["cancel", "expire", "deny"].includes(transactionStatus)) {
      dbStatus = "failed";
    }
    await db.execute(`
      UPDATE nixty.transactions
      SET status = ?
      WHERE id = ?
    `, [dbStatus, transactionId]);
    await setPaymentGatewayLog(transactionId, "transaction_status", transactionStatus);
    await setPaymentGatewayLog(transactionId, "payment_type", paymentType);
    await setPaymentGatewayLog(transactionId, "notification_received", (/* @__PURE__ */ new Date()).toISOString());
    await setPaymentGatewayLog(transactionId, "full_notification", JSON.stringify(body));
    console.log(`Transaction ${transactionId} status updated to ${dbStatus}`);
    let licenseResult = { success: false, count: 0 };
    if (dbStatus === "completed") {
      const [existingLicenses] = await db.execute(`
        SELECT COUNT(*) as count
        FROM nixty.transaction_license
        WHERE transaction_id = ?
      `, [transactionId]);
      const hasLicenses = existingLicenses[0].count > 0;
      if (!hasLicenses) {
        console.log(`Assigning licenses for transaction ${transactionId}`);
        const quantity = transaction.quantity || 1;
        licenseResult = await assignLicenseToTransaction(
          transactionId,
          transaction.product_id,
          quantity
        );
        if (licenseResult.success) {
          console.log(`Successfully assigned ${licenseResult.count} licenses to transaction ${transactionId}`);
        } else {
          console.error(`Failed to assign licenses to transaction ${transactionId}: ${licenseResult.message}`);
        }
      } else {
        console.log(`Licenses already assigned for transaction ${transactionId}`);
        licenseResult = { success: true, count: existingLicenses[0].count };
      }
    }
    return {
      status: "ok",
      message: "Notification processed successfully.",
      transaction_status: dbStatus,
      licenses_processed: licenseResult.count
    };
  } catch (err) {
    console.error("Error processing notification:", err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.message || "Failed to process notification"
    });
  }
});

const notificationWithSchema_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: notificationWithSchema_post
}, Symbol.toStringTag, { value: 'Module' }));

async function verifySignature(orderId, statusCode, grossAmount, serverKey) {
  const signatureKey = crypto.createHash("sha512").update(`${orderId}${statusCode}${grossAmount}${serverKey}`).digest("hex");
  return signatureKey;
}
const notification_post = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const serverKey = config.midtransServerKey;
  const startTime = Date.now();
  let webhookLogId = null;
  let orderId = null;
  try {
    const body = await readBody(event);
    orderId = body.order_id;
    webhookLogId = await WebhookLogger.logWebhookStart(orderId, body);
    console.log(`[WEBHOOK-${webhookLogId}] Midtrans notification received for order ${orderId}`);
    const receivedSignature = body.signature_key;
    const expectedSignature = await verifySignature(
      body.order_id,
      body.status_code,
      body.gross_amount,
      serverKey
    );
    if (receivedSignature !== expectedSignature) {
      console.error("Midtrans Notification: Invalid signature.");
      throw createError({ statusCode: 400, statusMessage: "Invalid signature" });
    }
    const transactionStatus = body.transaction_status;
    orderId = body.order_id;
    const fraudStatus = body.fraud_status;
    const paymentType = body.payment_type;
    let paymentCode = null;
    if (paymentType === "bank_transfer" && body.va_numbers && body.va_numbers.length > 0) {
      paymentCode = body.va_numbers[0].va_number;
    } else if (paymentType === "qris") {
      paymentCode = body.acquirer;
    } else if (paymentType === "cstore") {
      paymentCode = body.payment_code;
    }
    console.log(`Midtrans Notification: Received for order ${orderId} with status: ${transactionStatus}`);
    const updateQuery = `
      UPDATE transactions 
      SET 
        status = ?, 
        payment_gateway_status = ?, 
        payment_gateway_payload = ?,
        payment_method = ?,
        va_number = ?,
        updated_at = NOW()
      WHERE order_id = ?
    `;
    let dbStatus = "pending";
    if (transactionStatus == "capture") {
      if (fraudStatus == "accept") {
        dbStatus = "completed";
      }
    } else if (transactionStatus == "settlement") {
      dbStatus = "completed";
    } else if (transactionStatus == "cancel" || transactionStatus == "expire" || transactionStatus == "deny") {
      dbStatus = "failed";
    }
    await db.execute(updateQuery, [
      dbStatus,
      transactionStatus,
      JSON.stringify(body),
      // Store the full notification payload for reference
      paymentType,
      paymentCode,
      orderId
    ]);
    console.log(`Midtrans Notification: Order ${orderId} status updated to ${dbStatus}. Payment via ${paymentType}.`);
    let licenseProcessingSuccess = false;
    let licensesProcessed = 0;
    let emailSent = false;
    if (dbStatus === "completed") {
      console.log(`[WEBHOOK-${webhookLogId}] Processing license delivery for completed order ${orderId}`);
      await db.execute("START TRANSACTION");
      try {
        const [transactions2] = await db.execute(
          `SELECT o.*, u.email AS user_email, u.name AS user_name
           FROM nixty.orders o
           JOIN nixty.users u ON o.user_id = u.id
           WHERE o.order_id = ?`,
          [orderId]
        );
        if (transactions2.length > 0) {
          const transaction = transactions2[0];
          let customEmail = null;
          try {
            const [customEmailLogs] = await db.execute(
              `SELECT value FROM nixty.payment_gateway_logs WHERE transaction_id = ? AND key = 'custom_email' LIMIT 1`,
              [transaction.id]
            );
            if (customEmailLogs.length > 0 && customEmailLogs[0].value) {
              customEmail = customEmailLogs[0].value;
              console.log(`[WEBHOOK-${webhookLogId}] Found custom email in logs: ${customEmail}`);
            }
          } catch (logError) {
            console.error(`[WEBHOOK-${webhookLogId}] Error fetching custom email from logs:`, logError);
          }
          let quantity = transaction.quantity || 1;
          if (quantity === 1 && body.item_details && Array.isArray(body.item_details) && body.item_details.length > 0) {
            const itemQuantity = body.item_details[0].quantity || 1;
            if (itemQuantity > 1) {
              quantity = itemQuantity;
              await db.execute(
                "UPDATE transactions SET quantity = ? WHERE id = ?",
                [quantity, transaction.id]
              );
            }
          }
          console.log(`Processing ${quantity} license(s) for order ${orderId}`);
          const allLicenses = [];
          let licenseProcessSuccess = true;
          const [beforeStock] = await db.execute(
            `SELECT available_stock FROM product_stock_view WHERE product_id = ?`,
            [transaction.product_id]
          );
          const stockBefore = beforeStock.length > 0 ? beforeStock[0].available_stock : 0;
          console.log(`[WEBHOOK-${webhookLogId}] Stock before processing: ${stockBefore}`);
          const multipleLicensesResult = await processMultipleLicenses(
            transaction.id,
            transaction.product_id,
            quantity,
            customEmail,
            transaction.customer_name || "Customer"
          );
          if (multipleLicensesResult.success) {
            allLicenses.push(...multipleLicensesResult.licenses);
            licensesProcessed = multipleLicensesResult.licenses.length;
            console.log(`[WEBHOOK-${webhookLogId}] Successfully processed ${licensesProcessed} licenses`);
          } else {
            console.error(`[WEBHOOK-${webhookLogId}] Failed to process multiple licenses: ${multipleLicensesResult.error || multipleLicensesResult.message}`);
            licenseProcessSuccess = false;
          }
          const [afterStock] = await db.execute(
            `SELECT available_stock FROM product_stock_view WHERE product_id = ?`,
            [transaction.product_id]
          );
          const stockAfter = afterStock.length > 0 ? afterStock[0].available_stock : 0;
          console.log(`[WEBHOOK-${webhookLogId}] Stock after processing: ${stockAfter}`);
          const expectedStockReduction = licensesProcessed;
          const actualStockReduction = stockBefore - stockAfter;
          if (actualStockReduction !== expectedStockReduction) {
            console.warn(`[WEBHOOK-${webhookLogId}] Stock reduction mismatch! Expected: ${expectedStockReduction}, Actual: ${actualStockReduction}`);
            if (actualStockReduction < expectedStockReduction) {
              console.log(`[WEBHOOK-${webhookLogId}] Attempting to refresh stock view...`);
              await db.execute(`
                UPDATE product_licenses 
                SET updated_at = NOW() 
                WHERE product_id = ? AND status = 'used' AND used_by_transaction_id = ?
              `, [transaction.product_id, transaction.id]);
            }
          }
          if (licenseProcessSuccess && allLicenses.length > 0) {
            await db.execute(
              `UPDATE transactions 
               SET license_info = ? 
               WHERE id = ?`,
              [JSON.stringify(allLicenses), transaction.id]
            );
            licenseProcessingSuccess = true;
            console.log(`[WEBHOOK-${webhookLogId}] Successfully processed ${allLicenses.length} licenses for order ${orderId}`);
            await db.execute("COMMIT");
          } else {
            await db.execute("ROLLBACK");
            console.error(`[WEBHOOK-${webhookLogId}] License processing failed, rolling back`);
          }
          if (licenseProcessingSuccess && allLicenses.length > 0) {
            console.log(`[WEBHOOK-${webhookLogId}] Preparing to send email with ${allLicenses.length} license(s)`);
            console.log(`[WEBHOOK-${webhookLogId}] Email parameters:`);
            console.log(`[WEBHOOK-${webhookLogId}]   - Primary email: ${transaction.email}`);
            console.log(`[WEBHOOK-${webhookLogId}]   - Customer name: ${transaction.customer_name || "Customer"}`);
            console.log(`[WEBHOOK-${webhookLogId}]   - Product name: ${transaction.product_name || `Product ${transaction.product_id}`}`);
            console.log(`[WEBHOOK-${webhookLogId}]   - Order ID: ${orderId}`);
            console.log(`[WEBHOOK-${webhookLogId}]   - Custom email: ${customEmail !== transaction.email ? customEmail : "None (using primary)"}`);
            console.log(`[WEBHOOK-${webhookLogId}]   - License count: ${allLicenses.length}`);
            try {
              const emailResult = await sendMultipleLicenseEmail(
                transaction.user_email,
                // Use the fetched user email
                transaction.customer_name || "Customer",
                transaction.product_name || `Product ${transaction.product_id}`,
                allLicenses,
                orderId,
                // Include Order ID
                customEmail
                // Pass the retrieved custom email
              );
              console.log(`[WEBHOOK-${webhookLogId}] Email service response:`, emailResult);
              if (emailResult.success) {
                emailSent = true;
                console.log(`[WEBHOOK-${webhookLogId}] \u2705 License email sent successfully to: ${transaction.user_email}${customEmail ? ` and ${customEmail}` : ""}`);
              } else {
                console.error(`[WEBHOOK-${webhookLogId}] \u274C Failed to send license email:`);
                console.error(`[WEBHOOK-${webhookLogId}]    Error: ${emailResult.error || emailResult.message}`);
                if (emailResult.details) {
                  console.error(`[WEBHOOK-${webhookLogId}]    Details:`, emailResult.details);
                }
              }
            } catch (emailError) {
              console.error(`[WEBHOOK-${webhookLogId}] \u274C Exception thrown during email sending:`);
              console.error(`[WEBHOOK-${webhookLogId}]    Error: ${emailError.message}`);
              console.error(`[WEBHOOK-${webhookLogId}]    Stack:`, emailError.stack);
            }
          } else if (allLicenses.length > 0) {
            console.warn(`[WEBHOOK-${webhookLogId}] Partial license delivery for order ${orderId}: ${licensesProcessed}/${quantity} licenses processed`);
          } else {
            console.error(`[WEBHOOK-${webhookLogId}] Failed to process any licenses for order ${orderId}`);
          }
        }
      } catch (licenseError) {
        await db.execute("ROLLBACK");
        console.error(`[WEBHOOK-${webhookLogId}] Error processing license delivery:`, licenseError);
        if ((transactions == null ? void 0 : transactions.length) > 0) {
          await WebhookLogger.logLicenseDeliveryFailure(
            transactions[0].id,
            orderId,
            `License processing error: ${licenseError.message}`
          );
        }
      }
    }
    const processingDuration = Date.now() - startTime;
    await WebhookLogger.logWebhookComplete(
      webhookLogId,
      200,
      licenseProcessingSuccess,
      licensesProcessed,
      emailSent,
      processingDuration
    );
    console.log(`[WEBHOOK-${webhookLogId}] Completed in ${processingDuration}ms - Licenses: ${licensesProcessed}, Email: ${emailSent}`);
    return {
      status: "ok",
      message: "Notification processed successfully.",
      licenses_processed: licensesProcessed,
      email_sent: emailSent
    };
  } catch (err) {
    const processingDuration = Date.now() - startTime;
    await WebhookLogger.logWebhookError(
      webhookLogId,
      err.message,
      err.statusCode || 500
    );
    console.error(`[WEBHOOK-${webhookLogId || "UNKNOWN"}] Error after ${processingDuration}ms:`, err);
    return {
      status: "error",
      message: "Notification processed with errors",
      error: err.message
    };
  }
});

const notification_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: notification_post
}, Symbol.toStringTag, { value: 'Module' }));

const status_get = defineEventHandler(async (event) => {
  const query = getQuery$1(event);
  const orderId = query.order_id;
  console.log("Received request to check status for order:", orderId);
  if (!orderId) {
    console.error("Order ID is required but not provided");
    throw createError({
      statusCode: 400,
      message: "Order ID is required"
    });
  }
  let coreApi = new midtransClient.CoreApi({
    isProduction: midtransConfig.isProduction,
    serverKey: midtransConfig.serverKey
  });
  try {
    console.log("Calling Midtrans API for order:", orderId);
    const transactionStatus = await coreApi.transaction.status(orderId);
    console.log("Midtrans API response:", transactionStatus);
    return {
      success: true,
      data: transactionStatus
    };
  } catch (error) {
    console.error(`Error fetching Midtrans transaction status for order ${orderId}:`, error);
    return {
      success: false,
      message: error.message || "Failed to fetch transaction status",
      error
    };
  }
});

const status_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: status_get
}, Symbol.toStringTag, { value: 'Module' }));

const _id__get$6 = defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event);
    const orderId = getRouterParam(event, "id");
    if (!orderId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Order ID is required"
      });
    }
    let orderQuery, orderParams;
    if (orderId && isNaN(orderId)) {
      orderQuery = `SELECT 
        o.id, 
        o.order_id,
        o.user_id,
        o.product_id,
        o.quantity,
        o.total,
        o.status,
        o.created_at,
        p.name as product_name,
        p.description as product_description,
        p.price as product_price,
        p.image_url as product_image_url,
        c.id as category_id,
        c.name as category_name,
        c.slug as category_slug
      FROM nixty.orders o
      LEFT JOIN nixty.products p ON o.product_id = p.id
      LEFT JOIN nixty.categories c ON p.category_id = c.id
      WHERE o.order_id = $1 AND o.user_id = $2`;
      orderParams = [orderId, user.id];
    } else {
      orderQuery = `SELECT 
        o.id, 
        o.order_id,
        o.user_id,
        o.product_id,
        o.quantity,
        o.total,
        o.status,
        o.created_at,
        p.name as product_name,
        p.description as product_description,
        p.price as product_price,
        p.image_url as product_image_url,
        c.id as category_id,
        c.name as category_name,
        c.slug as category_slug
      FROM nixty.orders o
      LEFT JOIN nixty.products p ON o.product_id = p.id
      LEFT JOIN nixty.categories c ON p.category_id = c.id
      WHERE o.id = $1 AND o.user_id = $2`;
      orderParams = [parseInt(orderId), user.id];
    }
    const [orders] = await db.query(orderQuery, orderParams);
    if (orders.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Order not found"
      });
    }
    const order = orders[0];
    const [paymentLogs] = await db.query(
      `SELECT 
        id,
        key,
        value
      FROM nixty.payment_gateway_logs
      WHERE (order_ref = $1 OR transaction_id = $2)
      ORDER BY id ASC`,
      [order.order_id || orderId, order.id]
    );
    let midtransOrderId = null;
    if (order.status === "failed" && paymentLogs.length > 0) {
      const orderIdLog = paymentLogs.find(
        (log) => log.key === "order_id" || log.key === "midtrans_order_id" || log.key === "transaction_id" || log.key === "gross_amount"
      );
      if (orderIdLog) {
        midtransOrderId = orderIdLog.value;
      }
    }
    let licenseData = null;
    const isCompleted = order.status === "completed";
    if (isCompleted) {
      try {
        const [orderLicenses] = await db.query(
          `SELECT 
            ol.license_id,
            plb.license_type,
            plb.status as license_status,
            plb.notes,
            plb.max_usage,
            plb.send_license,
            plk.product_key,
            pla.email,
            pla.password
          FROM nixty.orders_license ol
          INNER JOIN nixty.product_license_base plb ON ol.license_id = plb.id
          LEFT JOIN nixty.product_license_keys plk ON plb.id = plk.id AND plb.license_type = 'product_key'
          LEFT JOIN nixty.product_license_accounts pla ON plb.id = pla.id AND plb.license_type = 'email_password'
          WHERE ol.transaction_id = $1`,
          [order.id]
        );
        if (orderLicenses.length > 0) {
          licenseData = orderLicenses.map((license) => ({
            license_type: license.license_type,
            status: license.license_status,
            notes: license.notes,
            max_usage: license.max_usage,
            send_license: license.send_license,
            product_key: license.product_key || null,
            email: license.email || null,
            password: license.password || null,
            account: license.email ? {
              email: license.email,
              password: license.password
            } : null
          }));
          console.log(`Found ${licenseData.length} licenses for order ${orderId}`);
        }
      } catch (err) {
        console.error("Error fetching license data:", err);
      }
    }
    return {
      success: true,
      order: {
        id: order.order_id || order.id,
        // Use custom order_id if available, fallback to numeric id
        numeric_id: order.id,
        // Keep numeric ID for internal reference
        order_id: order.order_id,
        // Custom Midtrans-style order ID
        user_id: order.user_id,
        product_id: order.product_id,
        quantity: order.quantity,
        total: parseFloat(order.total),
        status: order.status,
        created_at: order.created_at,
        midtrans_order_id: midtransOrderId,
        // Show Midtrans order ID for failed orders
        product: {
          name: order.product_name,
          description: order.product_description,
          price: parseFloat(order.product_price),
          image_url: order.product_image_url,
          category: {
            id: order.category_id,
            name: order.category_name,
            slug: order.category_slug
          }
        },
        licenses: licenseData || []
        // Always return as array for consistency
      },
      paymentLogs: paymentLogs || []
    };
  } catch (error) {
    console.error("Error fetching order details:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch order details"
    });
  }
});

const _id__get$7 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: _id__get$6
}, Symbol.toStringTag, { value: 'Module' }));

const autoCleanup_post = defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event);
    console.log("\u{1F9F9} Starting auto-cleanup for user:", user.id);
    const [result] = await db.query(
      `DELETE FROM transactions 
       WHERE user_id = $1 
       AND payment_gateway_status = 'not_found_in_gateway' 
       AND updated_at < NOW() - INTERVAL '1 hour'`,
      [user.id]
    );
    console.log("\u{1F9F9} Auto-cleanup completed. Deleted", result.affectedRows, "transactions");
    return {
      success: true,
      message: `Auto-cleanup completed. Deleted ${result.affectedRows} transactions.`,
      data: {
        deleted_count: result.affectedRows
      }
    };
  } catch (error) {
    console.error("Error in auto-cleanup:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to perform auto-cleanup"
    });
  }
});

const autoCleanup_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: autoCleanup_post
}, Symbol.toStringTag, { value: 'Module' }));

const deleteNotFound_post = defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event);
    const body = await readBody(event);
    const { transactionId } = body;
    if (!transactionId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Transaction ID is required"
      });
    }
    const [transactions] = await db.query(
      `SELECT id, order_id, status, payment_gateway_status
       FROM transactions 
       WHERE id = ? AND user_id = ?`,
      [transactionId, user.id]
    );
    if (transactions.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Transaction not found"
      });
    }
    const transaction = transactions[0];
    if (transaction.payment_gateway_status !== "not_found_in_gateway") {
      throw createError({
        statusCode: 400,
        statusMessage: 'Only transactions with "not found in gateway" status can be deleted'
      });
    }
    const [result] = await db.query(
      `DELETE FROM transactions WHERE id = ? AND user_id = ?`,
      [transactionId, user.id]
    );
    if (result.affectedRows === 0) {
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to delete transaction"
      });
    }
    return {
      success: true,
      message: "Transaction deleted successfully",
      data: {
        transactionId: parseInt(transactionId),
        order_id: transaction.order_id
      }
    };
  } catch (error) {
    console.error("Error deleting transaction:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete transaction"
    });
  }
});

const deleteNotFound_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: deleteNotFound_post
}, Symbol.toStringTag, { value: 'Module' }));

const getLicense_post$2 = defineEventHandler(async (event) => {
  var _a;
  try {
    const user = await requireAuth(event);
    const body = await readBody(event);
    const { transactionId } = body;
    if (!transactionId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Transaction ID is required"
      });
    }
    const [transactions] = await db.query(
      `SELECT 
        t.id, 
        t.product_id,
        t.product_name,
        t.customer_name,
        t.email,
        t.status,
        t.payment_gateway_status
      FROM transactions t
      WHERE t.id = ? AND t.user_id = ?`,
      [transactionId, user.id]
    );
    if (transactions.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Transaction not found"
      });
    }
    const transaction = transactions[0];
    const isCompleted = transaction.status === "completed" || ["settlement", "capture"].includes((_a = transaction.payment_gateway_status) == null ? void 0 : _a.toLowerCase());
    if (!isCompleted) {
      throw createError({
        statusCode: 400,
        statusMessage: "Transaction is not completed yet"
      });
    }
    console.log(`Manual license retrieval for transaction ${transactionId}`);
    const quantity = transaction.quantity || 1;
    const allLicenses = [];
    await db.query("START TRANSACTION");
    try {
      for (let i = 0; i < quantity; i++) {
        console.log(`Processing license ${i + 1}/${quantity}...`);
        const licenseResult = await processLicenseDelivery(
          transaction.id,
          transaction.product_id,
          transaction.email,
          transaction.customer_name || "Customer"
        );
        if (licenseResult.success) {
          allLicenses.push(licenseResult.license);
          console.log(`License ${i + 1} processed successfully`);
          try {
            const [licenseInfoResult] = await db.query(
              `SELECT license_info FROM transactions WHERE id = ?`,
              [transaction.id]
            );
            if (!licenseInfoResult[0].license_info) {
              const licenseArray = [licenseResult.license];
              await db.query(
                `UPDATE transactions SET license_info = ? WHERE id = ?`,
                [JSON.stringify(licenseArray), transaction.id]
              );
            } else {
              let existingLicenses = [];
              try {
                existingLicenses = JSON.parse(licenseInfoResult[0].license_info);
                if (!Array.isArray(existingLicenses)) {
                  existingLicenses = [existingLicenses];
                }
              } catch (parseError) {
                console.error(`Error parsing existing license_info:`, parseError);
                existingLicenses = [];
              }
              existingLicenses.push(licenseResult.license);
              await db.query(
                `UPDATE transactions SET license_info = ? WHERE id = ?`,
                [JSON.stringify(existingLicenses), transaction.id]
              );
            }
            console.log(`License ${i + 1} stored in transaction record`);
          } catch (licenseStoreError) {
            console.error(`Failed to store license info:`, licenseStoreError);
          }
        } else {
          throw new Error(`Failed to process license ${i + 1}: ${licenseResult.error || licenseResult.message}`);
        }
      }
      await db.query("COMMIT");
      const [updatedTransaction] = await db.query(
        `SELECT license_info FROM transactions WHERE id = ?`,
        [transaction.id]
      );
      let licenseInfo = null;
      if (updatedTransaction.length > 0 && updatedTransaction[0].license_info) {
        try {
          licenseInfo = JSON.parse(updatedTransaction[0].license_info);
        } catch (e) {
          console.error("Error parsing license_info:", e);
        }
      }
      return {
        success: true,
        message: "License retrieved successfully",
        license: licenseInfo || allLicenses
      };
    } catch (error) {
      await db.query("ROLLBACK");
      console.error("Error processing license delivery:", error);
      throw createError({
        statusCode: 500,
        statusMessage: error.message || "Failed to process license"
      });
    }
  } catch (error) {
    console.error("Error retrieving license:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to retrieve license"
    });
  }
});

const getLicense_post$3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: getLicense_post$2
}, Symbol.toStringTag, { value: 'Module' }));

const getTransactionId_post = defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { order_id } = body;
    if (!order_id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Order ID is required"
      });
    }
    const [orders] = await db.query(
      `SELECT id FROM nixty.orders WHERE order_id = ?`,
      [order_id]
    );
    if (orders.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Transaction not found"
      });
    }
    return {
      success: true,
      transaction_id: orders[0].id
    };
  } catch (error) {
    console.error("Error getting transaction ID:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to get transaction ID"
    });
  }
});

const getTransactionId_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: getTransactionId_post
}, Symbol.toStringTag, { value: 'Module' }));

const index_get$4 = defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event);
    const [orders] = await db.query(
      `SELECT 
        o.id, 
        o.order_id,
        o.user_id,
        o.product_id,
        o.quantity,
        o.total,
        o.status,
        o.created_at,
        p.name as product_name,
        p.description as product_description,
        p.price as product_price,
        p.image_url as product_image_url,
        c.name as category_name,
        c.slug as category_slug
      FROM nixty.orders o
      LEFT JOIN nixty.products p ON o.product_id = p.id
      LEFT JOIN nixty.categories c ON p.category_id = c.id
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC`,
      [user.id]
    );
    const completedOrderIds = orders.filter((o) => o.status === "completed").map((o) => o.id);
    let licenseCounts = {};
    if (completedOrderIds.length > 0) {
      const [licenseCountResult] = await db.query(
        `SELECT 
          ol.transaction_id,
          COUNT(ol.license_id) as license_count
        FROM nixty.orders_license ol
        WHERE ol.transaction_id = ANY($1)
        GROUP BY ol.transaction_id`,
        [completedOrderIds]
      );
      licenseCountResult.forEach((result) => {
        licenseCounts[result.transaction_id] = parseInt(result.license_count);
      });
    }
    const failedOrderIds = orders.filter((o) => o.status === "failed").map((o) => o.id);
    let midtransOrderIds = {};
    if (failedOrderIds.length > 0) {
      const [paymentLogs] = await db.query(
        `SELECT 
          transaction_id,
          key,
          value
        FROM nixty.payment_gateway_logs
        WHERE transaction_id = ANY($1)
        AND (key = 'order_id' OR key = 'midtrans_order_id' OR key = 'transaction_id')`,
        [failedOrderIds]
      );
      paymentLogs.forEach((log) => {
        if (!midtransOrderIds[log.transaction_id]) {
          midtransOrderIds[log.transaction_id] = log.value;
        }
      });
    }
    const transformedOrders = orders.map((order) => ({
      id: order.order_id || order.id,
      // Use custom order_id if available
      numeric_id: order.id,
      // Keep numeric ID for internal reference
      order_id: order.order_id,
      // Custom Midtrans-style order ID
      user_id: order.user_id,
      product_id: order.product_id,
      quantity: order.quantity,
      total: parseFloat(order.total),
      status: order.status,
      created_at: order.created_at,
      license_count: order.status === "completed" ? licenseCounts[order.id] || 0 : 0,
      midtrans_order_id: order.status === "failed" ? midtransOrderIds[order.id] || null : null,
      product_name: order.product_name,
      product_description: order.product_description,
      product_price: parseFloat(order.product_price || 0),
      product_image_url: order.product_image_url,
      category_name: order.category_name,
      category_slug: order.category_slug
    }));
    return {
      success: true,
      transactions: transformedOrders,
      // Keep the same response format for compatibility
      orders: transformedOrders
      // Also provide as orders for clarity
    };
  } catch (error) {
    console.error("Error fetching user orders:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch user orders"
    });
  }
});

const index_get$5 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: index_get$4
}, Symbol.toStringTag, { value: 'Module' }));

const processLicense_post = defineEventHandler(async (event) => {
  var _a;
  try {
    const user = await requireAuth(event);
    const body = await readBody(event);
    const { transactionId } = body;
    if (!transactionId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Transaction ID is required"
      });
    }
    const [transactions] = await db.query(
      `SELECT 
        t.id, 
        t.order_id, 
        t.product_id, 
        t.product_name, 
        t.quantity,
        t.status, 
        t.payment_gateway_status,
        t.customer_name,
        t.email
      FROM transactions t
      WHERE t.id = ? AND t.user_id = ?`,
      [transactionId, user.id]
    );
    if (transactions.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Transaction not found"
      });
    }
    const transaction = transactions[0];
    const isCompleted = transaction.status === "completed" || ["settlement", "capture"].includes((_a = transaction.payment_gateway_status) == null ? void 0 : _a.toLowerCase());
    if (!isCompleted) {
      throw createError({
        statusCode: 400,
        statusMessage: "Transaction is not completed"
      });
    }
    const quantity = transaction.quantity || 1;
    const licenses = [];
    let success = true;
    console.log(`Processing ${quantity} license(s) for transaction ${transactionId}`);
    const [beforeStock] = await db.query(
      `SELECT available_stock FROM product_stock_view WHERE product_id = ?`,
      [transaction.product_id]
    );
    const stockBefore = beforeStock.length > 0 ? beforeStock[0].available_stock : 0;
    console.log(`Stock before processing: ${stockBefore}`);
    await db.query("START TRANSACTION");
    try {
      for (let i = 0; i < quantity; i++) {
        const licenseResult = await processLicenseDelivery(
          transaction.id,
          transaction.product_id,
          transaction.email,
          transaction.customer_name || "Customer"
        );
        if (licenseResult.success) {
          licenses.push(licenseResult.license);
          console.log(`License ${i + 1} processed successfully`);
        } else {
          success = false;
          console.error(`Failed to process license ${i + 1}: ${licenseResult.error || licenseResult.message}`);
          break;
        }
      }
      const [afterStock] = await db.query(
        `SELECT available_stock FROM product_stock_view WHERE product_id = ?`,
        [transaction.product_id]
      );
      const stockAfter = afterStock.length > 0 ? afterStock[0].available_stock : 0;
      console.log(`Stock after processing: ${stockAfter}`);
      const expectedStockReduction = licenses.length;
      const actualStockReduction = stockBefore - stockAfter;
      if (actualStockReduction !== expectedStockReduction) {
        console.warn(`Stock reduction mismatch! Expected: ${expectedStockReduction}, Actual: ${actualStockReduction}`);
        if (actualStockReduction < expectedStockReduction) {
          console.log(`Attempting to refresh stock view...`);
          await db.query(`
            UPDATE product_licenses 
            SET updated_at = NOW() 
            WHERE product_id = ? AND status = 'used' AND used_by_transaction_id = ?
          `, [transaction.product_id, transaction.id]);
        }
      }
      if (success) {
        await db.query(
          `UPDATE transactions 
           SET license_info = ? 
           WHERE id = ?`,
          [JSON.stringify(licenses), transaction.id]
        );
        await db.query("COMMIT");
        console.log(`Licenses stored in transaction ${transactionId}`);
        let emailResult;
        try {
          let customEmail = null;
          try {
            const [customEmailLogs] = await db.query(
              "SELECT log_value FROM payment_gateway_logs WHERE transaction_id = ? AND log_key = 'custom_email' LIMIT 1",
              [transactionId]
            );
            if (customEmailLogs.length > 0 && customEmailLogs[0].log_value) {
              customEmail = customEmailLogs[0].log_value;
              console.log(`Found custom email in logs: ${customEmail}`);
            }
          } catch (logError) {
            console.error(`Error fetching custom email from logs:`, logError);
          }
          if (quantity > 1) {
            emailResult = await sendMultipleLicenseEmail(
              transaction.email,
              transaction.customer_name || "Customer",
              transaction.product_name || `Product ${transaction.product_id}`,
              licenses,
              transaction.order_id,
              customEmail !== transaction.email ? customEmail : null
            );
          } else {
            emailResult = await sendLicenseEmail(
              transaction.email,
              transaction.customer_name || "Customer",
              transaction.product_name || `Product ${transaction.product_id}`,
              licenses[0],
              transaction.order_id,
              customEmail !== transaction.email ? customEmail : null
            );
          }
          if (emailResult.success) {
            console.log(`\u2705 License email sent successfully to: ${transaction.email}${customEmail ? ` and ${customEmail}` : ""}`);
          } else {
            console.error(`\u274C Failed to send license email: ${emailResult.error || emailResult.message}`);
          }
        } catch (emailError) {
          console.error("Error sending license email:", emailError);
        }
      } else {
        await db.query("ROLLBACK");
        console.log(`License processing failed for transaction ${transactionId}, rolling back`);
      }
    } catch (error) {
      await db.query("ROLLBACK");
      console.error(`Error processing licenses: ${error.message}`);
      throw error;
    }
    return {
      success,
      message: success ? `Successfully processed ${licenses.length} license(s)` : "Failed to process licenses",
      data: {
        transaction_id: transaction.id,
        order_id: transaction.order_id,
        licenses: success ? licenses : []
      }
    };
  } catch (error) {
    console.error("Error processing license:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "An error occurred while processing license"
    });
  }
});

const processLicense_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: processLicense_post
}, Symbol.toStringTag, { value: 'Module' }));

const repay_post = defineEventHandler(async (event) => {
  var _a;
  try {
    const user = await requireAuth(event);
    const body = await readBody(event);
    const { transactionId } = body;
    if (!transactionId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Transaction ID is required"
      });
    }
    const [transactions] = await db.query(
      `SELECT 
        t.id, 
        t.order_id,
        t.product_id,
        t.product_name,
        t.customer_name,
        t.email,
        t.amount,
        t.quantity,
        t.status,
        t.payment_gateway_status
      FROM transactions t
      WHERE t.order_id = ? AND t.user_id = ?`,
      [transactionId, user.id]
    );
    if (transactions.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Transaction not found"
      });
    }
    const transaction = transactions[0];
    const validStatuses = ["pending", "expire", "cancel", "failed"];
    const isValidForRepayment = validStatuses.includes(transaction.status.toLowerCase()) || validStatuses.includes((_a = transaction.payment_gateway_status) == null ? void 0 : _a.toLowerCase());
    if (!isValidForRepayment) {
      throw createError({
        statusCode: 400,
        statusMessage: "This transaction cannot be repaid. It may be already completed or in an invalid state."
      });
    }
    if (!midtransConfig.serverKey) ;
    let snap = new midtransClient.Snap({
      isProduction: midtransConfig.isProduction,
      serverKey: midtransConfig.serverKey
    });
    const newOrderId = `${transaction.order_id}-repay-${Date.now()}`;
    const transactionDetails = {
      order_id: newOrderId,
      gross_amount: transaction.amount
    };
    const itemDetails = [
      {
        id: transaction.product_id,
        name: transaction.product_name,
        price: transaction.amount / (transaction.quantity || 1),
        quantity: transaction.quantity || 1
      }
    ];
    const customerDetails = {
      first_name: transaction.customer_name || user.name || "",
      email: transaction.email || user.email || ""
    };
    const parameter = {
      transaction_details: transactionDetails,
      item_details: itemDetails,
      customer_details: customerDetails,
      credit_card: {
        secure: true
      },
      callbacks: {
        finish: `${process.env.NUXT_PUBLIC_BASE_URL || "http://localhost:3000"}/payment/finish`,
        unfinish: `${process.env.NUXT_PUBLIC_BASE_URL || "http://localhost:3000"}/payment/unfinish`,
        error: `${process.env.NUXT_PUBLIC_BASE_URL || "http://localhost:3000"}/payment/error`
      }
    };
    const transactionToken = await snap.createTransaction(parameter);
    await db.query(
      `UPDATE transactions 
       SET payment_gateway_payload = COALESCE(payment_gateway_payload, '{}')::jsonb || 
         jsonb_build_object(
           'repayment_attempts', COALESCE((payment_gateway_payload->>'repayment_attempts')::int, 0) + 1,
           'last_repayment_time', $1,
           'last_repayment_order_id', $2
         )
       WHERE id = $3`,
      [(/* @__PURE__ */ new Date()).toISOString(), newOrderId, transaction.id]
    );
    await db.query(
      `INSERT INTO transactions (
        order_id, user_id, product_id, product_name, 
        customer_name, email, amount, quantity, status, 
        payment_gateway_payload
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newOrderId,
        user.id,
        transaction.product_id,
        transaction.product_name,
        transaction.customer_name || user.name,
        transaction.email || user.email,
        transaction.amount,
        transaction.quantity || 1,
        "pending",
        JSON.stringify({
          original_transaction_id: transaction.id,
          is_repayment: true,
          original_order_id: transaction.order_id,
          repayment_time: (/* @__PURE__ */ new Date()).toISOString()
        })
      ]
    );
    return {
      success: true,
      message: "Repayment initiated successfully",
      token: transactionToken.token,
      order_id: newOrderId,
      data: {
        client_key: midtransConfig.clientKey
      }
    };
  } catch (error) {
    console.error("Error initiating repayment:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Failed to initiate repayment"
    });
  }
});

const repay_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: repay_post
}, Symbol.toStringTag, { value: 'Module' }));

const syncAll_post = defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event);
    let body = {};
    try {
      body = await readBody(event);
    } catch (e) {
      body = {};
    }
    const isAutoSync = body && body.auto_sync === true;
    const syncLimit = isAutoSync ? 5 : 100;
    const specificTransactionIds = body && body.transactionIds || [];
    const [orders] = await db.query(
      `SELECT id, status, created_at
       FROM nixty.orders 
       WHERE user_id = ? 
       AND status IN ('pending', 'failed') 
       ORDER BY created_at DESC
       LIMIT ?`,
      [user.id, syncLimit]
    );
    if (orders.length === 0) {
      return {
        success: true,
        message: "No orders to sync",
        data: { updated: 0, total: 0 }
      };
    }
    const coreApi = new midtransClient.CoreApi({
      isProduction: midtransConfig.isProduction,
      serverKey: midtransConfig.serverKey
    });
    const mapMidtransStatus = (midtransStatus, fraudStatus = null) => {
      switch (midtransStatus) {
        case "settlement":
          return "completed";
        case "capture":
          return fraudStatus === "accept" ? "completed" : "pending";
        case "pending":
          return "pending";
        case "deny":
        case "cancel":
        case "expire":
        case "failure":
          return "failed";
        default:
          return "pending";
      }
    };
    let updatedCount = 0;
    let totalProcessed = 0;
    const results = [];
    const updated = [];
    for (const order of orders) {
      totalProcessed++;
      try {
        let order_id;
        const [existingOrderId] = await db.query(
          `SELECT value FROM nixty.payment_gateway_logs WHERE transaction_id = ? AND key = 'order_id' LIMIT 1`,
          [order.id]
        );
        if (existingOrderId.length > 0) {
          order_id = existingOrderId[0].value;
        } else {
          order_id = `ORDER_${order.id}_${Date.now()}`;
          await db.query(
            `INSERT INTO nixty.payment_gateway_logs (transaction_id, key, value) VALUES (?, ?, ?)`,
            [order.id, "order_id", order_id]
          );
        }
        console.log(`Syncing order ${order.id} with order_id: ${order_id}`);
        try {
          const midtransResponse = await coreApi.transaction.status(order_id);
          if (midtransResponse) {
            const newStatus = mapMidtransStatus(midtransResponse.transaction_status, midtransResponse.fraud_status);
            if (newStatus !== order.status) {
              const [result] = await db.query(
                `UPDATE nixty.orders SET status = ? WHERE id = ? AND user_id = ?`,
                [newStatus, order.id, user.id]
              );
              if (result.affectedRows > 0) {
                const gatewayLogs = [
                  ["payment_method", midtransResponse.payment_type || null],
                  ["payment_gateway_status", midtransResponse.transaction_status],
                  ["payment_gateway_payload", JSON.stringify(midtransResponse)]
                ];
                for (const [key, value] of gatewayLogs) {
                  const [updateResult] = await db.query(
                    `UPDATE nixty.payment_gateway_logs SET value = ? WHERE transaction_id = ? AND key = ?`,
                    [value, order.id, key]
                  );
                  if (updateResult.affectedRows === 0) {
                    await db.query(
                      `INSERT INTO nixty.payment_gateway_logs (transaction_id, key, value) VALUES (?, ?, ?)`,
                      [order.id, key, value]
                    );
                  }
                }
                updatedCount++;
                updated.push(order.id);
                results.push({
                  id: order.id,
                  order_id,
                  old_status: order.status,
                  new_status: newStatus,
                  gateway_status: midtransResponse.transaction_status
                });
                if (newStatus === "completed" && order.status !== "completed") {
                  await processLicensesIfNeeded(order.id);
                }
              }
            }
          }
        } catch (midtransError) {
          if (midtransError.httpStatusCode === 404 || midtransError.message && midtransError.message.includes("404") && midtransError.message.includes("doesn't exist")) {
            console.log(`Order ${order.id} (${order_id}) not found in Midtrans - marking as failed`);
            const [updateResult] = await db.query(
              `UPDATE nixty.orders SET status = 'failed' WHERE id = ? AND user_id = ?`,
              [order.id, user.id]
            );
            if (updateResult.affectedRows > 0) {
              const [logUpdateResult] = await db.query(
                `UPDATE nixty.payment_gateway_logs SET value = ? WHERE transaction_id = ? AND key = ?`,
                ["not_found_in_gateway", order.id, "payment_gateway_status"]
              );
              if (logUpdateResult.affectedRows === 0) {
                await db.query(
                  `INSERT INTO nixty.payment_gateway_logs (transaction_id, key, value) VALUES (?, ?, ?)`,
                  [order.id, "payment_gateway_status", "not_found_in_gateway"]
                );
              }
              results.push({
                id: order.id,
                order_id,
                status: "failed",
                message: "Order not found in Midtrans - marked as failed"
              });
            }
            continue;
          }
          throw midtransError;
        }
      } catch (error) {
        console.log(`Failed to sync order ${order.id}:`, error.message);
        results.push({
          id: order.id,
          error: error.message
        });
      }
      await new Promise((resolve) => setTimeout(resolve, isAutoSync ? 50 : 100));
    }
    return {
      success: true,
      message: `Successfully synced ${updatedCount} out of ${totalProcessed} orders`,
      updated,
      data: {
        updated: updatedCount,
        total: totalProcessed,
        auto_sync: isAutoSync,
        results
      }
    };
  } catch (error) {
    console.error("Error syncing orders:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to sync orders with Midtrans"
    });
  }
});
async function processLicensesIfNeeded(orderId) {
  try {
    const [existingLicenses] = await db.query(
      `SELECT COUNT(*) as count FROM nixty.orders_license WHERE transaction_id = ?`,
      [orderId]
    );
    if (existingLicenses[0].count === 0) {
      console.log(`Order ${orderId} completed but has no licenses. Processing now...`);
      const [orderDetails] = await db.query(
        `SELECT product_id, quantity FROM nixty.orders WHERE id = ?`,
        [orderId]
      );
      if (orderDetails.length === 0) {
        console.log(`Order ${orderId} not found`);
        return false;
      }
      const order = orderDetails[0];
      const quantity = order.quantity || 1;
      for (let i = 0; i < quantity; i++) {
        const [availableLicense] = await db.query(
          `SELECT id FROM nixty.product_license_base 
           WHERE product_id = ? AND status = 'available' 
           LIMIT 1`,
          [order.product_id]
        );
        if (availableLicense.length > 0) {
          await db.query(
            `UPDATE nixty.product_license_base SET status = 'used' WHERE id = ?`,
            [availableLicense[0].id]
          );
          await db.query(
            `INSERT INTO nixty.orders_license (transaction_id, license_id) VALUES (?, ?)`,
            [orderId, availableLicense[0].id]
          );
          console.log(`Successfully assigned license ${availableLicense[0].id} to order ${orderId}`);
        } else {
          console.error(`No available licenses found for product ${order.product_id}`);
          break;
        }
      }
    } else {
      console.log(`Order ${orderId} already has ${existingLicenses[0].count} license(s)`);
    }
    return true;
  } catch (error) {
    console.error(`Error processing licenses for order ${orderId}:`, error);
    return false;
  }
}

const syncAll_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: syncAll_post
}, Symbol.toStringTag, { value: 'Module' }));

const updateStatus_post = defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event);
    const body = await readBody(event);
    const { order_id } = body;
    if (!order_id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Order ID is required"
      });
    }
    const coreApi = new midtransClient.CoreApi({
      isProduction: midtransConfig.isProduction,
      serverKey: midtransConfig.serverKey
    });
    let midtransResponse;
    try {
      midtransResponse = await coreApi.transaction.status(order_id);
    } catch (midtransError) {
      console.log("Midtrans API Error:", midtransError.message);
      if (midtransError.message && (midtransError.message.includes("404") || midtransError.message.includes("not found"))) {
        const [orderResults2] = await db.query(
          `SELECT id FROM nixty.orders WHERE order_id = ?`,
          [order_id]
        );
        if (orderResults2.length === 0) {
          throw createError({
            statusCode: 404,
            statusMessage: "Transaction not found"
          });
        }
        const transactionId2 = orderResults2[0].id;
        const [userCheck] = await db.query(
          `SELECT id FROM nixty.orders WHERE id = ? AND user_id = ?`,
          [transactionId2, user.id]
        );
        if (userCheck.length === 0) {
          throw createError({
            statusCode: 404,
            statusMessage: "Transaction not found or not owned by user"
          });
        }
        const [updateResult] = await db.query(
          `UPDATE nixty.payment_gateway_logs SET value = ? WHERE transaction_id = ? AND key = ?`,
          ["not_found_in_gateway", transactionId2, "payment_gateway_status"]
        );
        if (updateResult.affectedRows === 0) {
          await db.query(
            `INSERT INTO nixty.payment_gateway_logs (transaction_id, key, value) VALUES (?, ?, ?)`,
            [transactionId2, "payment_gateway_status", "not_found_in_gateway"]
          );
        }
        const [updatedTransaction2] = await db.query(
          `SELECT 
            o.id, 
            o.product_id, 
            o.quantity, 
            o.total, 
            o.status, 
            o.created_at,
            p.name as product_name
          FROM nixty.orders o
          LEFT JOIN nixty.products p ON o.product_id = p.id
          WHERE o.id = ?`,
          [transactionId2]
        );
        const [gatewayLogs2] = await db.query(
          `SELECT key, value FROM nixty.payment_gateway_logs WHERE transaction_id = ?`,
          [transactionId2]
        );
        const gatewayData2 = {};
        gatewayLogs2.forEach((log) => {
          gatewayData2[log.key] = log.value;
        });
        return {
          success: true,
          message: "Transaction marked as not found in gateway",
          data: {
            transaction: {
              ...updatedTransaction2[0],
              ...gatewayData2
            },
            midtrans_response: null,
            not_found_in_gateway: true
          }
        };
      }
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to check transaction status with Midtrans"
      });
    }
    if (!midtransResponse) {
      throw createError({
        statusCode: 404,
        statusMessage: "Transaction not found in Midtrans"
      });
    }
    const mapMidtransStatus = (midtransStatus, fraudStatus = null) => {
      switch (midtransStatus) {
        case "settlement":
          return "completed";
        case "capture":
          return fraudStatus === "accept" ? "completed" : "pending";
        case "pending":
          return "pending";
        case "deny":
        case "cancel":
        case "expire":
        case "failure":
          return "failed";
        default:
          return "pending";
      }
    };
    const newStatus = mapMidtransStatus(midtransResponse.transaction_status, midtransResponse.fraud_status);
    const [orderResults] = await db.query(
      `SELECT id FROM nixty.orders WHERE order_id = ?`,
      [order_id]
    );
    if (orderResults.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Transaction not found"
      });
    }
    const transactionId = orderResults[0].id;
    const [result] = await db.query(
      `UPDATE nixty.orders SET status = ? WHERE id = ? AND user_id = ?`,
      [newStatus, transactionId, user.id]
    );
    if (result.affectedRows === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Transaction not found or not owned by user"
      });
    }
    const gatewayLogs = [
      ["payment_method", midtransResponse.payment_type || null],
      ["payment_gateway_status", midtransResponse.transaction_status],
      ["payment_gateway_payload", JSON.stringify(midtransResponse)]
    ];
    for (const [key, value] of gatewayLogs) {
      const [updateResult] = await db.query(
        `UPDATE nixty.payment_gateway_logs SET value = ? WHERE transaction_id = ? AND key = ?`,
        [value, transactionId, key]
      );
      if (updateResult.affectedRows === 0) {
        await db.query(
          `INSERT INTO nixty.payment_gateway_logs (transaction_id, key, value) VALUES (?, ?, ?)`,
          [transactionId, key, value]
        );
      }
    }
    const [updatedTransaction] = await db.query(
      `SELECT 
        o.id, 
        o.product_id, 
        o.quantity, 
        o.total, 
        o.status, 
        o.created_at,
        p.name as product_name
      FROM nixty.orders o
      LEFT JOIN nixty.products p ON o.product_id = p.id
      WHERE o.id = ?`,
      [transactionId]
    );
    const [allGatewayLogs] = await db.query(
      `SELECT key, value FROM nixty.payment_gateway_logs WHERE transaction_id = ?`,
      [transactionId]
    );
    const gatewayData = {};
    allGatewayLogs.forEach((log) => {
      gatewayData[log.key] = log.value;
    });
    return {
      success: true,
      message: "Transaction status updated successfully",
      data: {
        transaction: {
          ...updatedTransaction[0],
          ...gatewayData
        },
        midtrans_response: midtransResponse
      }
    };
  } catch (error) {
    console.error("Error updating transaction status:", error);
    if (error.statusCode) {
      throw error;
    }
    if (error.message && error.message.includes("404")) {
      throw createError({
        statusCode: 404,
        statusMessage: "Transaction not found in Midtrans"
      });
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update transaction status"
    });
  }
});

const updateStatus_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: updateStatus_post
}, Symbol.toStringTag, { value: 'Module' }));

const autoProcessLicense_post = defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { order_id, transaction_status } = body;
    if (!order_id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Order ID is required"
      });
    }
    console.log(`Auto-processing license for order: ${order_id}, status: ${transaction_status}`);
    if (transaction_status !== "settlement" && transaction_status !== "capture") {
      return {
        success: false,
        message: "Payment not completed, license processing skipped",
        order_id
      };
    }
    const [orderResults] = await db.execute(
      "SELECT id FROM nixty.orders WHERE order_id = ?",
      [order_id]
    );
    if (orderResults.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Transaction not found"
      });
    }
    const transactionId = orderResults[0].id;
    const [orders] = await db.execute(
      `SELECT o.*, u.email as user_email, u.name as user_name, p.name as product_name
       FROM nixty.orders o
       LEFT JOIN nixty.users u ON o.user_id = u.id
       LEFT JOIN nixty.products p ON o.product_id = p.id
       WHERE o.id = ?`,
      [transactionId]
    );
    if (orders.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Order not found"
      });
    }
    const transaction = orders[0];
    const [existingLicenses] = await db.execute(
      "SELECT COUNT(*) as count FROM nixty.orders_license WHERE transaction_id = ?",
      [transactionId]
    );
    if (existingLicenses[0].count > 0) {
      console.log(`License already processed for order ${order_id}`);
      return {
        success: true,
        message: "License already processed",
        order_id,
        licenses_count: existingLicenses[0].count,
        already_processed: true
      };
    }
    if (transaction.status !== "completed") {
      await db.execute(
        `UPDATE nixty.orders SET status = 'completed' WHERE id = ?`,
        [transactionId]
      );
      console.log(`Order status updated to completed for order ${order_id}`);
    }
    const quantity = transaction.quantity || 1;
    const allLicenses = [];
    let licensesProcessed = 0;
    console.log(`Processing ${quantity} license(s) for order ${order_id}`);
    const [stockCheck] = await db.execute(
      `SELECT 
        COUNT(*) as total_licenses,
        SUM(CASE 
          WHEN status = 'available' AND (COALESCE(send_license, 0) < max_usage)
          THEN (max_usage - COALESCE(send_license, 0))
          ELSE 0 
        END) as available_stock
      FROM nixty.product_license_base 
      WHERE product_id = ?`,
      [transaction.product_id]
    );
    const availableStock = stockCheck.length > 0 ? parseInt(stockCheck[0].available_stock || 0) : 0;
    console.log(`Available stock: ${availableStock} for product ${transaction.product_id}`);
    if (availableStock < quantity) {
      throw new Error(`Insufficient stock. Required: ${quantity}, Available: ${availableStock}`);
    }
    try {
      await db.execute("START TRANSACTION");
      console.log(`\u{1F510} Database transaction started for order ${order_id}`);
      const [availableLicenses] = await db.execute(
        `SELECT id FROM nixty.product_license_base 
         WHERE product_id = ? AND status = 'available' 
         ORDER BY id ASC 
         LIMIT ?`,
        [transaction.product_id, quantity]
      );
      if (availableLicenses.length < quantity) {
        console.error(`\u274C Not enough available licenses for order ${order_id}`);
        await db.execute("ROLLBACK");
        throw new Error(`Not enough available licenses. Required: ${quantity}, Found: ${availableLicenses.length}`);
      }
      console.log(`\u{1F3AF} Selected ${availableLicenses.length} licenses: ${availableLicenses.map((l) => l.id).join(", ")}`);
      for (let i = 0; i < quantity; i++) {
        const licenseId = availableLicenses[i].id;
        console.log(`Processing license ${i + 1}/${quantity} (ID: ${licenseId}) for order ${order_id}`);
        await db.execute(
          `UPDATE nixty.product_license_base SET status = 'used' WHERE id = ?`,
          [licenseId]
        );
        await db.execute(
          `INSERT INTO nixty.orders_license (transaction_id, license_id) VALUES (?, ?)`,
          [transactionId, licenseId]
        );
        const [licenseDetails] = await db.execute(
          `SELECT plb.*, plk.product_key, pla.email, pla.password 
           FROM nixty.product_license_base plb
           LEFT JOIN nixty.product_license_keys plk ON plb.id = plk.id
           LEFT JOIN nixty.product_license_accounts pla ON plb.id = pla.id
           WHERE plb.id = ?`,
          [licenseId]
        );
        if (licenseDetails.length > 0) {
          allLicenses.push(licenseDetails[0]);
          console.log(`\u2705 License ${i + 1} (ID: ${licenseId}) processed successfully for order ${order_id}`);
        } else {
          console.error(`\u274C License details not found for license ID ${licenseId}`);
          await db.execute("ROLLBACK");
          throw new Error(`License details not found for license ID ${licenseId}`);
        }
        licensesProcessed++;
      }
      await db.execute("COMMIT");
      console.log(`\u2705 Database transaction committed for order ${order_id}`);
    } catch (transactionError) {
      console.error(`\u274C License processing transaction failed for order ${order_id}:`, transactionError);
      try {
        await db.execute("ROLLBACK");
        console.log(`\u{1F519} Transaction rolled back for order ${order_id}`);
      } catch (rollbackError) {
        console.error(`\u274C Rollback failed:`, rollbackError);
      }
      throw transactionError;
    }
    if (allLicenses.length > 0) {
      const licenseIds = allLicenses.map((license) => license.id);
      const uniqueLicenseIds = [...new Set(licenseIds)];
      if (licenseIds.length !== uniqueLicenseIds.length) {
        console.error(`\u274C Duplicate licenses detected! Total: ${licenseIds.length}, Unique: ${uniqueLicenseIds.length}`);
        throw new Error("Duplicate licenses were assigned. Please contact support.");
      }
      console.log(`\u2705 ${allLicenses.length} unique license(s) linked to order ${transactionId} for order ${order_id}`);
      allLicenses.forEach((license, index) => {
        console.log(`  License ${index + 1}: ID=${license.id}, Type=${license.license_type}, Key=${license.product_key ? license.product_key.substring(0, 8) + "***" : "N/A"}`);
      });
      const emailLicenses = allLicenses.map((license) => ({
        license_id: license.id,
        license_type: license.license_type,
        product_key: license.product_key,
        email: license.email,
        password: license.password,
        additional_info: license.additional_info || "",
        notes: license.notes || "",
        send_license: 1,
        max_usage: license.max_usage || 1
      }));
      const userEmail = transaction.user_email;
      const customerName = transaction.user_name || "Customer";
      const productName = transaction.product_name || `Product ${transaction.product_id}`;
      let finalEmail = userEmail;
      try {
        const [customEmailLogs] = await db.execute(
          "SELECT value FROM nixty.payment_gateway_logs WHERE transaction_id = ? AND key = 'custom_email' LIMIT 1",
          [transactionId]
        );
        if (customEmailLogs.length > 0 && customEmailLogs[0].value) {
          finalEmail = customEmailLogs[0].value;
          console.log(`Using custom email instead of user email: ${finalEmail}`);
        } else {
          console.log(`No custom email found, using user email: ${finalEmail}`);
        }
      } catch (logError) {
        console.error(`Error fetching custom email from logs:`, logError);
        console.log(`Fallback to user email: ${finalEmail}`);
      }
      if (!finalEmail || finalEmail.trim() === "") {
        console.error(`\u274C No valid email found for order ${order_id}`);
        throw new Error("No valid email address found for license delivery");
      }
      try {
        console.log(`\u{1F4E7} Attempting to send email to: ${finalEmail}`);
        console.log(`\u{1F4E7} Email details - Customer: ${customerName}, Product: ${productName}, Order: ${order_id}`);
        console.log(`\u{1F4E7} Number of licenses to send: ${emailLicenses.length}`);
        let emailResult;
        if (emailLicenses.length > 1) {
          console.log(`\u{1F4E7} Sending multiple licenses email...`);
          emailResult = await sendMultipleLicenseEmail(
            finalEmail,
            // Use single final email
            customerName,
            productName,
            emailLicenses,
            order_id,
            null
            // No CC email, send to one recipient only
          );
        } else {
          console.log(`\u{1F4E7} Sending single license email...`);
          emailResult = await sendLicenseEmail(
            finalEmail,
            // Use single final email
            customerName,
            productName,
            emailLicenses[0],
            order_id,
            null
            // No CC email, send to one recipient only
          );
        }
        if (emailResult.success) {
          console.log(`\u2705 License email sent successfully to: ${finalEmail}`);
          console.log(`\u2709\uFE0F Email Message ID: ${emailResult.messageId}`);
          try {
            await db.execute(
              `INSERT INTO nixty.email_logs (order_id, recipients, status, sent_at) 
               VALUES (?, ?, 'success', NOW())`,
              [order_id, finalEmail]
            );
          } catch (emailLogError) {
            console.warn(`Note: Could not log email in database - table might not exist: ${emailLogError.message}`);
          }
        } else {
          console.error(`\u274C Failed to send license email: ${emailResult.error || emailResult.message}`);
          try {
            await db.execute(
              `INSERT INTO nixty.email_logs (order_id, recipients, status, error_message, sent_at) 
               VALUES (?, ?, 'failed', ?, NOW())`,
              [order_id, finalEmail, emailResult.error || emailResult.message]
            );
          } catch (emailLogError) {
            console.warn(`Note: Could not log email failure in database - table might not exist: ${emailLogError.message}`);
          }
        }
      } catch (emailError) {
        console.error("Error sending license email:", emailError);
        console.error("Error details:", {
          code: emailError.code,
          message: emailError.message,
          command: emailError.command
        });
      }
    }
    const [finalStock] = await db.execute(
      `SELECT 
        COUNT(*) as total_licenses,
        SUM(CASE 
          WHEN status = 'available' AND (COALESCE(send_license, 0) < max_usage)
          THEN (max_usage - COALESCE(send_license, 0))
          ELSE 0 
        END) as available_stock
      FROM nixty.product_license_base 
      WHERE product_id = ?`,
      [transaction.product_id]
    );
    const finalAvailableStock = finalStock.length > 0 ? parseInt(finalStock[0].available_stock || 0) : 0;
    console.log(`Final available stock: ${finalAvailableStock} for product ${transaction.product_id}`);
    return {
      success: true,
      message: `Successfully processed ${licensesProcessed} license(s)`,
      order_id,
      transaction_id: transaction.id,
      licenses_processed: licensesProcessed,
      total_quantity: quantity,
      stock_before: availableStock,
      stock_after: finalAvailableStock,
      licenses: allLicenses.map((license) => ({
        license_type: license.license_type,
        product_key: license.product_key ? "***" + license.product_key.slice(-4) : null,
        email: license.email || null,
        additional_info: license.additional_info || null
      }))
    };
  } catch (error) {
    console.error("Auto license processing error:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "Failed to process license automatically"
    });
  }
});

const autoProcessLicense_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: autoProcessLicense_post
}, Symbol.toStringTag, { value: 'Module' }));

const products_get = defineEventHandler(async (event) => {
  var _a;
  try {
    console.log("Fetching all products from nixty schema...");
    const query = getQuery$1(event);
    const limit = query.limit ? parseInt(query.limit) : 50;
    const page = query.page ? parseInt(query.page) : 1;
    const offset = (page - 1) * limit;
    const productsQuery = `
      SELECT 
        p.id, 
        p.name, 
        p.price, 
        p.image_url, 
        p.description, 
        p.status,
        p.category_id,
        c.name as category_name, 
        c.slug as category_slug
      FROM nixty.products p
      LEFT JOIN nixty.categories c ON p.category_id = c.id
      WHERE p.status = 'active'
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const countQuery = `
      SELECT COUNT(*) as total
      FROM nixty.products
      WHERE status = 'active'
    `;
    const [productsResult, countResultArray] = await Promise.all([
      db.query(productsQuery, [limit, offset]),
      db.query(countQuery)
    ]);
    const products = productsResult[0] || [];
    const countResult = countResultArray[0] || [];
    console.log(`Found ${products.length} products`);
    const formattedProducts = products.map((p) => {
      var _a2;
      return {
        id: p.id,
        name: p.name,
        price: parseFloat(p.price),
        image_url: p.image_url || "/placeholder-product.png",
        description: p.description,
        category_name: p.category_name,
        category_slug: p.category_slug,
        status: p.status,
        // Generate slug from name for compatibility
        slug: ((_a2 = p.name) == null ? void 0 : _a2.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")) || `product-${p.id}`,
        category: {
          id: p.category_id,
          name: p.category_name,
          slug: p.category_slug
        }
      };
    });
    const total = ((_a = countResult[0]) == null ? void 0 : _a.total) || 0;
    const totalPages = Math.ceil(total / limit);
    return {
      products: formattedProducts,
      pagination: {
        total,
        per_page: limit,
        current_page: page,
        total_pages: totalPages
      }
    };
  } catch (error) {
    console.error("Error fetching products:", error.message);
    return {
      products: [],
      pagination: {
        total: 0,
        per_page: 50,
        current_page: 1,
        total_pages: 0
      },
      error: error.message
    };
  }
});

const products_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: products_get
}, Symbol.toStringTag, { value: 'Module' }));

async function fetchProductData(slug) {
  const productFamilyQuery = db.query(`
    SELECT
      p.id, p.name, p.version, p.slug, p.description, p.short_description, 
      p.price, p.discount_price, p.image_url, p.is_featured, p.is_trending,
      p.tags, p.is_multi_license, p.created_at,
      c.slug as category_slug, c.name as category_name
    FROM nixty.products p
    LEFT JOIN nixty.categories c ON p.category_id = c.id
    WHERE p.slug = $1 AND p.status = 'active'
    ORDER BY p.version DESC
  `, [slug]);
  const [[productFamily]] = await Promise.all([productFamilyQuery]);
  if (!productFamily || productFamily.length === 0) {
    return { product: null, relatedProducts: [] };
  }
  const mainProduct = productFamily[0];
  const categorySlug = mainProduct.category_slug;
  const relatedProductsQuery = db.query(`
    SELECT 
      p.id, p.name, p.slug, p.price, p.discount_price, p.image_url,
      c.slug as category_slug
    FROM nixty.products p
    LEFT JOIN nixty.categories c ON p.category_id = c.id
    WHERE p.category_id = (SELECT id FROM nixty.categories WHERE slug = $1)
      AND p.slug != $2
      AND p.status = 'active'
    ORDER BY p.created_at DESC
    LIMIT 4
  `, [categorySlug, slug]);
  const [[relatedProducts]] = await Promise.all([relatedProductsQuery]);
  const processProduct = (p) => {
    const originalPrice = parseFloat(p.price) || 0;
    const discountPrice = parseFloat(p.discount_price) || 0;
    let discountPercentage = 0;
    if (discountPrice > 0 && originalPrice > 0) {
      discountPercentage = Math.round((originalPrice - discountPrice) / originalPrice * 100);
    }
    return {
      ...p,
      discount_percentage: discountPercentage,
      is_new: p.created_at && new Date(p.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3)
    };
  };
  return {
    product: processProduct(mainProduct),
    versions: productFamily.map(processProduct),
    relatedProducts: relatedProducts.map(processProduct)
  };
}
const _slug__get$2 = defineEventHandler(async (event) => {
  const { slug } = event.context.params;
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: "Missing product slug" });
  }
  try {
    const data = await useCache(`product_${slug}`, () => fetchProductData(slug));
    if (!data.product) {
      throw createError({ statusCode: 404, statusMessage: "Product not found" });
    }
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error(`Error fetching product data for slug ${slug}:`, error);
    throw error;
  }
});

const _slug__get$3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: _slug__get$2
}, Symbol.toStringTag, { value: 'Module' }));

const checkout_get = defineEventHandler(async (event) => {
  var _a, _b;
  const query = getQuery$1(event);
  const productSlug = query.slug;
  const productId = query.productId;
  console.log("API Checkout: Received params:", { slug: productSlug, productId });
  if (!productSlug && !productId) {
    throw createError({
      statusCode: 400,
      message: "Product slug or ID is required"
    });
  }
  try {
    console.log("API Checkout: Building query with params:", { productSlug, productId });
    let productsQuery, queryParams;
    if (productSlug) {
      productsQuery = `
        SELECT 
          p.*, 
          c.name as category_name, 
          c.slug as category_slug 
        FROM nixty.products p
        LEFT JOIN nixty.categories c ON p.category_id = c.id
        WHERE c.slug = $1
        ORDER BY p.created_at DESC
      `;
      queryParams = [productSlug];
    } else {
      productsQuery = `
        SELECT 
          p.*, 
          c.name as category_name, 
          c.slug as category_slug 
        FROM nixty.products p
        LEFT JOIN nixty.categories c ON p.category_id = c.id
        WHERE p.id = $1
        ORDER BY p.created_at DESC
      `;
      queryParams = [productId];
    }
    console.log("API Checkout: Executing query:", productsQuery);
    console.log("API Checkout: Query params:", queryParams);
    const [products] = await db.query(productsQuery, queryParams);
    if (!products || products.length === 0) {
      console.warn("API Checkout: Product not found for:", productSlug ? `slug: ${productSlug}` : `ID: ${productId}`);
      throw createError({
        statusCode: 404,
        message: "Product not found"
      });
    }
    if (productId) {
      const targetVersionIndex = products.findIndex((p) => p.id.toString() === productId.toString());
      if (targetVersionIndex > 0) {
        const targetVersion = products.splice(targetVersionIndex, 1)[0];
        products.unshift(targetVersion);
      }
    }
    const mainProduct = products[0];
    console.log("API Checkout: Found main product:", mainProduct.name, "ID:", mainProduct.id);
    const versions = [];
    for (let p of products) {
      console.log("API Checkout: Fetching stock for product ID:", p.id);
      const [stockInfo] = await db.query(`
        SELECT 
          COUNT(*) as total_licenses,
          SUM(CASE 
            WHEN status = 'available' AND (COALESCE(send_license, 0) < max_usage)
            THEN (max_usage - COALESCE(send_license, 0))
            ELSE 0 
          END) as available_stock
        FROM nixty.product_license_base 
        WHERE product_id = $1
      `, [p.id]);
      const originalPrice2 = parseFloat(p.price) || 0;
      const discountPrice2 = parseFloat(p.discount_price) || 0;
      let discountPercentage2 = 0;
      if (discountPrice2 > 0 && originalPrice2 > 0) {
        discountPercentage2 = Math.round((originalPrice2 - discountPrice2) / originalPrice2 * 100);
      }
      versions.push({
        id: p.id.toString(),
        name: p.version ? `${p.name} ${p.version}` : p.name,
        version: p.version,
        slug: p.category_slug,
        // Use category slug
        description: p.description,
        // Add description for each version
        price: originalPrice2,
        discount_price: discountPrice2 > 0 ? discountPrice2 : null,
        discount_percentage: discountPercentage2,
        final_price: discountPrice2 > 0 ? discountPrice2 : originalPrice2,
        image_url: p.image_url || "/placeholder-product.png",
        available_stock: parseInt(((_a = stockInfo[0]) == null ? void 0 : _a.available_stock) || 0),
        total_licenses: parseInt(((_b = stockInfo[0]) == null ? void 0 : _b.total_licenses) || 0),
        is_subscription: Boolean(p.is_subscription),
        is_multi_license: Boolean(p.is_multi_license)
      });
    }
    const originalPrice = parseFloat(mainProduct.price) || 0;
    const discountPrice = parseFloat(mainProduct.discount_price) || 0;
    let discountPercentage = 0;
    if (discountPrice > 0 && originalPrice > 0) {
      discountPercentage = Math.round((originalPrice - discountPrice) / originalPrice * 100);
    }
    const product = {
      id: mainProduct.id,
      name: mainProduct.name,
      version: mainProduct.version,
      slug: mainProduct.category_slug,
      // Use category slug instead of product slug
      description: mainProduct.description,
      price: originalPrice,
      discount_price: discountPrice > 0 ? discountPrice : null,
      discount_percentage: discountPercentage,
      final_price: discountPrice > 0 ? discountPrice : originalPrice,
      image_url: mainProduct.image_url || "/placeholder-product.png",
      is_subscription: Boolean(mainProduct.is_subscription),
      is_multi_license: Boolean(mainProduct.is_multi_license),
      category: {
        name: mainProduct.category_name,
        slug: mainProduct.category_slug
      },
      versions
    };
    console.log("API Checkout: Returning product data with", versions.length, "versions");
    return { product };
  } catch (error) {
    console.error("API Checkout: Error fetching product:", error);
    if (!error.statusCode) {
      throw createError({
        statusCode: 500,
        message: "An internal server error occurred."
      });
    }
    throw error;
  }
});

const checkout_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: checkout_get
}, Symbol.toStringTag, { value: 'Module' }));

const detail = defineEventHandler(async (event) => {
  const query = getQuery$1(event);
  const productId = query.id;
  console.log("API Detail: Received product ID:", productId);
  if (!productId) {
    throw createError({
      statusCode: 400,
      message: "Product ID is required"
    });
  }
  try {
    const productQuery = `
      SELECT 
        p.*, 
        c.name as category_name, 
        c.slug as category_slug 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `;
    const [products] = await db.query(productQuery, [productId]);
    if (!products || products.length === 0) {
      console.warn("API Detail: Product not found for ID:", productId);
      throw createError({
        statusCode: 404,
        message: "Product not found"
      });
    }
    const mainProduct = products[0];
    console.log("API Detail: Found product:", mainProduct.name, "ID:", mainProduct.id);
    const versionsQuery = `
      SELECT 
        p.id, p.name, p.version, p.slug, p.price, p.image_url
      FROM products p
      WHERE p.name = ? AND p.category_id = ?
      ORDER BY p.version DESC
    `;
    const [versions] = await db.query(versionsQuery, [mainProduct.name, mainProduct.category_id]);
    console.log("API Detail: Found", versions.length, "versions for product");
    const product = {
      id: mainProduct.id,
      name: mainProduct.name,
      version: mainProduct.version,
      slug: mainProduct.slug,
      description: mainProduct.description,
      price: parseFloat(mainProduct.price),
      image_url: mainProduct.image_url || "/placeholder-product.png",
      category: {
        name: mainProduct.category_name,
        slug: mainProduct.category_slug
      }
    };
    const formattedVersions = versions.map((v) => ({
      id: v.id.toString(),
      name: v.name,
      version: v.version,
      slug: v.slug,
      price: parseFloat(v.price),
      image_url: v.image_url || "/placeholder-product.png"
    }));
    console.log("API Detail: Returning product data with", formattedVersions.length, "versions");
    return {
      product,
      versions: formattedVersions
    };
  } catch (error) {
    console.error("API Detail: Error fetching product by ID:", error);
    if (!error.statusCode) {
      throw createError({
        statusCode: 500,
        message: "An internal server error occurred."
      });
    }
    throw error;
  }
});

const detail$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: detail
}, Symbol.toStringTag, { value: 'Module' }));

const details_get = defineEventHandler(async (event) => {
  try {
    const query = getQuery$1(event);
    console.log("API received query:", query);
    const productId = query.productId;
    const slug = query.slug;
    console.log("Extracted productId:", productId, "Extracted slug:", slug);
    if (!productId && !slug) {
      throw createError({
        statusCode: 400,
        statusMessage: "Product ID or slug is required"
      });
    }
    let productQuery = `
      SELECT 
        p.id, p.name, p.version, p.slug, p.description, p.short_description, p.price,
        p.currency, p.discount_price, p.image_url, p.is_featured, p.is_trending, 
        p.tags, p.is_multi_license, p.is_subscription, p.is_digital_download, p.status,
        p.created_at, p.updated_at,
        c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
    `;
    let params = [];
    if (productId) {
      productQuery += ` WHERE p.id = ?`;
      params.push(productId);
    } else if (slug) {
      productQuery += ` WHERE p.slug = ?`;
      params.push(slug);
    }
    console.log("Executing product query:", productQuery);
    console.log("With parameters:", params);
    const [products] = await db.query(productQuery, params);
    if (products.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Product not found"
      });
    }
    const product = products[0];
    if (product.discount_price && product.price) {
      const originalPrice = parseFloat(product.price);
      const discountPrice = parseFloat(product.discount_price);
      if (discountPrice > 0 && originalPrice > 0) {
        product.discount_percentage = Math.round((originalPrice - discountPrice) / originalPrice * 100);
      } else {
        product.discount_percentage = 0;
      }
    } else {
      product.discount_percentage = 0;
    }
    if (product.created_at) {
      const productDate = new Date(product.created_at);
      const thirtyDaysAgo = /* @__PURE__ */ new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      product.is_new = productDate > thirtyDaysAgo;
    } else {
      product.is_new = false;
    }
    let period = null;
    if (product.is_subscription) {
      if (product.name.toLowerCase().includes("monthly") || product.version && product.version.toLowerCase().includes("monthly")) {
        period = "/month";
      } else if (product.name.toLowerCase().includes("annual") || product.name.toLowerCase().includes("yearly") || product.version && (product.version.toLowerCase().includes("annual") || product.version.toLowerCase().includes("yearly"))) {
        period = "/year";
      } else {
        period = "/year";
      }
    }
    product.period = period;
    const [versions] = await db.query(
      `SELECT id, name, version, price, discount_price, image_url, is_subscription FROM products WHERE name = ? ORDER BY version DESC`,
      [product.name]
    );
    const processedVersions = versions.map((version) => {
      const originalPrice = parseFloat(version.price) || 0;
      const discountPrice = parseFloat(version.discount_price) || 0;
      let discountPercentage = 0;
      if (discountPrice > 0 && originalPrice > 0) {
        discountPercentage = Math.round((originalPrice - discountPrice) / originalPrice * 100);
      }
      let period2 = null;
      if (version.is_subscription) {
        if (version.name.toLowerCase().includes("monthly") || version.version.toLowerCase().includes("monthly")) {
          period2 = "/month";
        } else if (version.name.toLowerCase().includes("annual") || version.name.toLowerCase().includes("yearly") || version.version.toLowerCase().includes("annual") || version.version.toLowerCase().includes("yearly")) {
          period2 = "/year";
        } else {
          period2 = "/year";
        }
      }
      return {
        ...version,
        discount_percentage: discountPercentage,
        period: period2
      };
    });
    return {
      success: true,
      product,
      versions: processedVersions
    };
  } catch (error) {
    console.error("Error fetching product details:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Failed to fetch product details"
    });
  }
});

const details_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: details_get
}, Symbol.toStringTag, { value: 'Module' }));

const _slug__get = defineEventHandler(async (event) => {
  var _a;
  const slug = (_a = event.context.params) == null ? void 0 : _a.slug;
  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: "Product group slug is required"
    });
  }
  try {
    const [[baseProduct]] = await db.query(
      "SELECT name FROM products WHERE slug = ? LIMIT 1",
      [slug]
    );
    if (!baseProduct) {
      throw createError({
        statusCode: 404,
        statusMessage: "Product group not found"
      });
    }
    const [products] = await db.query(
      `SELECT id, name, version, slug, description, short_description, price, image_url, status
       FROM products 
       WHERE name = ? AND status = 'active'
       ORDER BY version ASC`,
      [baseProduct.name]
    );
    if (!products || products.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "No active products found for this group."
      });
    }
    const mainProduct = products[0];
    return {
      product: mainProduct,
      versions: products
      // All available versions
    };
  } catch (err) {
    const error = err;
    console.error(`Error fetching product group with slug ${slug}:`, error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "An internal error occurred while fetching the product group."
    });
  }
});

const _slug__get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: _slug__get
}, Symbol.toStringTag, { value: 'Module' }));

const index = defineEventHandler(async (event) => {
  try {
    const query = getQuery$1(event);
    const categorySlug = query.category;
    console.log("API Products: Query parameters:", query);
    let productsQuery;
    let queryParams = [];
    if (categorySlug) {
      console.log("API Products: Fetching products by category slug:", categorySlug);
      productsQuery = `
        SELECT 
          p.id, p.name, p.price, p.image_url, p.description, p.status,
          c.name as category_name, c.slug as category_slug
        FROM nixty.products p
        LEFT JOIN nixty.categories c ON p.category_id = c.id
        WHERE c.slug = ? AND p.status = 'active'
        ORDER BY p.id DESC
      `;
      queryParams.push(categorySlug);
    } else {
      console.log("API Products: Fetching all products");
      productsQuery = `
        SELECT 
          p.id, p.name, p.price, p.image_url, p.description, p.status,
          c.name as category_name, c.slug as category_slug
        FROM nixty.products p
        LEFT JOIN nixty.categories c ON p.category_id = c.id
        WHERE p.status = 'active'
        ORDER BY p.name, p.id DESC
      `;
    }
    const [products] = await db.query(productsQuery, queryParams);
    if (!products || products.length === 0) {
      console.log("API Products: No products found");
      return {
        success: true,
        data: [],
        total: 0
      };
    }
    const formattedProducts = products.map((p) => {
      var _a;
      return {
        id: p.id,
        name: p.name,
        price: parseFloat(p.price),
        image_url: p.image_url || "/placeholder-product.png",
        description: p.description,
        category_name: p.category_name,
        category_slug: p.category_slug,
        status: p.status,
        // Generate slug from name for compatibility
        slug: ((_a = p.name) == null ? void 0 : _a.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")) || `product-${p.id}`,
        category: {
          name: p.category_name,
          slug: p.category_slug
        }
      };
    });
    console.log("API Products: Returning", formattedProducts.length, "products");
    return {
      success: true,
      data: formattedProducts,
      total: formattedProducts.length
    };
  } catch (error) {
    console.error("API Products: Error fetching products:", error);
    throw createError({
      statusCode: 500,
      message: "An internal server error occurred."
    });
  }
});

const index$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: index
}, Symbol.toStringTag, { value: 'Module' }));

const _id_Fixed_get = defineEventHandler(async (event) => {
  var _a;
  try {
    const productId = (_a = event.context.params) == null ? void 0 : _a.id;
    if (!productId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Product ID is required"
      });
    }
    const [result] = await db.execute(`
      SELECT 
        COUNT(*) AS total_stock,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) AS available_stock
      FROM nixty.product_license_base 
      WHERE product_id = ?
    `, [productId]);
    if (!result || result.length === 0) {
      return {
        success: true,
        data: {
          product_id: productId,
          total_stock: 0,
          available_stock: 0
        }
      };
    }
    return {
      success: true,
      data: {
        product_id: productId,
        total_stock: result[0].total_stock || 0,
        available_stock: result[0].available_stock || 0
      }
    };
  } catch (error) {
    console.error("Error fetching product stock:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "Failed to fetch product stock"
    });
  }
});

const _id_Fixed_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: _id_Fixed_get
}, Symbol.toStringTag, { value: 'Module' }));

const _id__get$4 = defineEventHandler(async (event) => {
  var _a;
  try {
    const productId = (_a = event.context.params) == null ? void 0 : _a.id;
    if (!productId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Product ID is required"
      });
    }
    const [result] = await db.query(`
      SELECT 
        COUNT(*) AS total_stock,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) AS available_stock
      FROM nixty.product_license_base 
      WHERE product_id = ?
    `, [productId]);
    if (!result || result.length === 0) {
      return {
        success: true,
        data: {
          product_id: productId,
          total_stock: 0,
          available_stock: 0
        }
      };
    }
    return {
      success: true,
      data: {
        product_id: productId,
        total_stock: result[0].total_stock || 0,
        available_stock: result[0].available_stock || 0
      }
    };
  } catch (error) {
    console.error("Error fetching product stock:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "Failed to fetch product stock"
    });
  }
});

const _id__get$5 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: _id__get$4
}, Symbol.toStringTag, { value: 'Module' }));

const changePassword_post = defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event);
    const body = await readBody(event);
    const { currentPassword, newPassword } = body;
    if (!currentPassword || !newPassword) {
      throw createError({
        statusCode: 400,
        statusMessage: "Current password and new password are required"
      });
    }
    if (newPassword.length < 8) {
      throw createError({
        statusCode: 400,
        statusMessage: "New password must be at least 8 characters long"
      });
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      throw createError({
        statusCode: 400,
        statusMessage: "New password must contain at least one uppercase letter, one lowercase letter, and one number"
      });
    }
    const [rows] = await db.query(
      "SELECT password FROM nixty.users WHERE id = ?",
      [user.id]
    );
    if (rows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "User not found"
      });
    }
    const currentUser = rows[0];
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentUser.password);
    if (!isCurrentPasswordValid) {
      throw createError({
        statusCode: 400,
        statusMessage: "Current password is incorrect"
      });
    }
    const isSamePassword = await bcrypt.compare(newPassword, currentUser.password);
    if (isSamePassword) {
      throw createError({
        statusCode: 400,
        statusMessage: "New password must be different from current password"
      });
    }
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    await db.query(
      "UPDATE nixty.users SET password = ? WHERE id = ?",
      [hashedNewPassword, user.id]
    );
    return {
      success: true,
      message: "Password changed successfully"
    };
  } catch (error) {
    console.error("Password change error:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to change password"
    });
  }
});

const changePassword_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: changePassword_post
}, Symbol.toStringTag, { value: 'Module' }));

const index_get$2 = defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event);
    const [rows] = await db.query(
      "SELECT id, email, name, account_type, phone FROM nixty.users WHERE id = ?",
      [user.id]
    );
    if (rows.length === 0) {
      return {
        success: false,
        message: "User not found"
      };
    }
    const dbUser = rows[0];
    return {
      success: true,
      user: dbUser
    };
  } catch (error) {
    console.error("Profile fetch error:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch profile data"
    });
  }
});

const index_get$3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: index_get$2
}, Symbol.toStringTag, { value: 'Module' }));

const _id__get$2 = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const transactionId = getRouterParam(event, "id");
  if (!transactionId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Transaction ID is required"
    });
  }
  try {
    const [rows] = await db.query(`
      SELECT 
        t.id,
        t.order_id,
        t.product_id,
        t.product_name,
        t.customer_name,
        t.email,
        t.amount,
        t.quantity,
        t.status,
        t.payment_method,
        t.payment_gateway_status,
        t.payment_gateway_payload,
        t.license_info,
        t.created_at,
        t.updated_at,
        p.name as product_name_full,
        p.version as product_version,
        p.image_url as product_image
      FROM nixty.transactions t
      LEFT JOIN nixty.products p ON t.product_id = p.id
      WHERE t.id = ? AND t.user_id = ?
    `, [transactionId, user.id]);
    if (rows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Transaction not found"
      });
    }
    const transaction = rows[0];
    let paymentGatewayPayload = null;
    if (transaction.payment_gateway_payload) {
      try {
        paymentGatewayPayload = JSON.parse(transaction.payment_gateway_payload);
      } catch (error) {
        console.error("Error parsing payment gateway payload:", error);
      }
    }
    let licenseInfo = null;
    if (transaction.license_info) {
      try {
        licenseInfo = JSON.parse(transaction.license_info);
      } catch (error) {
        console.error("Error parsing license info:", error);
      }
    }
    return {
      success: true,
      transaction: {
        id: transaction.id,
        order_id: transaction.order_id,
        product_id: transaction.product_id,
        product_name: transaction.product_name,
        product_version: transaction.product_version,
        product_image: transaction.product_image,
        customer_name: transaction.customer_name,
        email: transaction.email,
        amount: transaction.amount,
        quantity: transaction.quantity,
        status: transaction.status,
        payment_method: transaction.payment_method,
        payment_gateway_status: transaction.payment_gateway_status,
        created_at: transaction.created_at,
        updated_at: transaction.updated_at,
        payment_gateway_payload: paymentGatewayPayload,
        license_info: licenseInfo,
        has_license: licenseInfo && licenseInfo.length > 0
      }
    };
  } catch (error) {
    console.error("Error retrieving transaction:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to retrieve transaction"
    });
  }
});

const _id__get$3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: _id__get$2
}, Symbol.toStringTag, { value: 'Module' }));

const getLicense_post = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const body = await readBody(event);
  const { order_id, transaction_id } = body;
  if (!order_id && !transaction_id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Order ID or Transaction ID is required"
    });
  }
  try {
    let query = "";
    let params = [];
    if (order_id) {
      query = `
        SELECT 
          t.id,
          t.order_id,
          t.product_id,
          t.product_name,
          t.status,
          t.payment_method,
          t.payment_gateway_status,
          t.license_info,
          t.created_at,
          t.updated_at,
          p.name as product_name_full,
          p.version as product_version
        FROM nixty.transactions t
        LEFT JOIN nixty.products p ON t.product_id = p.id
        WHERE t.order_id = ? AND t.user_id = ?
      `;
      params = [order_id, user.id];
    } else {
      query = `
        SELECT 
          t.id,
          t.order_id,
          t.product_id,
          t.product_name,
          t.status,
          t.payment_method,
          t.payment_gateway_status,
          t.license_info,
          t.created_at,
          t.updated_at,
          p.name as product_name_full,
          p.version as product_version
        FROM nixty.transactions t
        LEFT JOIN nixty.products p ON t.product_id = p.id
        WHERE t.id = ? AND t.user_id = ?
      `;
      params = [transaction_id, user.id];
    }
    const [rows] = await db.query(query, params);
    if (rows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Transaction not found"
      });
    }
    const transaction = rows[0];
    if (transaction.status !== "completed") {
      return {
        success: false,
        message: "Transaction not completed yet",
        status: transaction.status,
        order_id: transaction.order_id
      };
    }
    let licenseInfo = [];
    if (transaction.license_info) {
      try {
        licenseInfo = JSON.parse(transaction.license_info);
      } catch (error) {
        console.error("Error parsing license info:", error);
      }
    }
    if (licenseInfo.length === 0) {
      return {
        success: false,
        message: "No license information available",
        order_id: transaction.order_id
      };
    }
    const formattedLicenses = licenseInfo.map((license) => {
      const formatted = {
        license_type: license.license_type,
        additional_info: license.additional_info
      };
      switch (license.license_type) {
        case "product_key":
          formatted.product_key = license.product_key;
          break;
        case "email_password":
          formatted.email = license.email;
          formatted.password = license.password;
          break;
        default:
          if (license.product_key) formatted.product_key = license.product_key;
          if (license.email) formatted.email = license.email;
          if (license.password) formatted.password = license.password;
      }
      return formatted;
    });
    return {
      success: true,
      transaction: {
        id: transaction.id,
        order_id: transaction.order_id,
        product_name: transaction.product_name,
        product_version: transaction.product_version,
        status: transaction.status,
        payment_method: transaction.payment_method,
        created_at: transaction.created_at,
        updated_at: transaction.updated_at
      },
      licenses: formattedLicenses,
      license_count: formattedLicenses.length
    };
  } catch (error) {
    console.error("Error retrieving license info:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to retrieve license information"
    });
  }
});

const getLicense_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: getLicense_post
}, Symbol.toStringTag, { value: 'Module' }));

const update_post = defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event);
    const body = await readBody(event);
    const { name, email, phone } = body;
    if (!name && !email && !phone) {
      throw createError({
        statusCode: 400,
        statusMessage: "At least one field (name, email, or phone) is required"
      });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid email format"
      });
    }
    if (phone && !/^[\d\s\-\+\(\)]+$/.test(phone)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid phone number format"
      });
    }
    if (email) {
      const [existingUsers] = await db.query(
        "SELECT id FROM nixty.users WHERE email = ? AND id != ?",
        [email, user.id]
      );
      if (existingUsers.length > 0) {
        throw createError({
          statusCode: 400,
          statusMessage: "Email already exists"
        });
      }
    }
    const updateFields = [];
    const updateValues = [];
    if (name) {
      updateFields.push("name = ?");
      updateValues.push(name);
    }
    if (email) {
      updateFields.push("email = ?");
      updateValues.push(email);
    }
    if (phone) {
      updateFields.push("phone = ?");
      updateValues.push(phone);
    }
    updateValues.push(user.id);
    await db.query(
      `UPDATE nixty.users SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues
    );
    const [rows] = await db.query(
      "SELECT id, email, name, account_type, phone FROM nixty.users WHERE id = ?",
      [user.id]
    );
    return {
      success: true,
      message: "Profile updated successfully",
      user: rows[0]
    };
  } catch (error) {
    console.error("Profile update error:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update profile"
    });
  }
});

const update_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: update_post
}, Symbol.toStringTag, { value: 'Module' }));

const register_post = defineEventHandler(async (event) => {
  try {
    const { email, password, name } = await readBody(event);
    if (!email || !password) {
      return {
        success: false,
        message: "Email and password are required"
      };
    }
    const [existingUsers] = await db.query(
      "SELECT id FROM nixty.users WHERE email = $1",
      [email]
    );
    if (existingUsers.length > 0) {
      return {
        success: false,
        message: "User with this email already exists"
      };
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO nixty.users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name, account_type",
      [email, hashedPassword, name || null]
    );
    const newUser = result[0];
    return {
      success: true,
      message: "Registration successful",
      user: newUser
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      message: "An error occurred during registration"
    };
  }
});

const register_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: register_post
}, Symbol.toStringTag, { value: 'Module' }));

const resetPassword_post = defineEventHandler(async (event) => {
  try {
    const { token, password } = await readBody(event);
    if (!token || !password) {
      return {
        success: false,
        message: "Token and password are required"
      };
    }
    if (password.length < 8) {
      return {
        success: false,
        message: "Password must be at least 8 characters long"
      };
    }
    const [users] = await db.query(
      "SELECT * FROM nixty.users WHERE reset_token = ?",
      [token]
    );
    if (users.length === 0) {
      return {
        success: false,
        message: "Invalid or expired reset token"
      };
    }
    const user = users[0];
    const tokenExpiry = new Date(user.reset_token_expires);
    const now = /* @__PURE__ */ new Date();
    if (now > tokenExpiry) {
      return {
        success: false,
        message: "Reset token has expired. Please request a new one."
      };
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      "UPDATE nixty.users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?",
      [hashedPassword, user.id]
    );
    return {
      success: true,
      message: "Your password has been reset successfully. You can now login with your new password."
    };
  } catch (error) {
    console.error("Reset password error:", error);
    return {
      success: false,
      message: "An error occurred while resetting your password"
    };
  }
});

const resetPassword_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: resetPassword_post
}, Symbol.toStringTag, { value: 'Module' }));

const index_get = defineEventHandler(async (event) => {
  try {
    const query = getQuery$1(event);
    const {
      q: searchQuery,
      type = "all",
      // 'products', 'deals', 'news', or 'all'
      limit = 3
    } = query;
    console.log("\u{1F50D} Search API called with:", { searchQuery, type, limit });
    if (!searchQuery || searchQuery.length < 2) {
      console.log("\u274C Search query too short:", searchQuery);
      return {
        success: false,
        message: "Search query must be at least 2 characters long",
        data: []
      };
    }
    const results = [];
    const searchTerms = searchQuery.toLowerCase().split(" ").filter((term) => term.length > 0);
    const createSearchConditions = (fields) => {
      return searchTerms.map(
        (term) => `(${fields.map((field) => `LOWER(${field}) LIKE ?`).join(" OR ")})`
      ).join(" AND ");
    };
    const createSearchParams = (fieldsCount) => {
      return searchTerms.flatMap(
        (term) => Array(fieldsCount).fill(`%${term}%`)
      );
    };
    if (type === "all" || type === "Product") {
      console.log("\u{1F50D} Searching products...");
      const productFields = ["p.name", "p.version", "p.description", "p.short_description"];
      const productConditions = createSearchConditions(productFields);
      const productParams = createSearchParams(productFields.length);
      const productSql = `
        SELECT
          p.id,
          p.name,
          p.version,
          p.description,
          p.short_description,
          p.price,
          p.currency,
          c.name as category_name,
          'Product' as result_type
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.status = 'active' AND ${productConditions}
        ORDER BY p.is_featured DESC, p.created_at DESC
        LIMIT ?
      `;
      console.log("\u{1F4DD} Product SQL:", productSql);
      console.log("\u{1F4DD} Product Params:", [...productParams, parseInt(limit)]);
      const [productRows] = await db.query(productSql, [...productParams, parseInt(limit)]);
      console.log("\u{1F4CA} Product search results:", productRows.length, "rows found");
      productRows.forEach((row) => {
        results.push({
          id: row.id,
          name: row.name + (row.version ? ` ${row.version}` : ""),
          type: "Product",
          category: row.category_name,
          price: row.price ? `${row.currency}${Math.floor(row.price).toLocaleString("id-ID")}` : null,
          description: row.short_description || row.description
        });
      });
    }
    if (type === "all" || type === "Deal") {
      const dealFields = ["d.title", "d.description", "p.name"];
      const dealConditions = createSearchConditions(dealFields);
      const dealParams = createSearchParams(dealFields.length);
      const dealSql = `
        SELECT 
          d.id,
          d.title,
          d.description,
          d.new_price,
          d.old_price,
          d.discount_percentage,
          p.name as product_name,
          'Deal' as result_type
        FROM deals d
        LEFT JOIN products p ON d.product_id = p.id
        WHERE d.status = 'active' 
          AND (d.expires_at IS NULL OR d.expires_at > NOW())
          AND (${dealConditions})
        ORDER BY d.is_featured DESC, d.created_at DESC
        LIMIT ?
      `;
      const [dealRows] = await db.query(dealSql, [...dealParams, parseInt(limit)]);
      dealRows.forEach((row) => {
        results.push({
          id: row.id,
          name: row.title,
          title: row.title,
          type: "Deal",
          price: row.new_price ? `Rp${Math.floor(row.new_price).toLocaleString("id-ID")}` : null,
          oldPrice: row.old_price ? `Rp${Math.floor(row.old_price).toLocaleString("id-ID")}` : null,
          discount: row.discount_percentage ? `${row.discount_percentage}% OFF` : null,
          description: row.description,
          productName: row.product_name
        });
      });
    }
    if (type === "all" || type === "News") {
      const newsFields = ["a.title", "a.content"];
      const newsConditions = createSearchConditions(newsFields);
      const newsParams = createSearchParams(newsFields.length);
      const newsSql = `
        SELECT 
          a.id,
          a.title,
          a.content,
          a.created_at,
          a.is_new,
          'News' as result_type
        FROM announcements a
        WHERE a.status = 'active' AND (${newsConditions})
        ORDER BY a.created_at DESC
        LIMIT ?
      `;
      const [newsRows] = await db.query(newsSql, [...newsParams, parseInt(limit)]);
      newsRows.forEach((row) => {
        results.push({
          id: row.id,
          name: row.title,
          title: row.title,
          type: "News",
          content: row.content,
          date: new Date(row.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
          }),
          isNew: Boolean(row.is_new)
        });
      });
    }
    const limitedResults = results.slice(0, parseInt(limit));
    console.log("\u2705 Search completed:", {
      totalResults: results.length,
      limitedResults: limitedResults.length,
      query: searchQuery,
      type
    });
    return {
      success: true,
      data: limitedResults,
      total: limitedResults.length,
      query: searchQuery,
      type
    };
  } catch (error) {
    console.error("Error in search API:", error);
    return {
      success: false,
      message: "An error occurred while searching",
      data: [],
      error: error.message
    };
  }
});

const index_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: index_get
}, Symbol.toStringTag, { value: 'Module' }));

const setupMissingTables_get = defineEventHandler(async (event) => {
  try {
    console.log("Setting up missing tables...");
    const result = {
      success: true,
      created: [],
      errors: []
    };
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS nixty.announcements (
          id SERIAL PRIMARY KEY,
          title VARCHAR NOT NULL,
          content TEXT,
          image_url VARCHAR,
          is_new BOOLEAN DEFAULT true,
          status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now()
        )
      `);
      result.created.push("announcements");
      console.log("\u2713 Created announcements table");
    } catch (error) {
      result.errors.push(`Announcements table error: ${error.message}`);
      console.error("\u2717 Announcements table error:", error);
    }
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS nixty.hero_slides (
          id SERIAL PRIMARY KEY,
          title VARCHAR NOT NULL,
          description TEXT,
          background_image_url VARCHAR,
          product_id INTEGER REFERENCES nixty.products(id) ON DELETE SET NULL,
          is_new BOOLEAN DEFAULT false,
          status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
          sort_order SMALLINT DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now()
        )
      `);
      result.created.push("hero_slides");
      console.log("\u2713 Created hero_slides table");
    } catch (error) {
      result.errors.push(`Hero slides table error: ${error.message}`);
      console.error("\u2717 Hero slides table error:", error);
    }
    try {
      await db.query(`
        INSERT INTO nixty.announcements (title, content, image_url, is_new, status) VALUES
          ('Welcome to Nixty', 'Discover amazing software deals and licensing solutions', '/announcement.jfif', true, 'active'),
          ('New Office 365 Plans Available', 'Check out our latest Office 365 offerings with competitive pricing', '/announcement.jfif', true, 'active'),
          ('Security Update', 'Enhanced security features now available for all products', '/announcement.jfif', false, 'active')
        ON CONFLICT DO NOTHING
      `);
      console.log("\u2713 Inserted sample announcements");
    } catch (error) {
      result.errors.push(`Insert announcements error: ${error.message}`);
      console.error("\u2717 Insert announcements error:", error);
    }
    try {
      await db.query(`
        INSERT INTO nixty.hero_slides (title, description, background_image_url, is_new, status, sort_order) VALUES
          ('Office 365 Personal', 'Get the most out of Office with a Microsoft 365 subscription', '/office365-hero.svg', false, 'active', 1),
          ('Windows 11 Pro', 'The most secure Windows ever built', '/hero-background.jfif', false, 'active', 2),
          ('Business Solutions', 'Complete business productivity and security solutions', '/hero-background.jfif', true, 'active', 3)
        ON CONFLICT DO NOTHING
      `);
      console.log("\u2713 Inserted sample hero slides");
    } catch (error) {
      result.errors.push(`Insert hero slides error: ${error.message}`);
      console.error("\u2717 Insert hero slides error:", error);
    }
    if (result.errors.length > 0) {
      result.success = false;
    }
    return result;
  } catch (error) {
    console.error("Setup missing tables error:", error);
    return {
      success: false,
      message: "Failed to setup missing tables",
      error: error.message
    };
  }
});

const setupMissingTables_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: setupMissingTables_get
}, Symbol.toStringTag, { value: 'Module' }));

const _id__get = defineEventHandler(async (event) => {
  var _a;
  try {
    const user = await requireAuth(event);
    const transactionId = (_a = event.context.params) == null ? void 0 : _a.id;
    if (!transactionId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Transaction ID is required"
      });
    }
    const [transactions] = await db.execute(`
      SELECT t.*, p.name as product_name, p.slug as product_slug
      FROM nixty.transactions t
      JOIN nixty.products p ON t.product_id = p.id
      WHERE t.id = ? AND t.user_id = ?
    `, [transactionId, user.id]);
    if (transactions.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Transaction not found or access denied"
      });
    }
    const transaction = transactions[0];
    const [paymentLogs] = await db.execute(`
      SELECT * FROM nixty.payment_gateway_logs
      WHERE transaction_id = ?
      ORDER BY id ASC
    `, [transactionId]);
    const paymentInfo = paymentLogs.reduce((acc, log) => {
      acc[log.key] = log.value;
      return acc;
    }, {});
    const [licenseAssignments] = await db.execute(`
      SELECT tl.*, plb.license_type, pk.product_key, pa.email, pa.password
      FROM nixty.transaction_license tl
      JOIN nixty.product_license_base plb ON tl.license_id = plb.id
      LEFT JOIN nixty.product_license_keys pk ON plb.id = pk.id AND plb.license_type = 'product_key'
      LEFT JOIN nixty.product_license_accounts pa ON plb.id = pa.id AND plb.license_type = 'email_password'
      WHERE tl.transaction_id = ?
    `, [transactionId]);
    const licenses = licenseAssignments.map((license) => {
      const licenseData = {
        license_id: license.license_id,
        license_type: license.license_type
      };
      if (license.license_type === "product_key" && license.product_key) {
        licenseData.product_key = license.product_key;
      } else if (license.license_type === "email_password" && license.email) {
        licenseData.email = license.email;
        licenseData.password = license.password;
      }
      return licenseData;
    });
    return {
      success: true,
      transaction: {
        id: transaction.id,
        product_id: transaction.product_id,
        product_name: transaction.product_name,
        product_slug: transaction.product_slug,
        quantity: transaction.quantity,
        total: transaction.total,
        status: transaction.status,
        created_at: transaction.created_at
      },
      payment_status: {
        status: transaction.status,
        payment_type: paymentInfo.payment_type || "unknown",
        transaction_status: paymentInfo.transaction_status || transaction.status,
        order_id: paymentInfo.order_id || "",
        created_at: paymentInfo.transaction_time || transaction.created_at
      },
      licenses,
      license_count: licenses.length
    };
  } catch (error) {
    console.error("Error getting transaction license status:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "Failed to get transaction license status"
    });
  }
});

const _id__get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: _id__get
}, Symbol.toStringTag, { value: 'Module' }));

function renderPayloadJsonScript(opts) {
  const contents = opts.data ? stringify(opts.data, opts.ssrContext._payloadReducers) : "";
  const payload = {
    "type": "application/json",
    "innerHTML": contents,
    "data-nuxt-data": appId,
    "data-ssr": !(opts.ssrContext.noSSR)
  };
  {
    payload.id = "__NUXT_DATA__";
  }
  if (opts.src) {
    payload["data-src"] = opts.src;
  }
  const config = uneval(opts.ssrContext.config);
  return [
    payload,
    {
      innerHTML: `window.__NUXT__={};window.__NUXT__.config=${config}`
    }
  ];
}

const renderSSRHeadOptions = {"omitLineBreaks":false};

globalThis.__buildAssetsURL = buildAssetsURL;
globalThis.__publicAssetsURL = publicAssetsURL;
const HAS_APP_TELEPORTS = !!(appTeleportAttrs.id);
const APP_TELEPORT_OPEN_TAG = HAS_APP_TELEPORTS ? `<${appTeleportTag}${propsToString(appTeleportAttrs)}>` : "";
const APP_TELEPORT_CLOSE_TAG = HAS_APP_TELEPORTS ? `</${appTeleportTag}>` : "";
const renderer = defineRenderHandler(async (event) => {
  const nitroApp = useNitroApp();
  const ssrError = event.path.startsWith("/__nuxt_error") ? getQuery$1(event) : null;
  if (ssrError && !("__unenv__" in event.node.req)) {
    throw createError({
      statusCode: 404,
      statusMessage: "Page Not Found: /__nuxt_error"
    });
  }
  const ssrContext = createSSRContext(event);
  const headEntryOptions = { mode: "server" };
  ssrContext.head.push(appHead, headEntryOptions);
  if (ssrError) {
    ssrError.statusCode &&= Number.parseInt(ssrError.statusCode);
    setSSRError(ssrContext, ssrError);
  }
  const routeOptions = getRouteRules(event);
  if (routeOptions.ssr === false) {
    ssrContext.noSSR = true;
  }
  const renderer = await getRenderer(ssrContext);
  const _rendered = await renderer.renderToString(ssrContext).catch(async (error) => {
    if (ssrContext._renderResponse && error.message === "skipping render") {
      return {};
    }
    const _err = !ssrError && ssrContext.payload?.error || error;
    await ssrContext.nuxt?.hooks.callHook("app:error", _err);
    throw _err;
  });
  const inlinedStyles = [];
  await ssrContext.nuxt?.hooks.callHook("app:rendered", { ssrContext, renderResult: _rendered });
  if (ssrContext._renderResponse) {
    return ssrContext._renderResponse;
  }
  if (ssrContext.payload?.error && !ssrError) {
    throw ssrContext.payload.error;
  }
  const NO_SCRIPTS = routeOptions.noScripts;
  const { styles, scripts } = getRequestDependencies(ssrContext, renderer.rendererContext);
  if (ssrContext._preloadManifest && !NO_SCRIPTS) {
    ssrContext.head.push({
      link: [
        { rel: "preload", as: "fetch", fetchpriority: "low", crossorigin: "anonymous", href: buildAssetsURL(`builds/meta/${ssrContext.runtimeConfig.app.buildId}.json`) }
      ]
    }, { ...headEntryOptions, tagPriority: "low" });
  }
  if (inlinedStyles.length) {
    ssrContext.head.push({ style: inlinedStyles });
  }
  const link = [];
  for (const resource of Object.values(styles)) {
    if ("inline" in getQuery(resource.file)) {
      continue;
    }
    link.push({ rel: "stylesheet", href: renderer.rendererContext.buildAssetsURL(resource.file), crossorigin: "" });
  }
  if (link.length) {
    ssrContext.head.push({ link }, headEntryOptions);
  }
  if (!NO_SCRIPTS) {
    ssrContext.head.push({
      link: getPreloadLinks(ssrContext, renderer.rendererContext)
    }, headEntryOptions);
    ssrContext.head.push({
      link: getPrefetchLinks(ssrContext, renderer.rendererContext)
    }, headEntryOptions);
    ssrContext.head.push({
      script: renderPayloadJsonScript({ ssrContext, data: ssrContext.payload }) 
    }, {
      ...headEntryOptions,
      // this should come before another end of body scripts
      tagPosition: "bodyClose",
      tagPriority: "high"
    });
  }
  if (!routeOptions.noScripts) {
    const tagPosition = "head";
    ssrContext.head.push({
      script: Object.values(scripts).map((resource) => ({
        type: resource.module ? "module" : null,
        src: renderer.rendererContext.buildAssetsURL(resource.file),
        defer: resource.module ? null : true,
        // if we are rendering script tag payloads that import an async payload
        // we need to ensure this resolves before executing the Nuxt entry
        tagPosition,
        crossorigin: ""
      }))
    }, headEntryOptions);
  }
  const { headTags, bodyTags, bodyTagsOpen, htmlAttrs, bodyAttrs } = await renderSSRHead(ssrContext.head, renderSSRHeadOptions);
  const htmlContext = {
    htmlAttrs: htmlAttrs ? [htmlAttrs] : [],
    head: normalizeChunks([headTags]),
    bodyAttrs: bodyAttrs ? [bodyAttrs] : [],
    bodyPrepend: normalizeChunks([bodyTagsOpen, ssrContext.teleports?.body]),
    body: [
      replaceIslandTeleports(ssrContext, _rendered.html) ,
      APP_TELEPORT_OPEN_TAG + (HAS_APP_TELEPORTS ? joinTags([ssrContext.teleports?.[`#${appTeleportAttrs.id}`]]) : "") + APP_TELEPORT_CLOSE_TAG
    ],
    bodyAppend: [bodyTags]
  };
  await nitroApp.hooks.callHook("render:html", htmlContext, { event });
  return {
    body: renderHTMLDocument(htmlContext),
    statusCode: getResponseStatus(event),
    statusMessage: getResponseStatusText(event),
    headers: {
      "content-type": "text/html;charset=utf-8",
      "x-powered-by": "Nuxt"
    }
  };
});
function normalizeChunks(chunks) {
  return chunks.filter(Boolean).map((i) => i.trim());
}
function joinTags(tags) {
  return tags.join("");
}
function joinAttrs(chunks) {
  if (chunks.length === 0) {
    return "";
  }
  return " " + chunks.join(" ");
}
function renderHTMLDocument(html) {
  return `<!DOCTYPE html><html${joinAttrs(html.htmlAttrs)}><head>${joinTags(html.head)}</head><body${joinAttrs(html.bodyAttrs)}>${joinTags(html.bodyPrepend)}${joinTags(html.body)}${joinTags(html.bodyAppend)}</body></html>`;
}

const renderer$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: renderer
}, Symbol.toStringTag, { value: 'Module' }));
//# sourceMappingURL=index.mjs.map
