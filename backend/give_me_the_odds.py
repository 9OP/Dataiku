#!python3
from argparse import ArgumentParser
from pydantic import ValidationError
import json
import os


from app.lib import (
    give_me_the_odds,
    get_empire_from_file,
    get_millenium_falcon_from_file,
)
from app.database import SqliteDB


def is_valid_json_file(parser: ArgumentParser, file_path: str):
    if not os.path.isfile(file_path):
        parser.error(f"\n\tThe file {file_path} does not exist!")
    try:
        with open(file_path, "r") as file:
            json.loads(file.read())
            return file_path
    except ValueError:
        parser.error(f"\n\tThe file {file_path} is not valid JSON!")


def parser():
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
    return parser.parse_args()


def main():
    # Parse CLI arguments
    args = parser()

    # Validate the file data
    try:
        millennium_falcon = get_millenium_falcon_from_file(args.falcon)
        empire = get_empire_from_file(args.empire)
    except ValidationError as err:
        print(err)
        return

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
