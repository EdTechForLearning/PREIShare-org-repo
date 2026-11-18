PREIshare semantic search — requirements brief
Problem
PREIshare buyers discover investment properties by describing lifestyle and investment intent in everyday language. Keyword search only matches exact words in listing text, so queries like “quiet cabin near water with good rental upside” can miss strong matches when those words never appear together. This tutorial will add a small semantic search demonstration: represent property descriptions as meaning-aware vectors, store them in Supabase PostgreSQL with pgvector, and rank sample listings by similarity. The goal is to demonstrate relevant discovery, not to claim production-ready search quality.
Actors
Actor	Goal
Property buyer / investor	Find listings that match their intent, even when the wording differs
PREIshare operator (us)	Demonstrate credible matches using a small sample dataset and document the results
Coding agent (assistant)	Implement migrations, embedding helpers, and a simple interface only within the approved scope


Who is searching, what they need, and why keywords fall short
A property buyer or investor searches using descriptions of lifestyle, location, and investment potential rather than exact listing titles. They want properties whose features mean the same thing as their query. Exact keyword matching may miss a waterfront retreat described as a “lakeside getaway” when the buyer asks for a “cabin near water,” or a property described as “steps from cafes” when the buyer asks for somewhere “walkable to restaurants.” Semantic search should make these relevant alternatives easier to discover.
Example queries (must drive later tests)
Query	What a good top result looks like	Keyword-search limitation
“quiet cabin near water with good rental upside”	A peaceful lakeside or waterfront retreat with a description suggesting vacation-rental appeal, even if it never says “cabin”	A listing may use “retreat,” “lakefront,” or “short-term rental potential” instead
“family-friendly home close to good schools”	A residential property described as suitable for families and near schools or neighborhood amenities	The listing may say “near elementary campus” or “great for growing households” instead
“downtown condo walkable to restaurants”	An urban apartment or condominium within walking distance of dining and city amenities	The description may use “city-center flat,” “cafes,” or “dining district” instead
“pure farmland for large-scale crop production” (near-miss control)	If the sample set contains only cabins, homes, and condos, no listing should be presented as a convincing farmland match; any returned results should be identified as weak or unrelated	Similarity ranking always has a highest result, even when none is genuinely relevant


Success criteria (observable)
- [ ] A small set of sample properties has readable descriptions and stored embedding vectors.
- [ ] A natural-language query returns a list ordered by similarity, with the strongest match first.
- [ ] For the “quiet cabin near water” query, a lakeside or waterfront sample listing appears among the leading results even when its description does not contain the word “cabin.”
- [ ] For the family-friendly query, a suitable family-oriented sample property ranks ahead of unrelated downtown or retreat listings.
- [ ] For the downtown condo query, a walkable urban sample property ranks ahead of unrelated rural listings.
- [ ] The farmland near-miss is checked explicitly; the demonstration does not describe an unrelated result as a strong match simply because it ranks first.
- [ ] A beginner can explain, using one actual sample listing, why exact keyword matching could miss a relevant result.
- [ ] A reviewer can reproduce the example searches and record the returned order and observations.
- [ ] Later implementation and documentation stay within the scope defined below.
These are demonstration checks, not a guarantee of accuracy across every possible query. Any relevance threshold or “no good match” behavior must be chosen and tested during later design work.
In scope for this tutorial
- Beginner-friendly explanation of embeddings and vector similarity in later steps
- Property description and vector-storage design compatible with Supabase PostgreSQL and pgvector
- Database migration to enable pgvector and store vectors
- TypeScript helper to generate embeddings for property text
- Small sample dataset with a seed or backfill path
- Similarity-search SQL and a TypeScript helper
- Minimal API route and simple React search page using TanStack Start
- End-to-end checks using the four example queries and a concise handoff document
Out of scope (explicit non-goals)
- Production-scale embedding billing, rate limits, operational pipelines, or large batch processing
- Map search, price or bedroom filters, or new authentication, payment, and messaging features
- Personalized ranking, complex business rules, or advanced hybrid keyword/vector tuning
- Perfect visual polish or a native mobile app
- Claims that the demonstration is production-ready or that similarity ranking guarantees a correct match
Existing PREIshare access controls must not be weakened by this search demonstration, even though building new authentication features is out of scope.
Assumptions and open questions
Working assumptions
- A free-tier Supabase project can support the small demonstration dataset; this must be confirmed during setup.
- Sample descriptions will be available and appropriate to use for a classroom demonstration.
- The embedding model and its vector size will be selected later and used consistently throughout the implementation.
Questions to resolve in later design steps
1. Which embedding provider and model should the project use?
2. What vector size and similarity or distance metric will be used?
3. How many sample properties are needed to make the example queries meaningful?
4. How will the demonstration distinguish a weak match from a useful match, especially for the farmland control query?
5. Should the search use public demo listings only, or must it honor existing sponsor-specific visibility rules? Confirm this before exposing any data.
6. How will changes to sample descriptions trigger embedding updates in the small demo?
No database column names, embedding dimensions, or provider credentials are specified in this requirements brief; those belong in subsequent design and implementation steps.
Handoff note for later steps
Every implementation step should be checked against the example queries, observable success criteria, and scope boundaries above. Capture the actual result order during verification. If a proposed feature falls outside this tutorial’s scope, defer it rather than expanding the implementation without approval.