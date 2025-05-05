# Scratchpad Code

## GENERATE EMBEDDING
```
inputs = [
    "Hello World Test Test",
    "Are you alright?",
    "I am Gabriel Sidik",
    "I enjoy playing music instruments",
    "I code in C++ and Pascal"
    ]
model = "text-embedding-ada-002"
encoding_format = "float"

response = openai_client.embeddings.create(
    input=inputs, model=model, encoding_format=encoding_format
)

embeddings = [r.embedding for r in response.data]

print("Successfully Generated Embeddings for: ", inputs)
print("Number of embeddings: ", len(embeddings))
```

## INPUT NEW VECTOR
```
survey_id = "15839a26-7a4c-474c-adf0-61ddeb5e48fe"
uid = "0b211997-822d-4a87-a555-22fde1da75cc"

for embedding, input in zip(embeddings, inputs):
    supabase.table('answer-rag').insert(
        {
            "survey_id_fk": survey_id,
            "uid_fk": uid,
            "vector": embedding,
        "response": input,
        "question_id": "q_local_1746419841695_3scel"
    }
).execute()
```

## QUERY VECTOR through RPC
```
try:
    response = supabase.rpc('cosine_similarity_search_with_user',
        {
            'query_embedding': embedding,
            "user_id": WRONG_USER_ID,
            'match_count': 20
    }
    ).execute()
    
    if response.data:
        most_similar_documents = response.data
        print("Most similar documents:")
        for doc in most_similar_documents:
            print(f"Response: {doc['response']}, Similarity (Distance): {doc['similarity']}")
    else:
        print("No similar documents found - vector store may be empty")
except Exception as e:
    print(f"An unexpected error occurred: {e}")
```