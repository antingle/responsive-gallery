import Head from "next/head";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import Masonry from "react-masonry-css";
import Loader from "../components/Loader";
import styles from "../styles/Home.module.css";
import smoothscroll from "smoothscroll-polyfill";

export default function Home() {
  const [data, setData] = useState([]); // holds the data for the gallery of photos
  const [mainPhoto, setMainPhoto] = useState(null); // main central photo
  const [username, setUsername] = useState(null); // username of the main photo
  const [morePhotos, setMorePhotos] = useState(true); // indicate if the user has more photos
  const [pageNumber, setPageNumber] = useState(1); // page of the user's photos
  const [backToTopButton, setBackToTopButton] = useState(false); // state of back to top button

  const scrollingFunction = useCallback(() => {
    if (window.scrollY < window.innerHeight) setBackToTopButton(false);
    else setBackToTopButton(true);

    if (
      window.innerHeight + window.scrollY >=
      document.body.offsetHeight - 10
    ) {
      if (morePhotos) setPageNumber((prevPage) => ++prevPage);
    }
  }, []);

  // run on initial load
  useEffect(() => {
    console.log("running first useeffect");
    smoothscroll.polyfill();
    window.addEventListener("scroll", scrollingFunction);

    fetch(`/api/randomphoto`, { method: "GET" })
      .then((response) => response.text())
      .then((result) => {
        const resultJson = JSON.parse(result);
        if (Object.keys(resultJson).length === 0) {
          setMorePhotos(false);
          return;
        }
        setUsername(resultJson.user.username);
        setMainPhoto(resultJson);
        setData([]);
        setPageNumber(1);
      })
      .catch((error) => console.log("error", error));
  }, [scrollingFunction]);

  // run when page scrolled to bottom
  useEffect(() => {
    if (!username || !morePhotos) return;
    setMorePhotos(false);

    console.log("running second useeffect");
    fetch(`/api/photos?user=${username}&page=${pageNumber}&per_page=${20}`, {
      method: "GET",
    })
      .then((response) => response.text())
      .then((result) => {
        const resultJson = JSON.parse(result);
        if (resultJson.length == 0) {
          setMorePhotos(false);
          return;
        }
        setData((prevState) => [...prevState, ...resultJson]);
        setMorePhotos(true);
      })
      .catch((error) => console.log("error", error));
  }, [pageNumber, username, scrollingFunction]);

  const imageOverlay = (event) => {
    console.log(event.target);
    event.target.setAttribute(
      "class",
      event.target.getAttribute("class") + " overlay"
    );
  };

  return (
    <div style={{ position: "relative" }}>
      <Head>
        <title>Gallery</title>
        <meta
          name="description"
          content="Scroll through galleries of unique Unsplash users everytime!"
        />
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
        ></link>
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
            alt={mainPhoto?.alt_description}
          />
          <header className={styles.mainHeader}>
            <a
              href={mainPhoto?.user?.links?.html}
              target="_blank"
              rel="noreferrer"
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
              {mainPhoto?.user?.first_name}&apos;s Gallery
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

          <button
            className={`${styles.whiteButton} ${styles.refreshButton}`}
            onClick={() => {
              window.location.reload(false);
            }}
          >
            <i className="fa fa-refresh"></i>
          </button>

          <button
            className={`${styles.whiteButton} ${styles.backToTopButton}`}
            style={{ opacity: backToTopButton ? 1 : 0 }}
            onClick={() => [
              scrollTo({
                top: 0,
                behavior: "smooth",
              }),
              setBackToTopButton(false),
            ]}
            disabled={!backToTopButton}
          >
            ↑
          </button>
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
    </div>
  );
}
