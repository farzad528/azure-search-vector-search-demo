import axios from "axios";

const apiUrl = process.env.REACT_APP_COGNITIVE_SERVICES_ENDPOINT;
const apiKey = process.env.REACT_APP_COGNITIVE_SERVICES_API_KEY;
const apiVersion = process.env.REACT_APP_COGNITIVE_SERVICES_API_VERSION;

function generateImageQueryVector(queryVector: string) {
  const requestData = {
    text: queryVector,
  };
  return axios
    .post(
      `${apiUrl}/computervision/retrieval:vectorizeText?api-version=${apiVersion}`,
      requestData,
      {
        headers: {
          "Content-Type": "application/json",
          "Ocp-Apim-Subscription-Key": apiKey,
        },
      }
    )
    .then((response) => {
      const embeddings = response.data.vector;
      console.log(embeddings);
      return embeddings;
    })
    .catch((error) => {
      console.error(error);
    });
}

export default generateImageQueryVector;
