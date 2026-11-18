import assert from 'node:assert/strict'
import { test } from 'node:test'

import { EMBEDDING_DIMENSIONS } from './types.ts'
import { assertEmbeddingDimension, buildEmbeddingText } from './text.ts'

test('buildEmbeddingText joins title, description, and location', () => {
  const text = buildEmbeddingText({
    title: 'Stillwater cottage',
    description: 'A lake stay',
    locationSummary: 'North shore',
  })
  assert.equal(text, 'Stillwater cottage\n\nA lake stay\n\nNorth shore')
})

test('buildEmbeddingText skips blank fields', () => {
  const text = buildEmbeddingText({
    title: '  ',
    description: 'A lake stay',
    locationSummary: '',
  })
  assert.equal(text, 'A lake stay')
})

test('assertEmbeddingDimension checks length and finite numbers', () => {
  const vector = Array.from({ length: EMBEDDING_DIMENSIONS }, () => 0.1)
  assert.equal(assertEmbeddingDimension(vector), true)
  assert.equal(assertEmbeddingDimension(vector.slice(0, 3)), false)
  vector[0] = Number.NaN
  assert.equal(assertEmbeddingDimension(vector), false)
})
