PREIshare semantic search — embedding data model
Overview
This document proposes the small property-data contract for the PREIshare semantic-search tutorial. Buyers will describe the kind of investment property they want in everyday language. An embedding model will turn property listing text into a fixed-length list of numbers; Supabase PostgreSQL with pgvector will store that list separately from readable text. A later search step will compare a buyer-query embedding against eligible property embeddings and rank matches by meaning.

Design status: Proposed, not an implemented or verified migration. The existing PREIshare schema and sponsor-specific Row Level Security (RLS) policies must be inspected before choosing whether to extend an existing property table or use a separate demonstration table. No new access permissions are authorized by this document.
Property fields (proposed logical contract)
Field	Purpose	Nullability / rule	Used for embedding?
id	Stable unique property identifier	Required; unique; use the existing identifier type if extending the live table	No
title	Short, readable listing name	Required; nonempty for the sample dataset	Yes
description	Meaningful description of property features, setting, and rental appeal when supported	Required; nonempty for the sample dataset	Yes
city	Simple location context for display	Optional unless the existing schema requires it; do not invent location facts	No, in the initial demo
price	Optional sample asking-price display	Optional; if present, must be a valid nonnegative amount and use the project's existing money conventions	No
embedding	Generated numerical representation of the selected listing text	May be null during initial seeding/backfill; required for listings marked ready for semantic search	This is the stored vector


These are proposed logical names, not claims about columns already present. Before writing SQL, reconcile the contract with the actual database and naming conventions. If the current schema uses a different property table or ownership identifier, preserve its established relationships and access rules.
Embedding column details
- Storage: A pgvector-compatible vector field in Supabase PostgreSQL, separate from title and description.
- Fixed size: DIMENSION_TODO. This placeholder must be replaced with the exact output dimension of the selected embedding model before writing and running the migration. Do not guess a dimension or mix sizes.
- Generation: An embedding model or API produces the numbers. PostgreSQL/pgvector stores and compares them; enabling pgvector alone does not generate them.
- Consistency: Use the same model and compatible preprocessing for both property text and buyer queries. If the model changes, plan to regenerate stored vectors before comparing them with new queries.
- Comparison: The similarity/distance metric and sort direction are not decided yet. A later design step must select and test them.
- Indexing: An approximate-nearest-neighbor index is not required by this small classroom design; decide later based on actual sample size and performance.
Text that is embedded
For each property, concatenate the readable title and description in a consistent order with a clear separator, such as a newline. The same composition rule must be used for initial seeding and later updates.

Illustrative input text (not real embedding output):
Lakeside Retreat

A peaceful wooded getaway overlooking a lake, with strong potential for vacation rentals.

This helps the model capture both the listing's short label and its descriptive details. For the initial tutorial, do not embed id, price, or city. Price and city may still be displayed in results if present and permitted. A buyer's query is embedded as the buyer wrote it, using the same compatible model, rather than being saved as a property record.
Identifiers and relationships
- Every property must have a stable id so its readable details and embedding refer to the same listing.
- If extending an existing PREIshare property table, keep its current primary key, ownership relationship, and RLS policies. Do not introduce a second conflicting property identifier.
- If using a separate sample-data table, document how it is isolated from real sponsor data and which users may read it before deployment.
- The earlier project planning mentioned possible properties.owner_id versus property_listings.sponsor_id naming. Verify the actual deployed schema before creating migrations or joining tables; this design does not select either name as authoritative.
- Search must filter to properties the requester is allowed to see. A server-side similarity function must not bypass RLS or expose another sponsor's private listings.
Nullability and backfill rules
1. Seed or identify a small set of sample properties with valid id, nonempty title, and nonempty description.
2. During initial setup, allow embedding to be null while the embedding helper processes the sample text.
3. Generate and store one embedding per sample property using the chosen model and DIMENSION_TODO-sized output (after the placeholder has been replaced with the actual model dimension).
4. Exclude rows with null embeddings from similarity ranking until backfill succeeds; report their omission rather than treating them as valid zero vectors.
5. After a successful backfill, require non-null embeddings for the set of listings designated search-ready. A database-wide NOT NULL constraint is appropriate only if all rows in the chosen table are required to be search-ready and have been backfilled. Otherwise enforce readiness for the demo subset without breaking existing rows.
6. If title or description changes, mark the old embedding stale and regenerate it before treating the listing as search-ready again. The exact refresh mechanism is a later implementation decision.
7. If embedding generation fails, retain readable property data and record the failure for retry; do not fabricate an embedding.
How this supports the example searches
Buyer query	Relevant sample description	Expected meaning-based behavior
“quiet cabin near water with good rental upside”	“A peaceful wooded getaway overlooking a lake, with strong potential for vacation rentals.”	A waterfront retreat should appear among leading candidates even without the word “cabin.”
“family-friendly home close to good schools”	“Spacious three-bedroom residence on a calm street, a short walk from an elementary campus and playground.”	The family-oriented residence should rank ahead of an unrelated nightlife loft. Proximity does not prove school quality.
“downtown condo walkable to restaurants”	“City-center flat steps from cafes and a lively dining district.”	An urban listing should rank ahead of a remote cottage despite different wording.
“pure farmland for large-scale crop production”	No suitable farmland in a cabins/homes/condos-only sample set	The top-ranked candidate must not automatically be labeled relevant; weak/no-match behavior needs a later decision.


These are expected test cases, not measured rankings or promises of search quality.
Out of scope
- Final embedding provider, model, vector size, distance metric, and production API credentials
- Production-scale embedding jobs, provider billing/rate-limit operations, or large-data tuning
- Map search, price/bedroom filters, personalization, or hybrid keyword/vector ranking
- New authentication, payments, messaging, or changes that weaken existing RLS
- Full UI implementation, SQL migrations, or TypeScript code in this design document
- Claims that the demo establishes property quality, rental income, or investment returns
Open questions for the next implementation step
1. Which property table and identifiers actually exist in the deployed Supabase schema?
2. Should the demonstration search public sample listings only, or must it enforce sponsor-specific visibility? What existing RLS policies apply?
3. Which embedding provider/model will be used, and what actual dimension replaces DIMENSION_TODO?
4. Which distance/similarity metric and sort direction will the search use?
5. How many sample listings will cover the four required queries, and what top-K value will the demo use?
6. How will weak or irrelevant matches (especially the farmland control) be identified or labeled?
7. How will the seed/backfill process detect missing or stale embeddings and retry failures?
8. Is a database-wide NOT NULL vector constraint safe, or should only search-ready demo records require embeddings?
Implementation review checklist
- [ ] Confirm the live schema and ownership/RLS behavior before any migration.
- [ ] Keep readable title/description separate from the generated vector.
- [ ] Replace every DIMENSION_TODO with the selected model's real vector size, consistently.
- [ ] Embed title + description using a repeatable composition rule.
- [ ] Generate property and query embeddings with the same compatible model.
- [ ] Backfill the sample dataset and handle null/stale vectors explicitly.
- [ ] Compare only authorized listings and rank in the correct direction for the chosen metric.
- [ ] Check the waterfront, family, downtown, and farmland control queries and record actual results.
Sources
- [Semantic search requirements](semantic-search-requirements.md)
- [Embeddings learner notes](embeddings-learner-notes.md)
- [Vector search learner notes](vector-search-learner-notes.md)
This document is a proposed contract for the next tutorial steps, not proof that a migration, embedding job, or live search has run.