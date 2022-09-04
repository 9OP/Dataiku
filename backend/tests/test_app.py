import unittest
import json
from os import environ, path, getcwd
from fastapi.testclient import TestClient


from app import create_app


class TestApp(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self) -> None:
        environ["MILLENNIUM_FALCON_PATH"] = path.join(
            getcwd(),
            "tests",
            "fixture",
            "millennium-falcon.json",
        )

        # Create testing client
        self.app = create_app()

    def test_get_routes(self):
        """
        GIVEN application with fixture
        WHEN GET /api/routes
        THEN returns the routes
        """
        expected = [
            {"origin": "Tatooine", "destination": "Dagobah", "travel_time": 6},
            {"origin": "Dagobah", "destination": "Endor", "travel_time": 4},
            {"origin": "Dagobah", "destination": "Hoth", "travel_time": 1},
            {"origin": "Hoth", "destination": "Endor", "travel_time": 1},
            {"origin": "Tatooine", "destination": "Hoth", "travel_time": 6},
        ]
        with TestClient(self.app) as client:
            response = client.get("/api/routes")
            data = response.json()
            self.assertEqual(response.status_code, 200)
            self.assertEqual(len(data), 5)
            for exp, res in zip(expected, data):
                self.assertEqual(exp.get("origin"), res.get("origin"))
                self.assertEqual(exp.get("destination"), res.get("destination"))
                self.assertEqual(exp.get("travel_time"), res.get("travel_time"))

    def test_get_millennium_falcon(self):
        millennium_falcon = {"autonomy": 6, "departure": "Tatooine", "arrival": "Endor"}
        with TestClient(self.app) as client:
            response = client.get("/api/millennium_falcon")
            data = response.json()
            self.assertEqual(response.status_code, 200)
            self.assertTrue(millennium_falcon.items() <= data.items())

    def test_post_odds(self):
        empire = {
            "countdown": 8,
            "bounty_hunters": [
                {"planet": "Hoth", "day": 6},
                {"planet": "Hoth", "day": 7},
                {"planet": "Hoth", "day": 8},
            ],
        }
        expected = [
            {
                "planet": "Tatooine",
                "day": 0,
                "fuel": 6,
                "refill": False,
                "hunted": False,
            },
            {"planet": "Hoth", "day": 6, "fuel": 0, "refill": True, "hunted": True},
            {"planet": "Hoth", "day": 7, "fuel": 1, "refill": False, "hunted": True},
            {"planet": "Endor", "day": 8, "fuel": 0, "refill": False, "hunted": False},
        ]
        with TestClient(self.app) as client:
            response = client.post("/api/odds", data=json.dumps(empire))
            data = response.json()
            self.assertEqual(response.status_code, 200)
            self.assertEqual(data.get("odd"), 81)
            for exp, res in zip(expected, data.get("plan")):
                self.assertDictEqual(res, exp)
