import stream from "stream";
import { promisify } from "util";
const pipeline = promisify(stream.pipeline);

const myHeaders = new Headers();
myHeaders.append("Authorization", `Client-ID ${process.env.APIKEY}`); // Unsplash API Key
const requestOptions = {
  method: "GET",
  headers: myHeaders,
  redirect: "follow",
};

export default function handler(req, res) {
  return new Promise((resolve) => {
    fetch(req.query.url, requestOptions)
      .then((response) => response.json())
      .then(async (result) => {
        const image = await fetch(result.url);
        res.setHeader("Content-Type", "image/jpg");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=${req.query.name}.jpg`
        );
        await pipeline(image.body, res);
        res.status(200);
        return resolve();
      });
  });
}
