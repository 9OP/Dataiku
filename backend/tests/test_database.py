import unittest
import sqlite3
import tempfile


from app.database import SqliteDB


class TestDatabase(unittest.TestCase):
    def setUp(self) -> None:
        create_table = """
        CREATE TABLE routes (
            origin TEXT NOT NULL,
            destination TEXT NOT NULL,
            travel_time INT NOT NULL
        );
        """
        _, sqlite_path = tempfile.mkstemp()
        self.sqlite_path = sqlite_path
        self.data = [
            ("Tatoine", "Dagobah", 6),
            ("Tatoine", "Hoth", 4),
            ("Hoth", "Endor", 1),
            ("Dagobah", "Hoth", 1),
            ("Dagobah", "Endor", 1),
        ]
        db = sqlite3.connect(sqlite_path)
        cur = db.cursor()
        cur.execute(create_table)
        cur.executemany("INSERT INTO routes VALUES(?,?,?)", self.data)
        db.commit()

    def test_get_routes(self):
        """
        GIVEN SqliteDB instance with routes data
        WHEN get_routes
        THEN return List[Route]
        """
        db = SqliteDB()
        db.connect(self.sqlite_path)
        routes = db.get_routes()
        for route, data in zip(routes, self.data):
            self.assertEqual(route.origin, data[0])
            self.assertEqual(route.destination, data[1])
            self.assertEqual(route.travel_time, data[2])
