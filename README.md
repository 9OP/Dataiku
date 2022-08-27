# Give me the odds

## Run locally

You will need:

- Python >=3.9 and Poetry for the backend
- Npm for the frontend

### Backend

First, you need to install the backend:

```sh
cd backend
poetry config virtualenvs.in-project true # create .venv/ in current dir
poetry install
source $(poetry env info --path)/bin/activate # activate virtual env
MILLENNIUM_FALCON_PATH=examples/example1/millennium-falcon.json ./run.bash
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
./give-me-the-odds.py examples/example1/millennium-falcon.json examples/example1/empire.json
```

## Run on Docker
