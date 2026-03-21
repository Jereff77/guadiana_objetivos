import { cn } from '../utils'

describe('cn() – class name merger', () => {
  it('returns a single class unchanged', () => {
    expect(cn('foo')).toBe('foo')
  })

  it('merges multiple classes', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c')
  })

  it('omits falsy values', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b')
  })

  it('resolves Tailwind conflicts (last wins)', () => {
    // tailwind-merge keeps the last conflicting class
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    expect(cn('p-4', 'p-6')).toBe('p-6')
  })

  it('supports conditional object syntax', () => {
    expect(cn({ 'font-bold': true, 'italic': false })).toBe('font-bold')
  })

  it('supports array syntax', () => {
    expect(cn(['px-4', 'py-2'])).toBe('px-4 py-2')
  })
})
