import { useQuery } from "react-query";
import { getMillenniumFalcon, getRoutes } from "./http";

export const useGetRoutes = () => useQuery("routes", getRoutes);

export const useGetMillenniumFalcon = () => useQuery("millenniumFalcon", getMillenniumFalcon);
