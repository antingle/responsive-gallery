import PageLoader from "next/dist/client/page-loader";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import Masonry from "react-masonry-css";
import Loader from "../components/Loader";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [data, setData] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.addEventListener("scroll", scrolling_function);
  }, []);

  useEffect(() => {
    setLoading(true);
    let myHeaders = new Headers();
    myHeaders.append(
      "Authorization",
      "Client-ID EUfSGhtJ1MMxbtYvals9hmM1p6mRdiGXw6k77oHT5eo"
    );

    let requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch(
      `https://api.unsplash.com/photos?page=${pageNumber}&per_page=20&order_by=popular`,
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => {
        setData([...data, ...JSON.parse(result)]);
        setLoading(false);
        window.addEventListener("scroll", scrolling_function);
      })
      .catch((error) => console.log("error", error));
  }, [pageNumber]);

  const scrolling_function = () => {
    if (
      window.innerHeight + window.scrollY >=
      document.body.offsetHeight - 10
    ) {
      setPageNumber(++pageNumber);
      window.removeEventListener("scroll", scrolling_function);
    }
  };

  const imageOverlay = (event) => {
    console.log(event.target);
    event.target.setAttribute(
      "class",
      event.target.getAttribute("class") + " overlay"
    );
  };

  return (
    <div>
      <Head>
        <title>My Gallery</title>
        <meta name="description" content="Cool" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {data[6] != null && (
        <div className={styles.mainContainer}>
          <Image
            key={data[6]?.id}
            layout="fill"
            placeholder="blur"
            blurDataURL={data[6]?.urls?.small}
            src={data[6]?.urls?.full}
            objectFit="cover"
            quality={100}
            className={styles.mainImage}
          />
          <header className={styles.mainHeader}>
            <h1 className={styles.mainHeading}>Jane's Graduation</h1>
            <time className={styles.time}>November 23rd, 2021</time>
            <button
              className={styles.mainButton}
              onClick={() =>
                scrollTo({
                  top: innerHeight,
                  behavior: "smooth",
                })
              }
            >
              Open
            </button>
          </header>
        </div>
      )}

      <Masonry
        breakpointCols={{ default: 4, 1100: 3, 700: 2, 500: 1 }}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {data.map((photo) => (
          <div>
            <Image
              key={photo?.id}
              onClick={imageOverlay}
              className={styles.image}
              height={photo?.height}
              width={photo?.width}
              placeholder="blur"
              blurDataURL={photo?.urls?.thumb}
              src={photo?.urls?.regular}
              objectFit="cover"
              quality={75}
            />
          </div>
        ))}
      </Masonry>
      <Loader />
    </div>
  );
}
