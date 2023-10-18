# Nodejs With NAPI And worker thread
## Prerequisite
- Nodejs 18.x.x
- gcc / g++
- node-gyp

## Running the project
- clone the repo
- `npm install -g node-gyp`
- `npm install`
- `node-gyp build`
- `npm start`
- `npm run test`

## testing with artillery
- `artillery run ./artillery/{PICK_DESIRED_YAML}.yaml`