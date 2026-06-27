// =============================================================
//  storefront/src/hooks/useFetch.js
//  Generic data-fetching hook with loading, error and refetch.
//  Used throughout the storefront for all API calls.
// =============================================================

import { useCallback, useEffect, useRef, useState } from "react";
import api from "../services/api";

function useFetch(url, params = {}) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // Serialize params so useEffect detects changes correctly
  const paramsKey = JSON.stringify(params);

  // Keep a ref to the latest url+params for refetch()
  const urlRef    = useRef(url);
  const paramsRef = useRef(params);

  useEffect(() => {
    urlRef.current    = url;
    paramsRef.current = params;
  });

  const fetchData = useCallback(
    async (overrideUrl, overrideParams) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(overrideUrl ?? urlRef.current, {
          params: overrideParams ?? paramsRef.current,
        });
        setData(res.data);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
          err.message ||
          "خطایی رخ داده است."
        );
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    if (!url) return;
    fetchData(url, params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, paramsKey]);

  return { data, loading, error, refetch: fetchData };
}

export default useFetch;