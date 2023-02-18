import cohere from "cohere-ai";
import * as dotenv from "dotenv";
import getAPIKey from "./api-key.js";
dotenv.config();

function filterMatchedCommitFormats(commit) {
    return commit.match(/^(feat|fix|docs|style|refactor|perf|test|chore|revert|build|ci|release)(\([a-z]+\))?:\s[a-z]/i)
}
const COHERE_API_KEY = getAPIKey();
cohere.init(COHERE_API_KEY);

async function getImprovedCommits(commit) {
    const response = {}
    let cohereResponse;
    try {
        cohereResponse = await cohere.generate({
            model: "xlarge",
            prompt: `
            Write an insightful but concise Git commit message in a complete sentence in the present tense and imperative, applying conventional commit rules..
            --
            Incorrect commit format: updated the changelog to beta.5
            Correct commit format: docs: update changelog to beta.5
            --
            Incorrect commit format: Added the amazing button
            Correct commit format: feat: add the amazing button
            --
            Incorrect commit format: The endpoint of the list of tickets has been removed.
            Correct commit format: feat: remove ticket list endpoint
            --
            Incorrect commit format: The payment system error has been fixed.
            Correct commit format: fix: payment system error
            --
            Incorrect commit format: RTL content will now be rendered correctly.
            Correct commit format: fix: add support for RTL languages.
            --
            Incorrect commit format: fixed bug on landing page
            Correct commit format: fix: landing page bug
            --
            Incorrect commit format: changes to the readme file
            Correct commit format: docs: update readme file
            --
            Incorrect commit format: added a new feature
            Correct commit format: feat: add new feature
            --
            Incorrect commit format: formating code
            Correct commit format: style: format code
            --
            Incorrect commit format: the readeability of the code has been improved
            Correct commit format: refactor: improve code readability
            --
            Incorrect commit format: added new tests to the project
            Correct commit format: test: add new tests
            --
            Incorrect commit format: Improved the performance of the app
            Correct commit format: perf: improve app performance
            --
            Incorrect commit format: A first approach to improve the checkout process
            Correct commit format: feat: improve checkout process
            --
            Incorrect commit format: The code has been formatted
            Correct commit format: style: format code
            --
            Incorrect commit format: add favicon
            Correct commit format: feat: add favicon
            --
            Incorrect commit format: update environment variables
            Correct commit format: docs: update environment variables
            --
            Incorrect commit format: The api url has been changed
            Correct commit format: feat: change api url
            --
            Incorrect commit format: critical error fix
            Correct commit format: fix: critical error
            --
            Incorrect commit format: Carousel improvements and bug fixing
            Correct commit format: feat: improve carousel and fix bugs
            --
            Incorrect commit format: Improve the carousel on mobile
            Correct commit format: feat: improve carousel on mobile
            --
            Incorrect commit format: The settings has been changed to improve the performance
            Correct commit format: feat: change settings to improve the performance
            --
            Incorrect commit format: The problem was generated by the function "foo"
            Correct commit format: fix: improve function "foo" to fix the bug
            --
            Incorrect commit format: endpoint to check if user is a publication member
            Correct commit format: feat: add endpoint to check if user is a publication member
            --
            Incorrect commit format: endpoint to check if user is a publication member
            Correct commit format: feat(api): add endpoint to check if user is a publication member
            --
            Incorrect commit format: delete code
            Correct commit format: refactor: delete code
            --
            Incorrect commit format: adding more features
            Correct commit format: feat: add more features
            --
            Incorrect commit format: additional features
            Correct commit format: feat: add more features
            --
            Incorrect commit format: fix: added authorization for document access
            Correct commit format: fix: add authorization for document access
            --
            Incorrect commit format: I've added a delete route to the accounts controller
            Correct commit format: feat: add delete route to accounts controller
            --
            Incorrect commit format: ${commit}
            Correct commit format: `.trim(),
            max_tokens: 40,
            temperature: 0.5,
            frequency_penalty: 0.8,
            stop_sequences: ["--"],
            end_sequences: ["--", "\n"],
            truncate: "END",
            num_generations: 5,
        });

        if (cohereResponse.statusCode !== 200) {
            throw new Error(cohereResponse.body.message);
        }

        const suggestedCommits = cohereResponse?.body?.generations?.map((generation) => generation.text.trim())
                .filter(filterMatchedCommitFormats)
                .filter((value, index, self) => self.indexOf(value) === index);
            
                response.data = suggestedCommits

    } catch (error) {
        response.error = error.message;
    }

    return response
}




export default getImprovedCommits