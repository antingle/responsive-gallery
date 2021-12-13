const myHeaders = new Headers();
myHeaders.append("Authorization", `Client-ID ${process.env.APIKEY}`); // Unsplash API Key
const requestOptions = {
  method: "GET",
  headers: myHeaders,
  redirect: "follow",
};

export default function handler(_, res) {
  return new Promise((resolve) => {
    fetch(
      `https://api.unsplash.com/photos/random?orientation=landscape`,
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => {
        const resultJson = JSON.parse(result);
        res.status(200).json(resultJson);
        return resolve();
      })
      .catch((error) => res.status(500).json(error));
  });
}
