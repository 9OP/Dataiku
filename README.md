# Give me the odds

There are 2 ways of running the backend:

- locally by installing deps in a python virtual env (using poetry)
- docker by building the image and starting a container

## Run locally

You will need:

- Python >=3.9 and Poetry for the backend
- Npm for the frontend

### Backend

Install and start the server:

```sh
cd backend
poetry config virtualenvs.in-project true # create .venv/ in current dir
poetry install
source $(poetry env info --path)/bin/activate # activate virtual env
python3 ./run.py examples/example1/millennium-falcon.json
```

The server should be running, you can compute the odd with an example `empire.json` file:

```sh
curl -i -X POST http://localhost:8080/api/odds \
   -H 'Content-Type: application/json' \
   -d @examples/example1/empire.json
```

### CLI

Once the backend is installed:

```sh
./give_me_the_odds.py examples/example1/millennium-falcon.json examples/example1/empire.json
```

## Run on Docker

Install and start the server

```sh
cd backend
docker build . -t millennium_falcon --target prod # Build prod image
docker run \
 --rm \
 -it \
 -p 8080:8080  \
 -v $(pwd):/app \
 millennium_falcon \
 python3 ./run.py examples/example1/millennium-falcon.json
```
