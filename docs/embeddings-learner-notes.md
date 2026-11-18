PREIshare embeddings — learner notes
Draft for personal review. Rewrite these explanations in your own words and add what you learned from the quiz before committing.

Plain-language definition
An embedding is a list of numbers that represents the meaning of a piece of text. For PREIshare, a property description or buyer's search can be converted into an embedding. Comparing those number lists can help find properties with similar ideas even when the words are different.

A semantic search result is a possible match, not proof that a property meets every buyer requirement.
Toy number example
These numbers are invented to illustrate the idea; they are not real model output.
Text	Made-up number list
Peaceful lakeside getaway	[0.90, 0.80, 0.20]
Secluded waterfront cottage	[0.88, 0.82, 0.25]
Busy downtown loft	[0.10, 0.20, 0.95]


The first two lists look more alike in this toy example because the descriptions have similar meanings. Real embeddings contain many numbers, and each number does not have a simple label such as “water” or “quiet.” The comparison method will be chosen in a later design step.
PREIshare property-search examples
Buyer query: “quiet cabin near water with good rental upside”
- Property A: “A peaceful wooded getaway overlooking a lake, with strong potential for vacation rentals.” This sounds relevant because it suggests quiet surroundings, water, and possible rental income without repeating the word “cabin.”
- Property B: “A secluded holiday home beside the shoreline, ideal for short-term guest stays.” This also sounds relevant because it describes a calm waterside property with guest-rental appeal.
- Contrast: “A busy downtown loft steps from restaurants and nightlife.” This is probably a weaker match for the cabin query, although it could fit the separate query “downtown condo walkable to restaurants.”
Other searches from the requirements brief:
- “family-friendly home close to good schools” should favor a family-oriented property near schools over unrelated downtown or retreat listings.
- “downtown condo walkable to restaurants” should favor a city-center property near dining, even if its description says “flat” or “cafes.”
- “pure farmland for large-scale crop production” is a near-miss test. If the sample data contains no farmland, the top-ranked result should not automatically be called a good match.
Generation versus storage
1. Generation: An embedding model or API reads the buyer query or property description and produces a number list.
2. Storage: Supabase PostgreSQL, using pgvector, saves the generated property embeddings alongside the appropriate property data.
3. Search: The buyer's query is also embedded. A similarity search compares that query embedding with stored property embeddings and orders candidate listings by similarity.
4. Access protection: Search results must respect PREIshare's existing data-visibility rules. A high similarity score does not grant permission to view a private listing.
Important distinction: Installing pgvector does not automatically generate embeddings. The model generates them; the database stores and compares them.
Misconceptions to watch for
- “Embeddings are just keywords.” No. They can capture related meanings across different wording, though they can still make mistakes.
- “The database invents the number lists.” No. An embedding model creates them; the database stores them.
- “The first result must be relevant.” No. A search can rank an unrelated listing first if there are no good matches. The farmland query helps test this problem.
- “Similar meaning proves every fact is true.” No. A listing that sounds like a good investment is not verified to have strong returns.
- “Semantic search replaces security.” No. Existing property access restrictions still apply.
- “The toy numbers are actual embeddings.” No. They are only a teaching example.
Open questions for the next design step
1. Which embedding provider and model should PREIshare use?
2. How many numbers will each embedding contain, and how will that choice remain consistent?
3. Which similarity or distance method will we use?
4. How many sample properties will make the four test queries meaningful?
5. How should the demo handle a query with no genuinely relevant property?
6. Will the demo search only public sample properties, or must it filter by sponsor access?
7. How will we regenerate an embedding when a property description changes?
My quiz reflection — complete before committing
- My own definition of an embedding: [Rewrite in your own words.]
- Generation vs. storage, in my own words: [Explain who creates and who saves the numbers.]
- One thing I misunderstood or confirmed during the quiz: [Add after answering the quiz.]
- One PREIshare example I can explain without notes: [Add your example.]
Source and scope
Based on [`semantic-search-requirements.md`](semantic-search-requirements.md). These are learning notes, not implementation code. Database column names, embedding dimensions, provider credentials, and final search behavior will be decided and tested later.