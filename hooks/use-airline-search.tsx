import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useDebounce } from "./use-debounce";
import { Airline } from "@/lib/airline-service";

const fetchAirlines = async (query: string): Promise<Airline[]> => {
  if (query.length < 2) {
    return [];
  }
  const { data } = await axios.get(`/api/airlines?q=${query}`);
  return data;
};

export const useAirlineSearch = (query: string) => {
  const debouncedQuery = useDebounce(query, 300);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["airlines", debouncedQuery],
    queryFn: () => fetchAirlines(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  return { data, isLoading, isError };
};
