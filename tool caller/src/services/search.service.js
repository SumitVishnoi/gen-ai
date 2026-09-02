import tvly from "../config/tavily";


class SearchService {
    async search(query) {
        try {
            const response = await tvly.search(query);

            return response.results;
        } catch (error) {
            console.error(error);

            throw new Error("Unable to fetch search results.");
        }
    }
}

export default new SearchService();