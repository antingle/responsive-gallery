import Head from "next/head";
import Image from "next/image";
import { useCallback, useEffect, useState, useRef } from "react";
import Masonry from "react-masonry-css";
import Loader from "../components/Loader";
import styles from "../styles/Home.module.css";
import useFetch from "../hooks/useFetch";
import { animateScroll as scroll } from "react-scroll";

export default function Home() {
  const [url, setURL] = useState(null); // set url to get a user's photos
  const [pageNumber, setPageNumber] = useState(1); // page of the user's photos
  const [backToTopButton, setBackToTopButton] = useState(false); // state of back to top button

  // fetch main photo which also gives username to load gallery images
  const {
    loading: initialLoading,
    error: initialError,
    data: mainPhoto,
  } = useFetch(`/api/randomphoto`, { method: "GET" });

  // fetch gallery and pagination
  const { loading, error, data, hasMore } = useFetch(url, { method: "GET" });

  useEffect(() => {
    if (initialLoading) return;
    setURL(
      `/api/photos?user=${
        mainPhoto.user.username
      }&page=${pageNumber}&per_page=${15}`
    );
  }, [mainPhoto, pageNumber, initialLoading]);

  // load in more photos when at last photo
  const observer = useRef();
  const lastElement = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPageNumber((prevPageNumber) => ++prevPageNumber);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  // show back to top button when below main photo
  const observerMainPhoto = useRef();
  const mainPhotoRef = useCallback((node) => {
    if (observerMainPhoto.current) observerMainPhoto.current.disconnect();
    observerMainPhoto.current = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) setBackToTopButton(true);
      else setBackToTopButton(false);
    });
    if (node) observerMainPhoto.current.observe(node);
  }, []);

  const imageOverlay = (event) => {
    console.log(event.target);
    event.target.setAttribute(
      "class",
      event.target.getAttribute("class") + " overlay"
    );
  };

  if (error || initialError) return <p>{error}</p>;
  if (initialLoading) return <Loader />;

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
        <div className={styles.mainContainer} ref={mainPhotoRef}>
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
              <div className={styles.userProfile} key={mainPhoto?.user?.id}>
                <Image
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
              onClick={() => scroll.scrollTo(innerHeight)}
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
            onClick={() => scroll.scrollTo(0)}
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
        {data.map((photo, index) => {
          return (
            <div
              style={{ position: "relative" }}
              key={photo?.id}
              ref={data.length === index + 1 ? lastElement : null}
            >
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
          );
        })}
      </Masonry>
      {loading && <Loader />}
    </div>
  );
}
