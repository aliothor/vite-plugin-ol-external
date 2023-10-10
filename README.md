# vite-plugin-ol-external

<p>
  <a href="https://www.npmjs.com/package/vite-plugin-ol-external" target="_blank">
    <img alt="NPM package" src="https://img.shields.io/npm/v/vite-plugin-ol-external.svg?style=flat">
  </a>
  <a href="https://www.npmjs.com/package/vite-plugin-ol-external" target="_blank">
    <img alt="downloads" src="https://img.shields.io/npm/dt/vite-plugin-ol-external.svg?style=flat">
  </a>
  <a href="https://github.com/vitejs/awesome-vite#helpers" target="_blank">
    <img src="https://cdn.rawgit.com/sindresorhus/awesome/d7305f38d29fed78fa85652e3a63e154dd8e8829/media/badge.svg" alt="Awesome">
  </a>
</p>

external openlayers plugin for vite

Can be used in `production` mode without other `rollup` configuration.

## Usage

```bash
npm i vite-plugin-ol-external -D
```

Add it to `vite.config.js`

```js
// vite.config.js
import { viteExternalOlPlugin } from 'vite-plugin-ol-external'

export default {
  plugins: [
    viteExternalOlPlugin({}),
  ]
}
```

## How to work

transform source code of js file.

```js
// source code
import Map from 'ol/Map'
// transformed
const Map = window['ol.Map']

// source code
import { Vector, Tile as TileLayer } from 'ol/layer'
// transformed
const Vector = window['ol.layer'].Vector
const TileLayer = window['ol.layer'].Tile

```

**Warning**: please use the plugin after converting to JS code, because the plugin only transform JS code. Eg.

```js
import vue from '@vitejs/plugin-vue'

export default {
  plugins: [
    vue(), // @vitejs/plugin-vue will transform SFC to JS code

    // It should be under @vitejs/plugin-vue
    viteExternalOlPlugin(),
  ]
}
```

If an error occurs, you can check whether the error is caused by the plugin order.

## Configuration

### disableInServe

disable transform in `serve mode` .

```js
viteExternalOlPlugin({ disableInServe: true })
```


### enforce

vite plugin ordering. Resolve plugin ordering cause unexpected error. Such as [#21](https://github.com/crcong/vite-plugin-ol-external/issues/21).

See [https://vitejs.dev/guide/api-plugin.html#plugin-ordering](https://vitejs.dev/guide/api-plugin.html#plugin-ordering).


### useWindow

set `false`, the `window` prefix will not be added.

**Warning**: If your module name has special characters, such as `/`, set useWindow option `false`, will throw error.

```js
viteExternalOlPlugin({ useWindow: false }),

// source code
import Map from 'ol/Map'
// transformed, no `const Vue = window['Vue']`
const Map = ol.Map
```

### sourceMapOptions

The configuration item of the code sourcemap after code conversion. The library is `magic-string`.
