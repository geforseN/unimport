import { describe, expect, it } from 'vitest'
import { toTypeReExports } from '../src'

// when imports element is { type: true, name: '*', as: 'bar' } export will be...
// old behavior: export type { default as bar } from 'foo'
// new behavior: export type * as bar from 'foo'
// to save previous behavior, user must rename `name` property from '*' to 'default'
// NOTE: with new behavior user should provide `as` property,
// `  export type * from 'foo'` is invalid
// NOTE: star type import can not be on same line with same `from` property :
// `
//   export type * as bar, type { baz } from 'foo'
// ` is invalid`
// `
//   export type * as bar from 'foo'
//   export type { baz } from 'foo'
// ` is valid

describe('star type import', () => {
  it('would not be added if there is no "as" property', () => {
    const invalidImport = {
      from: 'foo-lib',
      name: '*',
      type: true,
    }
    const typeReExports = toTypeReExports([invalidImport])
    expect(typeReExports).toMatchInlineSnapshot(`
      "// for type re-export
      declare global {

      }"
    `)
  })

  it('would not be added if there is multiple invalid imports', () => {
    const invalidImports = [
      {
        from: 'foo-lib',
        name: '*',
        type: true,
      },
      {
        from: 'foo-lib',
        name: '*',
        type: true,
        as: '',
      },
    ]
    const typeReExports = toTypeReExports(invalidImports)
    expect(typeReExports).toMatchInlineSnapshot(`
      "// for type re-export
      declare global {

      }"
    `)
  })
  it('with other type imports will not be on same line', () => {
    const typeReExports = toTypeReExports([
      {
        from: 'foo-lib',
        name: '*',
        type: true,
        as: 'bar',
      },
      {
        from: 'foo-lib',
        name: 'baz',
        type: true,
      },
    ])
    expect(typeReExports).toMatchInlineSnapshot(`
      "// for type re-export
      declare global {
        // @ts-ignore
        export type { baz } from 'foo-lib'
        // @ts-ignore
        export type * as bar from 'foo-lib'
        import('foo-lib')
      }"
    `)
  })
})
