export interface MillenniumFalcon {
  autonomy: number;
  departure: string;
  arrival: string;
}

export interface Route {
  origine: string;
  destination: string;
  travel_time: number;
}

export interface PlanStep {
  day: number;
  planet: string;
  fuel: number;
  refill: boolean;
  hunted: boolean;
}

export interface Empire {
  countdown: number;
  bountyHunters: BountyHunter[];
}

export interface BountyHunter {
  day: number;
  planet: string;
}
