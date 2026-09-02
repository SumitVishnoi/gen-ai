const { tavily } = require("@tavily/core");

const tvly = tavily({ 
    apiKey: process.env.TAVILY_API_KEY
});
const response = await tvly.search("Who is Leo Messi?");

export default tvly