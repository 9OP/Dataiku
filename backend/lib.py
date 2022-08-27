from typing import List, Tuple, Optional
from collections import defaultdict
from models import (
    MillenniumFalconPlan,
    MillenniumFalconPlanNode,
    MillenniumFalcon,
    Empire,
    Route,
    UniverseMap,
    BountyHuntersMap,
    BountyHunters,
)


def generate_universe_map(routes: List[Route]) -> UniverseMap:
    universe_map = defaultdict(list)
    for route in routes:
        universe_map[route.destination].append(route)
    return universe_map


def generate_bounty_hunters_map(bounty_hunters: BountyHunters) -> BountyHuntersMap:
    bounty_hunters_map = defaultdict(list)
    for hunter in bounty_hunters:
        bounty_hunters_map[hunter.day].append(hunter.planet)
    return bounty_hunters_map


def generate_plans_recursive(
    node: MillenniumFalconPlanNode,
    universe_map: UniverseMap,
    start: str,
    end: str,
    autonomy: int,
) -> List[MillenniumFalconPlanNode]:
    if node.planet == end:
        node.parent = None

    if node.planet == start:
        return [node]

    previous_nodes = universe_map.get(node.planet, [])

    routes: List[MillenniumFalconPlanNode] = []
    for previous in previous_nodes:
        # case previous_state was an hyperspace jump to node.planet
        previous_state_jump = MillenniumFalconPlanNode(
            parent=node,
            planet=previous.origin,
            day=node.day - previous.travel_time,
            fuel=node.fuel - previous.travel_time,
            refill=False,
        )
        if previous_state_jump.is_valid():
            routes += generate_plans_recursive(
                previous_state_jump,
                universe_map,
                start,
                end,
                autonomy,
            )

        # case previous_state was waiting on the node.planet
        previous_state_wait = MillenniumFalconPlanNode(
            parent=node,
            planet=node.planet,
            day=node.day - 1,  # Wait 1 day
            fuel=autonomy,  # Refuel
            refill=True,
        )
        if previous_state_wait.is_valid():
            routes += generate_plans_recursive(
                previous_state_wait,
                universe_map,
                start,
                end,
                autonomy,
            )

    return routes


def generate_plans(
    start: str,
    end: str,
    countdown: int,
    autonomy: int,
    universe_map: UniverseMap,
) -> List[MillenniumFalconPlanNode]:
    root = MillenniumFalconPlanNode(
        parent=None,
        planet=end,
        day=countdown,
        fuel=autonomy,
        refill=False,
    )
    return generate_plans_recursive(
        node=root,
        universe_map=universe_map,
        start=start,
        end=end,
        autonomy=autonomy,
    )


def compute_odd(encounters: int) -> float:
    res = 0
    for i in range(encounters):
        res += pow(9, i) / pow(10, i + 1)
    return (1 - res) * 100


def compute_route_odd(
    plan: MillenniumFalconPlanNode,
    bounty_hunters_map: BountyHuntersMap,
) -> float:
    encounters = 0
    while plan:
        if plan.planet in bounty_hunters_map.get(plan.day, []):
            encounters += 1
        plan = plan.parent  # type: ignore
    return compute_odd(encounters)


def find_best_plan(
    routes: List[MillenniumFalconPlanNode],
    bounty_hunters_map: BountyHuntersMap,
) -> Tuple[float, Optional[MillenniumFalconPlanNode]]:
    if len(routes) == 0:
        return (0, None)

    routes_with_odds: List[Tuple[float, MillenniumFalconPlanNode]] = []
    for route in routes:
        route_odd = compute_route_odd(route, bounty_hunters_map)
        routes_with_odds.append((route_odd, route))

    odd, route = max(routes_with_odds, key=lambda x: x[0])
    return (odd, route)


def format_plan(plan: MillenniumFalconPlanNode, autonomy: int):
    flattened_plan: List[MillenniumFalconPlan] = []
    while plan:
        # Because we compute the path from the end to the start
        # Fuel corresponds to the fuel used, not the fuel available
        plan.fuel = abs(plan.fuel - autonomy)
        flattened_plan.append(MillenniumFalconPlan(**plan.dict()))
        plan = plan.parent  # type: ignore

    return flattened_plan


def give_me_the_odds(
    millennium_falcon: MillenniumFalcon,
    empire: Empire,
    routes: List[Route],
):
    universe_map = generate_universe_map(routes)
    bounty_hunters_map = generate_bounty_hunters_map(empire.bounty_hunters)

    plans = generate_plans(
        start=millennium_falcon.departure,
        end=millennium_falcon.arrival,
        autonomy=millennium_falcon.autonomy,
        countdown=empire.countdown,
        universe_map=universe_map,
    )

    return find_best_plan(plans, bounty_hunters_map)
