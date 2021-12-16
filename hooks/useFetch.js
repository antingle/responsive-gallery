import { useEffect, useState } from "react";

export default function useFetch(url, options) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(url, options);
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
        setError(error);
        setLoading(false);
      }
    };

    url && fetchData();
  }, [url, options]);

  return { loading, error, data, hasMore };
}
