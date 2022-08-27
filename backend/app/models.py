from pydantic import BaseModel, validator
from typing import List, Dict, Union
from os import path


class MillenniumFalconPlan(BaseModel):
    planet: str
    day: int
    fuel: int
    refill: bool
    hunted: bool = False


class MillenniumFalconPlanNode(MillenniumFalconPlan):
    """Represents a Millenium Falcon as a Tree Node"""

    parent: Union["MillenniumFalconPlanNode", None] = None
    children: List["MillenniumFalconPlanNode"] = []

    def is_valid(self) -> bool:
        # Indicates if the Millenium Falcon state is legit
        is_alive = self.day >= 0
        has_fuel = self.fuel >= 0
        return is_alive and has_fuel


class MillenniumFalcon(BaseModel):
    autonomy: int
    departure: str
    arrival: str
    routes_db: str

    @validator("routes_db")
    def validate_routes_db(cls, v):
        if not path.isfile(v):
            raise ValueError(f"file {v} does not exist")
        return v


class Empire(BaseModel):
    countdown: int
    bounty_hunters: "BountyHunters"


class BountyHunter(BaseModel):
    planet: str
    day: int


BountyHunters = List[BountyHunter]
Empire.update_forward_refs()


class Route(BaseModel):
    origin: str
    destination: str
    travel_time: int


# { destination: [Route] }
UniverseMap = Dict[str, List[Route]]
# { day: [planet] }
BountyHuntersMap = Dict[int, List[str]]
