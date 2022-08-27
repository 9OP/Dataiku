#!/bin/bash

PORT=8080
MILLENNIUM_FALCON_PATH=examples/example1/millennium-falcon.json

uvicorn \
    --factory app:create_app \
    --port $PORT \
    --host 0.0.0.0 \
    --proxy-headers \
    --reload \
    --reload-dir .
