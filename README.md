# node-modules-cache
This tool is useful for entirely skipping `npm install` if currently existing `node_modules` has been built from the same `package.json` and optionally `package-lock.json`. 

This if often the case on CI such as Codeship, Gitlab CI or Drone.IO where caching whole `node_modules` is a common pattern.

## Installation

Minimum Node 6 is required.

```
npm install -g node-modules-cache
```

or 

```
wget https://rush.sh/I7cG88_dKzPzn0v+Z5hQK6DxDa4/node-modules-cache -O /usr/local/bin/node-modules-cache
```

## Usage

The below will run `npm install` automatically if our cached package.json/package-lock.json have changed.
```
node-modules-cache install # you can pass any extra parameters you would pass to npm install
```

It is equivalent to more manual usage:
```
node-modules-cache check || (npm install && node-modules-cache set)
```

If you want to reinstall all modules when the cache is invalid then use:
```
node-modules-cache reinstall
```

which is equivalent to:
```
node-modules-cache check || (rm -rf node_modules && npm install && node-modules-cache set)
```

## License
MIT
