import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import Masonry from "react-masonry-css";
import Loader from "../components/Loader";
import styles from "../styles/Home.module.css";
import smoothscroll from "smoothscroll-polyfill";

export default function Home() {
  const [data, setData] = useState([]);
  const [mainPhoto, setMainPhoto] = useState(null);
  const [username, setUsername] = useState(null);
  const [morePhotos, setMorePhotos] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    smoothscroll.polyfill();
    window.addEventListener("scroll", scrolling_function);

    fetch(
      `https://api.unsplash.com/photos/random?orientation=landscape`,
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => {
        const resultJson = JSON.parse(result);
        setUsername(resultJson.user.username);
        setMainPhoto(resultJson);
        setLoading(false);
        window.addEventListener("scroll", scrolling_function);
      })
      .catch((error) => console.log("error", error));
  }, []);

  useEffect(() => {
    setLoading(true);
    if (!username || !morePhotos) return;

    fetch(
      `https://api.unsplash.com/users/${username}/photos?page=${pageNumber}&per_page=30&order_by=latest`,
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => {
        const resultJson = JSON.parse(result);
        if (resultJson.length == 0) {
          setLoading(false);
          setMorePhotos(false);
          return;
        }
        setData([...data, ...resultJson]);
        setLoading(false);
        window.addEventListener("scroll", scrolling_function);
      })
      .catch((error) => console.log("error", error));
  }, [pageNumber, username]);

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

  const myHeaders = new Headers();
  myHeaders.append(
    "Authorization",
    "Client-ID EUfSGhtJ1MMxbtYvals9hmM1p6mRdiGXw6k77oHT5eo"
  );
  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  return (
    <div>
      <Head>
        <title>Gallery</title>
        <meta name="description" content="Cool" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {mainPhoto != null && (
        <div className={styles.mainContainer}>
          <Image
            key={mainPhoto?.id}
            layout="fill"
            placeholder="blur"
            blurDataURL={mainPhoto?.urls?.regular}
            src={mainPhoto?.urls?.full}
            objectFit="cover"
            quality={75}
            className={styles.mainImage}
          />
          <header className={styles.mainHeader}>
            <a
              href={mainPhoto?.user?.links?.html}
              target="_blank"
              className={styles.userContainer}
            >
              <div className={styles.userProfile}>
                <Image
                  key={mainPhoto?.user?.id}
                  width="100%"
                  height="100%"
                  objectFit="cover"
                  placeholder="blur"
                  blurDataURL={mainPhoto?.user?.profile_image?.small}
                  src={mainPhoto?.user?.profile_image?.large}
                  quality={75}
                  className={styles.profileImage}
                  alt={mainPhoto?.user?.name}
                />
              </div>
              <p style={{ textAlign: "center" }}>{mainPhoto?.user?.username}</p>
            </a>
            <h1 className={styles.mainHeading}>
              {mainPhoto?.user?.first_name}'s Gallery
            </h1>
            <time className={styles.time}>
              {new Date(mainPhoto.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
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
          <div style={{ position: "relative" }} key={photo?.id}>
            <Image
              onClick={imageOverlay}
              className={styles.image}
              height={photo?.height}
              width={photo?.width}
              placeholder="blur"
              blurDataURL={photo?.urls?.thumb}
              src={photo?.urls?.regular}
              objectFit="cover"
              alt={photo?.alt_description}
              quality={75}
            />
            <p className={styles.imageLikes}>&hearts; {photo?.likes}</p>
          </div>
        ))}
      </Masonry>
      {morePhotos && <Loader />}

      <button
        className={styles.backToTopButton}
        onClick={() =>
          scrollTo({
            top: innerHeight,
            behavior: "smooth",
          })
        }
      >
        Back To Top
      </button>
    </div>
  );
}
