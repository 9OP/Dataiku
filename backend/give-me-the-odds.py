#!python3
from argparse import ArgumentParser
from os import path
from pydantic import ValidationError
import json


from app.models import MillenniumFalcon, Empire
from app.lib import give_me_the_odds
from app.database import SqliteDB


def parser():
    def is_valid_json_file(parser: ArgumentParser, file_path: str):
        if not path.isfile(file_path):
            parser.error(f"\n\tThe file {file_path} does not exist!")
        try:
            with open(file_path, "r") as file:
                return (json.loads(file.read()), file_path)
        except ValueError:
            parser.error(f"\n\tThe file {file_path} is not valid JSON!")

    parser = ArgumentParser(
        description="Gives the odds that the Millenium Falcon saves the Galaxy"
    )
    parser.add_argument(
        "falcon",
        help="Millennium Falcon JSON file",
        metavar="millennium_falcon",
        type=lambda x: is_valid_json_file(parser, x),
    )
    parser.add_argument(
        "empire",
        help="Empire JSON file",
        metavar="empire",
        type=lambda x: is_valid_json_file(parser, x),
    )
    return parser


def main():
    # Parse CLI arguments
    arg_parser = parser()
    parsed = arg_parser.parse_args()
    falcon_data, falcon_file_path = parsed.falcon
    empire_data, _ = parsed.empire

    # Generate path to the routes db
    routes_db_dir = falcon_file_path.split("/")[:-1]
    routes_db_path = path.join(*routes_db_dir, falcon_data.get("routes_db", ""))
    falcon_data["routes_db"] = routes_db_path

    # Validate the file data
    try:
        millennium_falcon = MillenniumFalcon.parse_obj(falcon_data)
        empire = Empire.parse_obj(empire_data)
    except ValidationError as err:
        arg_parser.error(str(err))

    # Read routes from database
    db = SqliteDB()
    db.connect(path=millennium_falcon.routes_db)
    routes = db.get_routes()

    # Compute the odd
    odd, _ = give_me_the_odds(
        millennium_falcon=millennium_falcon,
        empire=empire,
        routes=routes,
    )
    return odd


if __name__ == "__main__":
    print(main())
