PREIshare semantic search — pgvector setup plan
Goals and status
Plan a safe, beginner-friendly Supabase PostgreSQL setup for a small PREIshare semantic-search demonstration. Property title and description will be combined and sent to an embedding model; its fixed-length numeric output will be stored in a separate embedding vector column. Later, a buyer query will be embedded using the same compatible model and compared with stored vectors to rank authorized properties.

Status: Planning only. No migration, live schema inspection, extension installation, embedding generation, or verification query is claimed as completed.

Source contract: [`embedding-data-model.md`](embedding-data-model.md). Its proposed logical fields are id, title, description, optional city, optional price, and embedding. The vector size remains DIMENSION_TODO. This is deliberately not executable SQL: choose an embedding model, confirm its output size, and replace the placeholder consistently before implementation. Do not assume these proposed names already exist in the deployed database.
Decisions to confirm before writing a migration
1. Inspect the actual deployed property table, primary key, owner/sponsor relationship, existing columns, and RLS policies. Earlier planning mentioned properties.owner_id versus property_listings.sponsor_id; neither is authoritative until verified.
2. Choose whether to extend the existing RLS-protected property table or use a separately permissioned sample table. Do not duplicate or weaken ownership rules.
3. Select the embedding provider and model; record its exact output dimension as the replacement for DIMENSION_TODO in the model, migration, and application helper.
4. Confirm which sample listings may be visible to which users, how many samples to seed, and how to handle weak matches.
Ordered setup and migration plan
Order	Action	Why it happens in this order	Evidence to collect
0	Inspect schema, RLS, sample-data permissions, and selected embedding model. Resolve DIMENSION_TODO before running SQL.	Avoids targeting a nonexistent table, selecting the wrong owner field, or declaring a vector length incompatible with the model.	Recorded actual table/column names, model, dimension, and policy review.
1	Enable the PostgreSQL pgvector extension in the appropriate Supabase schema.	PostgreSQL must support the vector type and operators before the vector column or related search logic is created.	Extension appears in the database extension catalog.
2	Create or alter the chosen property table while preserving its current identifiers and RLS. Ensure readable title and description are available; add a separate embedding vector column with the confirmed model dimension.	The storage location must exist before vectors can be written or compared. Existing sponsor access controls must survive the change.	Table and column inspection confirms the actual schema and correct vector size.
3	Seed a small, permitted sample set and generate/backfill embeddings using the selected model. Embed title followed by a newline and description; use the same model for later buyer queries.	A search cannot rank meaningful examples until valid vectors are stored. Keep embedding nullable during backfill and exclude null vectors from ranking.	Counts of total samples, embedded samples, missing embeddings, and generation failures.
4	Decide whether to add a vector index after testing exact search on the sample data.	Small demo datasets may not benefit from approximate indexing, which adds setup and tuning decisions.	Documented no-index decision or measured reason for an index.
5	Run schema, access-control, and search verification queries; record results and failures.	Checks must run against the actual schema and populated vectors, not hypothetical columns.	Extension/column checks, null counts, authorized ranking tests, and cross-sponsor denial tests where applicable.


Null embeddings, uniqueness, and refresh
- id remains a stable unique property identifier; preserve the existing primary-key type and relationships.
- title and description are nonempty for demo records. city and price are optional display fields, not part of the initial embedding input.
- embedding may be NULL during initial seeding/backfill. Do not substitute a zero vector for a missing embedding.
- After successful backfill, search-ready demo listings must have an embedding. Add database-wide NOT NULL only if every row in the chosen table must be search-ready and has been backfilled; otherwise enforce readiness for the demo subset.
- If title or description changes, mark the stored vector stale and regenerate it before treating that record as search-ready.
Similarity operator and ranking choice
Proposed starting point: cosine distance, provided it is compatible with the selected model. In pgvector, the cosine-distance operator is <=>: smaller distance means a closer match, so rank ascending by distance. If the UI shows a derived similarity score such as 1 - cosine_distance, larger similarity means a closer match. Do not accidentally reverse the order.

