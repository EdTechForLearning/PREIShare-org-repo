# PREIshare — Supabase pgvector setup plan

## Goal and source of truth

Plan the **database migration only** for semantic search. This plan follows [embedding-data-model.md](embedding-data-model.md). The agreed tutorial contract is:

| Item | Contract |
| --- | --- |
| Table | `properties` |
| Unique property identifier | `id` (preserve the existing primary-key type and constraint) |
| Readable listing text | `title` and `description` |
| Vector column | `embedding` |
| Planned vector size | **1536** numbers (`vector(1536)`) |
| Initial embedding input, for later work | `title` + newline + `description` |
| Optional display fields | `city`, `price` |
| Ranking metric planned for later search | Cosine distance, `<=>`, ascending (smallest distance first) |

**Decision boundary:** 1536 is a **planned contract**, not a measured property of a selected provider. Before executing the migration, select and verify a model that outputs exactly 1536 values. If a different model is selected, revise **both** this plan and the data-model document together *before* running SQL. Do not silently use a different dimension.

**Existing schema caution:** `properties` is the target name for this tutorial. Prior PREIshare planning also mentions `property_listings` and different owner/sponsor identifiers. Inspect the deployed schema and existing Row Level Security (RLS) policies before altering anything. Do not rename an existing live table, replace its primary key, or bypass RLS merely to fit this plan. Resolve any mismatch explicitly before migration.

## Ordered migration steps (goals, not executable SQL)

| Order | Step | Why this order? | Verification evidence |
| --- | --- | --- | --- |
| 0 | Inspect the deployed schema and RLS. Confirm `properties`, its `id`, `title`, `description`, and existing ownership rules. Confirm the selected embedding model produces **1536** numbers. | Prevents modifying the wrong table or choosing an incompatible vector size. | Schema inspection and model-dimension confirmation recorded; stop if the contract differs. |
| 1 | Enable the PostgreSQL `vector` extension (pgvector) in the Supabase database. | The vector data type and distance operators must exist before adding a vector column. | Extension catalog shows `vector` installed. |
| 2 | Create or alter the agreed `properties` table as appropriate, preserving existing `id` uniqueness, ownership relationships, and RLS. Add a separate nullable `embedding` column of type `vector(1536)`. Keep `title` and `description` readable. | The extension must exist before the column can use its type. Nullable embeddings allow future backfill without breaking existing listings. | Schema inspection shows `properties.embedding` as `vector(1536)`; `id` remains unique; existing RLS remains enabled. |
| 3 | **Optional:** consider a cosine-compatible vector index only if the demo dataset or measured performance justifies it. Default: **no approximate index** for a small sample. | Indexes depend on the existing vector column and chosen operator; a small demo is easier to validate with exact scans. | Record either “no index needed for demo” or the index name, operator class, and reason. |
| 4 | Run schema-only verification queries and record the results. | Confirms the extension and table contract before any separate seeding or search work begins. | Results of the checks below, including any failures. |

## Similarity operator choice and tradeoffs

For a **later** query/search step, start with cosine distance (`<=>`) if the chosen embedding model supports it. **Smaller distance ranks better**, so order ascending. This is a planned choice, not an implemented SQL function.

- **Cosine distance:** emphasizes direction/semantic orientation rather than vector magnitude; suitable as a starting candidate for text embeddings.
- **L2/Euclidean distance:** compares absolute numerical distances; results can differ if vector magnitudes vary.
- **Inner product:** may be recommended for certain normalized embedding models; its interpretation and operator class differ.

Any future vector index must use an operator class compatible with the chosen metric. Do not add a search function or API in this migration step.

## Index recommendation for the demo

Start with **no HNSW or IVFFlat index** for a small sample set. Exact scans are simpler and make it easier to inspect ranking later. Revisit indexing only after observing actual data volume and query latency. If an index is justified, document its operator class (for cosine, `vector_cosine_ops`) and tradeoffs; it remains optional here.

## Environment variable names (names only; no values)

| Variable name | Intended use | Exposure boundary |
| --- | --- | --- |
| `SUPABASE_URL` | Supabase project endpoint for server-side setup/administration, if required by tooling | Server-side configuration |
| `DATABASE_URL` | Database connection for authorized migrations, if that workflow is used | **Server-only**, never in browser code |
| `SUPABASE_SECRET_KEY` | Privileged Supabase server credential if the existing project requires it | **Server-only**; do not use it as a substitute for database migration permissions |
| `EMBEDDING_PROVIDER_API_KEY` | Future embedding generation (not used in this migration step) | **Server-only** |
| `VITE_SUPABASE_URL` | Existing browser-safe Supabase endpoint naming, if used by the app | Public client configuration |
| `VITE_SUPABASE_ANON_KEY` | Existing browser-safe public/anon key naming, if used by the app | Public client configuration, still subject to RLS |

These are **variable names**, not credential values. Do not paste actual secrets into documentation, Git, or browser bundles. The actual migration tool may need only `DATABASE_URL` or a separately authenticated Supabase CLI session; do not require every variable merely because it appears here. Follow the existing project's environment-variable checklist.

## Verification queries: goals and expected results

These are **checks to run later**, not claims that the migration has executed:

1. **Extension check:** query PostgreSQL's installed extensions catalog; expect extension `vector`.
2. **Table check:** inspect the schema for table `properties`; expect it to exist as the agreed target, or stop and resolve the live-schema mismatch.
3. **Column check:** inspect `properties.embedding`; expect pgvector type **`vector(1536)`**, nullable at this migration stage.
4. **Text check:** inspect `properties.title` and `properties.description`; expect readable text fields, unchanged by the vector addition.
5. **Identifier check:** inspect primary-key/unique constraints; expect stable, unique `properties.id` and no conflicting second identifier.
6. **Access check:** inspect RLS enablement and existing policies; expect no broadened anonymous or cross-sponsor access as a side effect of the migration.
7. **Optional index check:** inspect index definitions only if an index was created; expect a cosine-compatible operator class for cosine ranking.

Record actual outputs and failures in the subsequent migration verification notes. No real vector rows or semantic-ranking results are required to pass this **schema-only** step.

## Explicitly out of scope for this migration step

- **Seeding sample property listings**, generating embeddings, or backfilling null embeddings
- Embedding provider integration, model API calls, retries, and billing
- SQL similarity search functions, `match_properties` helpers, ranking thresholds, and top-K implementation
- **Search API routes, React search UI**, or end-to-end search tests
- Map search, filters, payments, messaging, and production-scale vector tuning
- Replacing or weakening existing authentication and RLS

Those belong to later tutorials. Here the ordered work stops at **extension → vector column → optional index → schema verification**.

## Handoff and completion checklist

- [ ] Confirm the actual `properties` schema and preserve existing RLS.
- [ ] Verify a chosen embedding model outputs **1536** values, or update both contract docs before migration.
- [ ] Enable `vector` extension.
- [ ] Add nullable `properties.embedding` as `vector(1536)` without changing ownership or `id` uniqueness.
- [ ] Record the no-index decision (or justify a compatible index).
- [ ] Run and record schema-only verification checks.
- [ ] Keep seeding/backfill and UI/API implementation for later steps.

**Status:** Documentation plan only. No migration or database verification is claimed complete.
