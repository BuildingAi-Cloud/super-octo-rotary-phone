import { formatPrice, getProductById, PRODUCTS } from '@/lib/products'
import { describe, expect, it } from '@jest/globals'

describe('products helpers', () => {
  it('returns a product by id', () => {
    const product = getProductById('professional')

    expect(product).toBeDefined()
    expect(product?.id).toBe('professional')
    expect(product?.name).toBe('Professional')
  })

  it('returns undefined for unknown product id', () => {
    expect(getProductById('does-not-exist')).toBeUndefined()
  })

  it('formats non-zero price in dollars', () => {
    expect(formatPrice(250)).toBe('$2.50')
  })

  it('formats zero price as Custom', () => {
    expect(formatPrice(0)).toBe('Custom')
  })

  it('keeps product ids unique in source of truth', () => {
    const ids = PRODUCTS.map((product) => product.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
