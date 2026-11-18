import { EMBEDDING_DIMENSIONS, type PropertyEmbeddingInput } from './types.ts'

/**
 * Combine property fields into one string for the embedding model.
 * Same fields always produce the same text.
 * title, then description, then location when it is present.
 */
export function buildEmbeddingText(input: PropertyEmbeddingInput): string {
  const parts = [input.title, input.description, input.locationSummary ?? '']
    .map((part) => part.trim())
    .filter(Boolean)
  return parts.join('\n\n')
}

/** True when the vector is a finite number list of the expected length. */
export function assertEmbeddingDimension(
  embedding: number[],
  expected = EMBEDDING_DIMENSIONS,
): boolean {
  return (
    Array.isArray(embedding) &&
    embedding.length === expected &&
    embedding.every((n) => typeof n === 'number' && Number.isFinite(n))
  )
}
