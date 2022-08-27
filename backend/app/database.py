import sqlite3
from contextlib import contextmanager
from abc import ABC, abstractmethod
from typing import List, Any

from .models import Route


class Database(ABC):
    con: Any
    db_path: str

    @abstractmethod
    def connect(self, path: str):
        pass

    @abstractmethod
    def disconnect(self):
        pass

    @abstractmethod
    def get_routes(self) -> List[Route]:
        pass


class SqliteDB(Database):
    con: sqlite3.Connection

    def connect(self, path):
        con = sqlite3.connect(path, check_same_thread=False)
        self.con = con

    def disconnect(self):
        if self.con:
            self.con.close()

    @contextmanager
    def get_cur(self):
        cur = self.con.cursor()
        try:
            yield cur
        finally:
            cur.close()

    def get_routes(self) -> List[Route]:
        with self.get_cur() as cur:
            res = cur.execute("SELECT * FROM routes;")
            rows = res.fetchall()

        routes: List[Route] = []
        for row in rows:
            origin, destination, travel_time = row
            routes.append(
                Route(
                    origin=origin,
                    destination=destination,
                    travel_time=travel_time,
                )
            )

        return routes
