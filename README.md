# Vector Search Demo with Azure Cognitive Search

This repository contains a React application that showcases a Vector Search Demo using Azure Cognitive Search. The demo leverages OpenAI for text embeddings and Azure Cognitive Services Florence Vision API for image embeddings. 

## Features

- Generate text embeddings using OpenAI and insert them into a vector store in Azure Cognitive Search.
- Perform vector search queries on text data, including vector searches with metadata filtering and hybrid (text + vectors) search.
- Generate image embeddings using Azure Cognitive Services Florence Vision API.
- Perform vector searches from text to images and image to images (coming soon)

## Prerequisites

To run this demo locally, you will need the following:

- Node.js and npm installed on your machine.
- An Azure subscription with access to Azure Cognitive Search and Azure Cognitive Services.
- Access to Azure OpenAI for generating text embeddings.
- Access to Azure Cognitive Services Florence Vision API for generating image embeddings.

## Setup and Local Development

1. Clone this repository to your local machine.

2. Install the dependencies by running the following command in the project directory:
```
npm install
```

3. Create a `.env` file in the project directory and include the required environment variables (replace placeholders with your own values):

```plaintext
REACT_APP_OPENAI_SERVICE_ENDPOINT=xxx
REACT_APP_OPENAI_DEPLOYMENT_NAME=xxx
REACT_APP_OPENAI_API_VERSION=2023-03-15-preview
REACT_APP_OPENAI_API_KEY=xxx
REACT_APP_SEARCH_SERVICE_ENDPOINT=xxx
REACT_APP_SEARCH_SERVICE_NAME=xxx
REACT_APP_SEARCH_SERVICE_ADMIN_KEY=xxx
REACT_APP_SEARCH_IMAGE_INDEX_NAME=xxx
REACT_APP_SEARCH_TEXT_INDEX_NAME=xxx
REACT_APP_SEARCH_API_VERSION=2023-07-01-Preview
REACT_APP_COGNITIVE_SERVICES_API_KEY=xxx
REACT_APP_COGNITIVE_SERVICES_ENDPOINT=xxx
REACT_APP_COGNITIVE_SERVICES_API_VERSION=2023-02-01-preview
```

4. Start the React development server by running the following command:
```
npm start
```
This will start the application on http://localhost:3000.

## Usage
1. Open the application in your web browser.

2. The Vector Search Demo allows you to search for text queries by entering them in the search bar and pressing Enter. The application will generate text embeddings using OpenAI and perform vector searches on the data stored in Azure Cognitive Search.

3. The search results will be displayed as cards. Feel free to click on the settings icon to explore the different query approaches such as Hybrid Search and Hybrid Search with Semantic Ranking, Captions, and Highlights powered by Microsoft Bing. Note that you will need to enroll in a Semantic Plan in your Azure Cognitive Search service to use this feature. See [Semantic search](https://learn.microsoft.com/azure/search/semantic-search-overview).

## Deploying to Azure
To deploy this application to Azure, you can follow the steps outlined in the official [React deployment documentation](https://create-react-app.dev/docs/deployment/) to deploy it to services like Azure Static Web Apps, Azure App Service, or Azure Storage.

## Conclusion
I hope you find this repository useful for querying your multilingual index with semantic search. Feel free to explore and customize the code to meet your specific requirements.
If you have any questions or suggestions, please feel free to open an issue and I'll be happy to help.

Happy searching!

## References
[Azure Cognitive Search Documentation](https://learn.microsoft.com/azure/search/)
[Azure OpenAI Documentation](https://learn.microsoft.com/azure/cognitive-services/openai/)
[Azure Cognitive Services Computer Vision Documentation](https://learn.microsoft.com/azure/cognitive-services/computer-vision/)