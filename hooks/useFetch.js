import { useEffect, useState } from "react";

export default function useFetch(url) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(url, { method: "GET", signal: signal });
        const json = await res.json();
        if (json.length > 0) {
          setData((prev) => [...prev, ...json]);
          setHasMore(true);
        } else {
          setData(json);
          setHasMore(false);
        }
        setLoading(false);
      } catch (error) {
        console.log(error);
        setError(error);
        setLoading(false);
      }
    };
    url && fetchData();
    return () => controller.abort();
  }, [url]);

  return { loading, error, data, hasMore };
}
