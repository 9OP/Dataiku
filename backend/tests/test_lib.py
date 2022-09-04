import unittest
import tempfile


from app.models import (
    MillenniumFalcon,
    Empire,
    BountyHunter,
    Route,
    MillenniumFalconPlanNode,
    BountyHuntersMap,
)
from app.lib import (
    generate_universe_map,
    generate_bounty_hunters_map,
    compute_odd,
    compute_route_odd,
    generate_plans_recursive,
    find_best_plan,
)


class TestLib(unittest.TestCase):
    def setUp(self) -> None:
        _, tmp = tempfile.mkstemp()
        self.millennium_falcon = MillenniumFalcon(
            autonomy=6,
            departure="Tatoine",
            arrival="Endor",
            # Necessary otherwise Pydantic would raise a validation error
            routes_db=tmp,
        )
        self.empire = Empire(
            countdown=10,
            bounty_hunters=[
                BountyHunter(planet="Hoth", day=6),
                BountyHunter(planet="Hoth", day=7),
                BountyHunter(planet="Dagobah", day=7),
                BountyHunter(planet="Hoth", day=8),
            ],
        )
        self.routes = [
            Route(origin="Tatoine", destination="Dagobah", travel_time=6),
            Route(origin="Tatoine", destination="Hoth", travel_time=4),
            Route(origin="Dagobah", destination="Hoth", travel_time=1),
            Route(origin="Hoth", destination="Endor", travel_time=1),
            Route(origin="Dagobah", destination="Endor", travel_time=1),
        ]

    def test_generate_universe_map(self):
        """
        GIVEN routes
        WHEN generate_universe_map
        THEN returns list of routes indexed by destination
        """
        universe_map = generate_universe_map(self.routes)
        for destination, routes in universe_map.items():
            for route in routes:
                self.assertEqual(destination, route.destination)

    def test_generate_bounty_hunters_map(self):
        """
        GIVEN BountyHunters
        WHEN generate_bounty_hunters_map
        THEN returns list of planet indexed by day where bounty hunters are
        """
        bounty_hunters_map = generate_bounty_hunters_map(self.empire.bounty_hunters)
        for bounty_hunter in self.empire.bounty_hunters:
            self.assertTrue(
                bounty_hunter.planet in bounty_hunters_map[bounty_hunter.day]
            )

    def test_compute_odd(self):
        """
        GIVEN number of encounters
        WHEN compute_odd
        THEN returns the odd to not be captured
        """
        odds = [(100, 0), (90, 1), (81, 2)]
        for odd, encounters in odds:
            self.assertEqual(odd, compute_odd(encounters))

    def test_compute_route_odd(self):
        """
        GIVEN plan and bounty_hunters_map
        WHEN compute_route_odd
        THEN returns the odd and the route_len
        """
        plan = MillenniumFalconPlanNode(
            planet="Tatoine",
            day=0,
            fuel=0,
            refill=False,
            parent=MillenniumFalconPlanNode(
                planet="Hoth",
                day=6,
                fuel=0,
                refill=False,
            ),
        )
        bounty_hunters_map: BountyHuntersMap = {6: ["Hoth"]}
        odd = 90
        route_len = 2
        self.assertEqual((odd, route_len), compute_route_odd(plan, bounty_hunters_map))

    def test_generate_plans_recursive(self):
        end = "Hoth"
        countdown = 6
        autonomy = self.millennium_falcon.autonomy
        root = MillenniumFalconPlanNode(
            planet=end,
            day=countdown,
            fuel=autonomy,
            refill=False,
        )
        universe_map = generate_universe_map(self.routes)
        routes = generate_plans_recursive(
            node=root,
            universe_map=universe_map,
            start=self.millennium_falcon.departure,
            end=end,
            autonomy=autonomy,
        )
        self.assertEqual(len(routes), 4)

    def test_find_best_plan(self):
        end = "Hoth"
        countdown = 6
        autonomy = self.millennium_falcon.autonomy
        root = MillenniumFalconPlanNode(
            planet=end,
            day=countdown,
            fuel=autonomy,
            refill=False,
        )
        universe_map = generate_universe_map(self.routes)
        bounty_hunters_map = generate_bounty_hunters_map(self.empire.bounty_hunters)
        routes = generate_plans_recursive(
            node=root,
            universe_map=universe_map,
            start=self.millennium_falcon.departure,
            end=end,
            autonomy=autonomy,
        )
        odd, plan = find_best_plan(routes, bounty_hunters_map)
        self.assertEqual(100, odd)
