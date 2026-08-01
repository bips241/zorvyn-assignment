#!/bin/bash
set -e

cd /app

npm test -- --reporter=verbose 2>&1
