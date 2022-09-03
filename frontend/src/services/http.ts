import { Empire, MillenniumFalcon, PlanStep, Route } from "../models/models";

const jsonToMillenniumFalcon = (json: any): MillenniumFalcon => ({
  autonomy: json.autonomy,
  departure: json.departure,
  arrival: json.arrival,
});

const jsonToRoutes = (json: any): Route[] => {
  return (json || []).map((data: any) => ({
    origin: data.origin,
    destination: data.destination,
    travel_time: data.travel_time,
  }));
};

const jsonToPlan = (json: any) => {
  const odd: number = json.odd;
  const plan: PlanStep[] = (json.plan || []).map((data: any) => ({
    day: data.day,
    planet: data.planet,
    fuel: data.fuel,
    refill: data.refill,
    hunter: data.hunted,
  }));
  return { odd, plan };
};

export const getMillenniumFalcon = async () => {
  const res = await fetch("/api/millennium_falcon");
  const json = await res.json();
  return jsonToMillenniumFalcon(json);
};

export const getRoutes = async () => {
  const res = await fetch("/api/routes");
  const json = await res.json();
  return jsonToRoutes(json);
};

export const postEmpire = async (empire: Empire) => {
  const res = await fetch("/api/odds", {
    method: "POST",
    body: JSON.stringify(empire),
    headers: { "Content-Type": "application/json" },
  });
  const json = await res.json();
  return jsonToPlan(json);
};
