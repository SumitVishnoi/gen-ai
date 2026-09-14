import "dotenv/config";
import { PDFParse } from "pdf-parse";
import fs from "fs";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Pinecone } from '@pinecone-database/pinecone';
import { json, text } from "stream/consumers";

const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY
})

const index = pc.index("rag-practice")

// const dataBuffer = fs.readFileSync("./story.pdf");

// const parse = new PDFParse({
//   data: dataBuffer,
// });

// const data = await parse.getText();

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-embedding-001",
  outputDimensionality: 1024, 
});

// const splitter = new RecursiveCharacterTextSplitter({
//   chunkSize: 500,
//   chunkOverlap: 0,
// });
// const chunks = await splitter.splitText(data.text);

// console.log(chunks);

// const docs = await Promise.all(
//   chunks.map(async (chunk) => {
//     const embedding = await embeddings.embedQuery(chunk, {
//       output_dimensionality: 1024,
//     });
//     return {
//       text: chunk,
//       embedding,
//       dimensions: embedding.length 
//     };
//   }),
// );

// const result = await index.upsert({
//     records: docs.map((doc, i)=> ({
//         id: `doc-${i}`,
//         values: doc.embedding, 
//         metadata: {
//             text: doc.text
//         }
//     }))
// })

const queryEmbedding = await embeddings.embedQuery("how was the internship experience?")

console.log(queryEmbedding)

const result = await index.query({
    vector: queryEmbedding,
    topK: 2,
    includeMetadata: true
})


console.log(JSON.stringify(result));
