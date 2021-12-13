const myHeaders = new Headers();
myHeaders.append("Authorization", `Client-ID ${process.env.APIKEY}`); // Unsplash API Key
const requestOptions = {
  method: "GET",
  headers: myHeaders,
  redirect: "follow",
};

export default function handler(req, res) {
  if (!req.query.user || !req.query.page || !req.query.per_page)
    res.status(400).end("Please provide all parameters");
  return new Promise((resolve) => {
    fetch(
      `https://api.unsplash.com/users/${req.query.user}/photos?page=${req.query.page}&per_page=${req.query.per_page}&order_by=latest`,
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