Tradeoffs to document before implementation:
- Cosine distance: compares direction rather than raw magnitude; a reasonable starting option for many text-embedding models, but verify model guidance.
- Euclidean/L2 distance: considers absolute numerical distance; rankings may differ when vector magnitudes differ.
- Inner product: can be useful for normalized vectors or models that recommend it; operator and sort interpretation must be verified rather than assumed equivalent to cosine.
For the first demo, choose one metric consistently across search queries, result labels, tests, and any future index operator class. This is a recommendation, not a finalized model-specific decision.
Index recommendation for a small demo
Start without an approximate vector index and use an exact scan for the small sample dataset. This makes results easier to inspect and avoids approximate-search tradeoffs. If the dataset or measured latency grows, evaluate an appropriate pgvector index (such as HNSW) and match its operator class to the chosen distance metric. Document any changes in recall, speed, index build cost, and maintenance. Do not add an index merely because pgvector is enabled.
Environment variables and credential boundaries
- Keep the Supabase project URL and browser-safe public/anon key in the project's existing public-client configuration only where required.
- Keep embedding-provider credentials and any privileged Supabase server credential server-side; never place them in VITE_ client-exposed variables, browser bundles, screenshots, committed .env files, or this plan.
- Use placeholder variable names, not real values, in setup documentation. Confirm the existing PREIshare environment-variable checklist and actual app conventions before naming or adding new variables.
- A public/anon key is not a substitute for RLS. The similarity-search path must enforce the same authorization boundaries as ordinary property reads.
Verification queries and expected observations (query goals, not full SQL)
Check	Query or inspection goal	Expected observation
Extension	Inspect installed PostgreSQL extensions for vector.	pgvector is installed in the intended database.
Schema	Inspect the chosen table's primary key, title, description, embedding, and actual vector dimension.	Fields match the confirmed live schema and selected model dimension, replacing DIMENSION_TODO.
Uniqueness	Check duplicate property IDs and primary-key constraints.	Each property has one stable unique identifier.
Backfill	Count rows with null versus non-null embedding, and inspect vector lengths where supported.	Search-ready demo rows have non-null, correctly sized vectors; failures are recorded.
Text composition	Inspect the input-building rule used by the embedding helper.	Each property vector represents title + newline + description, not city/price/id.
Ranking	Embed a buyer query using the same model; compare it with stored vectors using the selected distance operator, order best first, and limit to top-K.	Waterfront, family, and downtown queries return meaningfully relevant eligible sample listings; record actual ranks rather than assuming them.
Near-miss control	Search for large-scale farmland against a cabins/condos-only sample set.	The top result is not automatically called relevant; document whether a threshold or no-match state is needed.
Authorization	Test as signed-out, Sponsor A, and Sponsor B where the live data model requires sponsor-specific visibility.	No private listings leak across accounts; a server-side search function does not bypass RLS.
Secret hygiene	Review server/client imports, env handling, and compiled browser assets without exposing secret values.	No privileged credentials in browser assets or repository.


Important: These are proposed verification checks, not evidence of passing tests. The actual SQL will be written after the schema, embedding model, and permissions are confirmed.
Explicitly out of scope
- Full SQL migrations, production application code, and final TypeScript search helpers in this planning document
- Production-scale embedding jobs, billing/rate-limit operations, and large-scale index tuning
- Map search, price/bedroom filters, hybrid ranking, personalization, payments, or messaging
- New authentication features or any change that weakens existing RLS
- Claims of guaranteed rental returns, school quality, or investment suitability
Open questions and handoff
1. What property table, owner field, and RLS policies actually exist in the deployed Supabase project?
2. Which embedding model is selected, and what exact number replaces DIMENSION_TODO everywhere?
3. Does the model recommend cosine distance, L2, or inner product?
4. Are sample listings public, sponsor-restricted, or isolated in a demo table?
5. How many sample properties and what top-K limit should be used?
6. How will the UI distinguish a weak best-ranked result from a genuinely relevant match?
7. Is any database-wide NOT NULL constraint safe after backfill, or only a search-ready subset rule?
Next step: Confirm the live schema, embedding model, and access rules; then implement the migration in the documented order and attach actual verification output. Keep [`semantic-search-requirements.md`](semantic-search-requirements.md), [`embeddings-learner-notes.md`](embeddings-learner-notes.md), and [`vector-search-learner-notes.md`](vector-search-learner-notes.md) available when testing the example queries.
