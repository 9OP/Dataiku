import { useMutation, useQuery } from "react-query";
import { Empire } from "../models/models";
import { getMillenniumFalcon, getRoutes, postEmpire } from "./http";

export const useGetRoutes = () => useQuery("routes", getRoutes);

export const useGetMillenniumFalcon = () => useQuery("millenniumFalcon", getMillenniumFalcon);

export const useGiveMeTheOdds = () => {
  return useMutation((arg: { empire: Empire }) => postEmpire(arg.empire));
};
