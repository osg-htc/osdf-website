import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export const useQueryState = (name, initialState = {}) => {
  const router = useRouter();
  const existingValue = router.query[name];
  const [state, setState] = useState(existingValue || initialState);

  useEffect(() => {
    if (existingValue && existingValue !== state) {
        setState(existingValue);
    }
  }, [existingValue]);

  const setQueryParams = (value = {}) => {
    const query = { ...router.query, [name]: value };
    router.push({ pathname: router.pathname, query: query}, undefined, {
      shallow: true,
    });
  };

  return [state, setQueryParams];
};