import { useState, useEffect } from "react";
import { fetchTags } from "@/components/hooks/admin/product/tags/utils/TagService";

export const useFetchTags = () => {
  const [tags, setTags] = useState([]);

  useEffect(() => {
    fetchTags(setTags);
  }, []);

  return [tags, setTags];
};
