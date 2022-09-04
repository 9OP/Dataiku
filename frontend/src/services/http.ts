import { Empire, MillenniumFalcon, Plan, PlanStep, Route } from "../models/models";

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

const jsonToPlan = (json: any): Plan => {
  const odd: number = json.odd;
  const steps: PlanStep[] = (json.plan || []).map(
    (data: any): PlanStep => ({
      day: data.day,
      planet: data.planet,
      fuel: data.fuel,
      refill: data.refill,
      hunted: data.hunted,
    })
  );
  return { odd, steps };
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
    body: JSON.stringify({
      countdown: empire.countdown,
      bounty_hunters: empire.bountyHunters,
    }),
    headers: { "Content-Type": "application/json" },
  });
  const json = await res.json();
  return jsonToPlan(json);
};
