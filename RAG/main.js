import { PDFParse } from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import fs from "fs";

let dataBuffer = fs.readFileSync("./story.pdf");

const parse = new PDFParse({
  data: dataBuffer,
});

const data = await parse.getText();

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 0,
});


const chunks = await splitter.splitText(data.text)

console.log(chunks)