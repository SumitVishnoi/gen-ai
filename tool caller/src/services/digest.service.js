import searchService from "./search.service";

const articles = await searchService.search(
    "Latest AI, React and Node.js news today"
);

console.log(articles);