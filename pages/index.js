import Head from "next/head";
import Image from "next/image";
import { useCallback, useEffect, useState, useRef } from "react";
import Masonry from "react-masonry-css";
import Loader from "../components/Loader";
import styles from "../styles/Home.module.css";
import useFetch from "../hooks/useFetch";
import { animateScroll as scroll } from "react-scroll";
import Lightbox from "react-image-lightbox";
import Icon from "../components/Icon";

export default function Home() {
  const [url, setURL] = useState(null); // set url to get a user's photos
  const [pageNumber, setPageNumber] = useState(1); // page of the user's photos
  const [backToTopButton, setBackToTopButton] = useState(false); // state of back to top button
  const [sliderOpen, setSliderOpen] = useState(false); // state of React Lightbox
  const [photoIndex, setPhotoIndex] = useState(1); // state of React Lightbox

  // fetch main photo which also gives username to load gallery images
  const {
    loading: initialLoading,
    error: initialError,
    data: mainPhoto,
  } = useFetch(`/api/randomphoto`);

  // fetch gallery and pagination
  const { loading, error, data, hasMore } = useFetch(url);

  useEffect(() => {
    if (initialLoading) return;
    try {
      setURL(
        `/api/photos?user=${
          mainPhoto.user.username
        }&page=${pageNumber}&per_page=${12}`
      );
    } catch (e) {
      console.log(e);
    }
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

  if (initialLoading) return <Loader />;
  if (error || initialError) {
    return (
      <h2 style={{ textAlign: "center" }}>
        {initialError?.message || error?.message}
      </h2>
    );
  }
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
            priority={true}
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
              className={styles.imageContainer}
              style={{ position: "relative" }}
              key={photo?.id}
              ref={data.length === index + 1 ? lastElement : null}
              onClick={() => [setSliderOpen(true), setPhotoIndex(index)]}
            >
              <Image
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
      {sliderOpen && (
        <Lightbox
          mainSrc={data[photoIndex].urls?.regular}
          mainSrcThumbnail={data[photoIndex].urls?.thumb}
          nextSrc={
            data[
              photoIndex === data.length - 1 ? data.length - 1 : ++photoIndex
            ].urls?.regular
          }
          nextSrcThumbnail={
            data[
              photoIndex === data.length - 1 ? data.length - 1 : ++photoIndex
            ].urls?.thumb
          }
          prevSrc={data[!photoIndex ? 0 : --photoIndex].urls?.regular}
          prevSrcThumbnail={data[!photoIndex ? 0 : --photoIndex].urls?.thumb}
          onCloseRequest={() => setSliderOpen(false)}
          onMovePrevRequest={() =>
            setPhotoIndex((prev) => (prev === 0 ? prev : --prev))
          }
          onMoveNextRequest={() => {
            if (photoIndex >= data.length - 2 && hasMore) ++pageNumber;
            setPhotoIndex((prev) => (prev === data.length - 1 ? prev : ++prev));
          }}
          imageCaption={data[photoIndex].description}
          // discourageDownloads={true}
          toolbarButtons={[
            <Icon
              key="download"
              aria-label="Download"
              icon="fa-download"
              href={`api/downloadImage?url=${data[photoIndex].links.download_location}&name=${data[photoIndex].id}`}
            />,
            <Icon
              key="link"
              aria-label="Original Image"
              target="_blank"
              rel="noreferrer"
              icon="fa-external-link"
              href={data[photoIndex].links.html}
            />,
          ]}
        />
      )}
      {loading && <Loader />}
    </div>
  );
}
