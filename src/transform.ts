import { Parser } from 'acorn'
import * as ESTree from 'estree'
import { ExternalValue, Externals, TransformModuleNameFn } from './types'

type Specifiers = (ESTree.ImportSpecifier | ESTree.ImportDefaultSpecifier | ESTree.ImportNamespaceSpecifier | ESTree.ExportSpecifier)[]

export const transformImports = (
  raw: string,
  externalValue: ExternalValue,
  transformModuleName: TransformModuleNameFn,
): string => {
  const ast = Parser.parse(raw, {
    ecmaVersion: 'latest',
    sourceType: 'module',
  }) as unknown as ESTree.Program
  const specifiers = (ast.body[0] as (ESTree.ImportDeclaration))?.specifiers as Specifiers
  if (!specifiers) {
    return ''
  }
  return specifiers.reduce((s, specifier) => {
    const { local } = specifier
    if (specifier.type === 'ImportDefaultSpecifier') {
      /**
       * source code: import Vue from 'vue'
       * transformed: const Vue = window['Vue']
       */
      s += `const ${local.name} = ${transformModuleName(externalValue)}\n`
    } else if (specifier.type === 'ImportSpecifier') {
      /**
       * source code:
       * import { reactive, ref as r } from 'vue'
       * transformed:
       * const reactive = window['Vue'].reactive
       * const r = window['Vue'].ref
       */
      const { imported } = specifier
      s += `const ${local.name} = ${transformModuleName(externalValue)}.${imported.name}\n`
    } else if (specifier.type === 'ImportNamespaceSpecifier') {
      /**
       * source code: import * as vue from 'vue'
       * transformed: const vue = window['Vue']
       */
      s += `const ${local.name} = ${transformModuleName(externalValue)}\n`
    } else if (specifier.type === 'ExportSpecifier') {
      /**
       * Re-export default import as named export
       * source code: export { default as React } from 'react'
       * transformed: export const React = window['React']
       *
       * Re-export default import as default export
       * source code: export { default } from 'react'
       * transformed: export default window['React']
       *
       * Re-export named import
       * source code: export { useState } from 'react'
       * transformed: export const useState = window['React'].useState
       *
       * Re-export named import as renamed export
       * source code: export { useState as useState2 } from 'react'
       * transformed: export const useState2 = window['React'].useState
       */
      const { exported } = specifier
      const value = `${transformModuleName(externalValue)}${local.name !== 'default' ? `.${local.name}` : ''}`
      if (exported.name === 'default') {
        s += `export default ${value}\n`
      } else {
        s += `export const ${exported.name} = ${value}\n`
      }
    }
    return s
  }, '')
}

export function transformRequires(
  code: string,
  externals: Externals,
  transformModuleName: TransformModuleNameFn,
) {
  // It's not a good method, but I feel it can cover most scenes
  return Object.keys(externals).reduce((code, externalKey) => {
    const r = new RegExp(`require\\((["'\`])\\s*${externalKey}\\s*(\\1)\\)`, 'g')
    return code.replace(r, transformModuleName(externals[externalKey]))
  }, code)
}

/**
 * 转换ol模块导入方式
 * @param raw 
 * @returns 
 */
export function transformOlImports(raw: string): string {
  if (raw.includes('ol/ol.css') || raw.includes('ol-ext/dist/ol-ext.css') || raw.includes('ol-ext/dist/ol-ext.min.css')) {
      return raw
  }
  const externalValue = extractQuotedStrings(raw)[0]
  if (!isOlModule(externalValue)) {
      return raw
  }
  const ast = Parser.parse(raw, {
      ecmaVersion: 'latest',
      sourceType: 'module',
  }) as unknown as ESTree.Program
  const specifiers = (ast.body[0] as (ESTree.ImportDeclaration))?.specifiers as Specifiers
  if (!specifiers) {
      return ''
  }
  return specifiers.reduce((s, specifier) => {
      const { local } = specifier

      if (specifier.type === 'ImportDefaultSpecifier') {
          /**
           * source code: import Vue from 'vue'
           * transformed: const Vue = window['Vue']
           */
          s += `const ${local.name} = ${transformOlModuleName(externalValue)}\n`
      } else if (specifier.type === 'ImportSpecifier') {
          /**
           * source code:
           * import { reactive, ref as r } from 'vue'
           * transformed:
           * const reactive = window['Vue'].reactive
           * const r = window['Vue'].ref
           */
          const { imported } = specifier
          s += `const ${local.name} = ${transformOlModuleName(externalValue)}.${imported.name}\n`
      } else if (specifier.type === 'ImportNamespaceSpecifier') {
          /**
           * source code: import * as vue from 'vue'
           * transformed: const vue = window['Vue']
           */
          s += `const ${local.name} = ${transformOlModuleName(externalValue)}\n`
      } else if (specifier.type === 'ExportSpecifier') {
          /**
           * Re-export default import as named export
           * source code: export { default as React } from 'react'
           * transformed: export const React = window['React']
           *
           * Re-export default import as default export
           * source code: export { default } from 'react'
           * transformed: export default window['React']
           *
           * Re-export named import
           * source code: export { useState } from 'react'
           * transformed: export const useState = window['React'].useState
           *
           * Re-export named import as renamed export
           * source code: export { useState as useState2 } from 'react'
           * transformed: export const useState2 = window['React'].useState
           */
          const { exported } = specifier
          const value = `${transformOlModuleName(externalValue)}${local.name !== 'default' ? `.${local.name}` : ''}`
          if (exported.name === 'default') {
              s += `export default ${value}\n`
          } else {
              s += `export const ${exported.name} = ${value}\n`
          }
      }
      return s
  }, '')
}

/**
 * 转换ol模块名称
 * @param importStr 
 * @returns 
 */
function transformOlModuleName(importStr: string): string {
  if (isOlModule(importStr)) {
      return importStr.replaceAll('ol-ext', 'ol').split('/').join('.')
  } else {
      return importStr
  }
}

/**
 * 判断是否是ol模块
 * @param str 
 * @returns 
 */
function isOlModule(str: string) {
  return str.startsWith('ol/') || str.startsWith('ol-ext/')
}

/**
 * 提取import xxx from ""中的模块
 * @param str 
 * @returns 
 */
function extractQuotedStrings(str: string): string[] {
  const doubleQuotedRegex = /"(?:[^"\\]|\\.)*"/g;
  const singleQuotedRegex = /'(?:[^'\\]|\\.)*'/g;

  const doubleQuotedStrings = str.match(doubleQuotedRegex);
  const singleQuotedStrings = str.match(singleQuotedRegex);

  const result: string[] = []

  if (doubleQuotedStrings) {
      doubleQuotedStrings.forEach((_, index) => {
          result.push(_.replace(/["\\]/g, ''))
      });
  }

  if (singleQuotedStrings) {
      singleQuotedStrings.forEach((_, index) => {
          result.push(_.replace(/['\\]/g, ''))
      });
  }

  return result;
}