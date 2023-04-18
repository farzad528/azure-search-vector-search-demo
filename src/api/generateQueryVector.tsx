import axios from "axios";

const apiUrl = `https://${process.env.REACT_APP_OPENAI_SERVICE_NAME}.openai.azure.com`;
const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
const deploymentName = process.env.REACT_APP_DEPLOYMENT_NAME;
const apiVersion = process.env.REACT_APP_OPENAI_API_VERSION;

function generateQueryVector(queryVector: string) {
  const requestData = {
    input: queryVector,
  };
  return axios
    .post(
      `${apiUrl}/openai/deployments/${deploymentName}/embeddings?api-version=${apiVersion}`,
      requestData,
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
      }
    )
    .then((response) => {
      const queryVector = response.data.data[0].embedding;
      return queryVector;
    })
    .catch((error) => {
      console.error(error);
    });
}

export default generateQueryVector;
