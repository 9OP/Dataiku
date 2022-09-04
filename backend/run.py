#!python3
import uvicorn
from argparse import ArgumentParser
from os import environ


from give_me_the_odds import is_valid_json_file


def parser():
    parser = ArgumentParser(
        description="Start backend server with MillenniumFalcon file"
    )
    parser.add_argument(
        "falcon",
        help="Millennium Falcon JSON file",
        metavar="falcon_file",
        type=lambda x: is_valid_json_file(parser, x),
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parser()
    environ["MILLENNIUM_FALCON_PATH"] = args.falcon
    port = int(environ.get("PORT", 8080))

    # Start server
    config = uvicorn.Config(
        app="app:create_app",
        factory=True,
        port=port,
        host="0.0.0.0",
        log_level="info",
        proxy_headers=True,
        reload=True,
        debug=True,
        reload_dirs=["app"],
    )
    server = uvicorn.Server(config)
    server.run()
