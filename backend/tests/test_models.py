import unittest
import tempfile
from pydantic.error_wrappers import ValidationError


from app.models import MillenniumFalconPlanNode, MillenniumFalcon


class TestModels(unittest.TestCase):
    def test_plan_node_is_valid(self):
        """
        GIVEN MillenniumFalconPlanNode
        WHEN day and fuel are positive or null
        THEN node is valid
        """
        node = MillenniumFalconPlanNode(
            planet="test",
            day=0,
            fuel=0,
            refill=False,
            hunted=False,
        )
        self.assertTrue(node.is_valid())

    def test_plan_node_is_not_valid(self):
        """
        GIVEN MillenniumFalconPlanNode
        WHEN either day or fuel is less than 0
        THEN node is not valid
        """
        PARAMETERS = [(-1, 1), (1, -1)]
        for day, fuel in PARAMETERS:
            node = MillenniumFalconPlanNode(
                planet="test",
                day=day,
                fuel=fuel,
                refill=False,
                hunted=False,
            )
            with self.subTest():
                self.assertFalse(node.is_valid())

    def test_routes_db_exists(self):
        """
        GIVEN MillenniumFalcon
        WHEN routes_db is a valid path
        THEN no exception is raised
        """
        fd, path = tempfile.mkstemp()
        MillenniumFalcon(autonomy=0, departure="", arrival="", routes_db=path)

    def test_routes_db_not_exists(self):
        """
        GIVEN MillenniumFalcon
        WHEN routes_db is not a valid path
        THEN exception ValidationError is raised
        """
        with self.assertRaises(ValidationError):
            MillenniumFalcon(
                autonomy=0,
                departure="",
                arrival="",
                routes_db="<does not exists>",
            )
