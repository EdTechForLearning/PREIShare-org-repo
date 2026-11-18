PREIshare vector search — learner notes
Learning draft. Review the examples, add your own rough explanation, and edit any wording you cannot explain before committing. No real similarity scores or search results have been measured here.

Starting point: my understanding
Scratch response to complete in my own words before committing: After we have a query embedding and property embeddings, what does the system compare? What makes one listing the best match?

[Write two or three sentences here in your own words.]
Plain-language explanation
An embedding is a list of numbers representing the meaning of text, as described in [embeddings-learner-notes.md](embeddings-learner-notes.md). The embedding model generates a number list for the buyer's search using the same compatible model and process used for property descriptions. The search system compares the query's number list with the stored number lists for properties that the buyer is allowed to see. It ranks the most similar candidates first.

Keyword search vs. vector search: Keyword matching focuses on shared words. Vector similarity compares meaning represented by embeddings. A buyer might search for a “cabin by the lake,” while a listing says “rustic woodland retreat on the shoreline.” Exact wording differs, but the intent is close.

Top-K: The number of highest-ranked results returned, such as the top three. A result's rank does not guarantee relevance.

Similarity or distance score: A number describing how closely two embeddings compare. Some methods rank higher similarity scores first; others rank smaller distances first. We must check which method the implementation uses before deciding the sort direction. These notes do not choose a distance metric.
Example A: family-friendly home near good schools
Buyer query: “family-friendly home near good schools”
Expected rank	Invented listing description	Why
1 — strong	“Spacious three-bedroom residence on a calm street, a short walk from an elementary campus and playground.”	Closely fits family life and school proximity without repeating the exact query.
2 — partial	“Comfortable suburban townhouse with a shared play area and nearby parks.”	Fits family activities, but says nothing about schools.
3 — weak	“Compact city-center loft above a busy nightlife district.”	Little evidence of family amenities or school access.


A strict keyword search could miss the strongest listing because it uses “residence,” “elementary campus,” and “playground” rather than “family-friendly home” and “good schools.” Caution: “Near an elementary campus” does not establish school quality; that claim needs separate evidence.
Example B: same meaning, different words
Buyer query: “cabin by the lake”
Expected rank	Invented listing description	Why
1 — strong	“Rustic woodland retreat with a private shoreline and peaceful water views.”	“Rustic retreat” and “shoreline” suggest a lakeside cabin-like experience.
2 — partial	“Quiet country bungalow surrounded by trees and hiking trails.”	Matches the peaceful retreat idea but does not mention water.
3 — weak	“Modern downtown apartment beside shops and a commuter station.”	Different setting and lifestyle.


Keyword matching could overlook the strongest listing because it does not contain the exact words “cabin” or “lake.” Semantic search may recognize the related meaning, but the actual ordering must be tested after implementation.
Additional queries from the requirements brief
- “quiet cabin near water with good rental upside” should favor peaceful waterfront retreats with descriptions suggesting vacation-rental potential; similarity alone does not verify investment returns.
- “downtown condo walkable to restaurants” should favor a city-center flat near cafes or a dining district rather than a remote cottage.
- “pure farmland for large-scale crop production” is a near-miss control. If the sample set has no farmland, the highest-ranked result may still be a poor match. Do not label it relevant merely because it ranks first.
How generation, storage, and ranking fit together
1. Generate property embeddings: An embedding model/API converts property descriptions into number lists.
2. Store property embeddings: Supabase PostgreSQL with pgvector stores those number lists with their associated listings.
3. Generate a query embedding: The same compatible embedding setup converts the buyer's search text into a number list.
4. Compare eligible listings: The search function compares that query embedding with stored property embeddings, without bypassing existing access controls.
5. Rank and limit: Order candidates by the chosen similarity/distance method and return the requested top-K results with useful listing details.
Enabling pgvector does not generate embeddings. The model creates them; PostgreSQL stores and compares them.
Assessment questions for later SQL and TypeScript review
- [ ] Query generation: Does the helper generate a query embedding using the same model and compatible settings as the stored property embeddings?
- [ ] Stored vectors: Does the search compare the query embedding with actual stored property embeddings rather than only searching description keywords?
- [ ] Correct ordering: Does the SQL or helper sort in the correct direction for the chosen metric (highest similarity or lowest distance first)?
- [ ] Top-K: Is the requested result limit applied after appropriate visibility filtering and ranking?
- [ ] Useful results: Does each returned result include enough permitted listing information (such as title/description) and an interpretable rank or score to review why it appeared?
- [ ] Access controls: Does the search preserve PREIshare's existing listing visibility/RLS restrictions, including for unauthorized users?
- [ ] Missing vectors: What happens when a property has no embedding or a query embedding cannot be generated?
- [ ] Meaning-over-keywords test: Does “cabin by the lake” retrieve the shoreline retreat ahead of the downtown apartment, despite different words?
- [ ] Family test: Does the school-adjacent family residence rank ahead of the nightlife loft for the family-oriented query?
- [ ] Near-miss test: Does the farmland query avoid presenting an unrelated top result as a confirmed good match?
- [ ] Reproducibility: Can a reviewer run the same sample queries and record the actual returned order, scores (if available), and observations?
These are questions for reviewing future implementation, not claims that the current app passes.
Misconceptions to avoid
- A top-ranked result is not always relevant, especially when the dataset has no good match.
- A similarity score is not a verified statement about school quality, investment returns, or property features.
- Similarity ranking is not the same as keyword overlap.
- A database extension does not automatically create embeddings.
- Semantic similarity does not override authorization or RLS.
- These example rankings are human expectations, not measured results from a live vector search.
Open questions for the next design step
1. Which embedding provider and model will PREIshare use consistently for properties and queries?
2. Which similarity or distance method will be selected, and which sort direction does it require?
3. How many sample properties and how many top-K results will be useful for a demo?
4. How should weak matches or a “no convincing result” situation be communicated?
5. Will the search use public demonstration listings only, or existing sponsor-specific visibility rules?
6. How will updated property descriptions receive new embeddings?
Personal reflection — complete before committing
- My rough explanation of best match: [Write in your own words.]
- Why the family example ranks this way: [Explain without copying the table.]
- One difference between keywords and vectors I can explain: [Write here.]
- One question I still have: [Write here.]
Sources and scope
Based on [semantic-search-requirements.md](semantic-search-requirements.md) and [embeddings-learner-notes.md](embeddings-learner-notes.md). This is a learning and assessment document, not implementation code. No database columns, embedding dimensions, real similarity scores, or provider credentials are invented here.