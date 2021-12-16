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

        if (res.status === 500 || 403)
          throw new Error("API Rate Limit Exceeded :( Please come back later");

        if (json.length > 0) {
          setData((prev) => [...prev, ...json]);
          setHasMore(true);
        } else {
          if (data.length === 0) setData(json);
          setHasMore(false);
        }
        setLoading(false);
      } catch (e) {
        setError(e);
        setLoading(false);
      }
    };
    url && fetchData();
    return () => controller.abort();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return { loading, error, data, hasMore };
}
