# vite-plugin-ol-external

<p align="center">
  <a href="https://www.npmjs.com/package/vite-plugin-ol-external" target="_blank">
    <img alt="NPM package" src="https://img.shields.io/npm/v/vite-plugin-ol-external.svg?style=flat">
  </a>
  <a href="https://www.npmjs.com/package/vite-plugin-ol-external" target="_blank">
    <img alt="downloads" src="https://img.shields.io/npm/dm/vite-plugin-ol-external.svg?style=flat">
  </a>
  <img src="https://img.shields.io/github/license/aliothor/vite-plugin-ol-external" alt="License">
  <img src="https://img.shields.io/github/commit-activity/m/aliothor/vite-plugin-ol-external" alt="Activity">
</p>

## external openlayers package plugin for vite

Can be used in `production` mode without other `rollup` configuration.

## 📘 Usage

```bash
pnpm add vite-plugin-ol-external -D
```

Add it to `vite.config.ts`

```ts
// vite.config.ts
import { viteExternalOlPlugin } from 'vite-plugin-ol-external'

export default {
  plugins: [viteExternalOlPlugin({})],
}
```

## 🔨 How to work

transform source code of js file.

```js
// source code
import Map from 'ol/Map'
// transformed
const Map = window['ol.Map']

// source code
import { Tile as TileLayer, Vector } from 'ol/layer'
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
  ],
}
```

If an error occurs, you can check whether the error is caused by the plugin order.

## 📜 Configuration

### disableInServe

disable transform in `serve mode` .

```js
viteExternalOlPlugin({ disableInServe: true })
```

### enforce

vite plugin ordering. Resolve plugin ordering cause unexpected error.

See [https://vitejs.dev/guide/api-plugin.html#plugin-ordering](https://vitejs.dev/guide/api-plugin.html#plugin-ordering).

### useWindow

set `false`, the `window` prefix will not be added.

**Warning**: If your module name has special characters, such as `/`, set useWindow option `false`, will throw error.

```js
viteExternalOlPlugin({ useWindow: false }),

// source code
import Map from 'ol/Map'
// transformed, no `const Map = window['ol.Map']`
const Map = ol.Map
```

### sourceMapOptions

The configuration item of the code sourcemap after code conversion. The library is `magic-string`.

## 💖 reference

> [vite-plugin-externals](https://github.com/crcong/vite-plugin-externals)
