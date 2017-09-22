import {readFileSync} from 'fs';
import isEqual from 'lodash-es/isEqual';
import {execFileSync, spawn} from 'child_process';

let quiet = true;

function log() {
  quiet || console.warn.apply(console, arguments);
}


function readJson(filename, required = false) {
  try {
    return JSON.parse(readFileSync(filename, 'utf8'));
  } catch(err) {
    if(err.code !== 'ENOENT') { throw err; }
    if(required) {
      log(`node_modules cache validation failed: ${filename} does not exist`);
      process.exit(1);
    }
    return null;
  }
}

function checkCachedFiles(name, ourContent, cachedContent) {
  if(!isEqual(ourContent, cachedContent)) {
    if(!cachedContent) {
      log(`node_modules cache invalid: No cached ${name}`);
    } else {
      log(`node_modules cache invalid: Cached ${name} is invalid`);
    }
    return false;
  }
  return true;
}

function checkCache() {
  const ourPackageLock = readJson('package-lock.json');
  const cachedPackageLock = readJson('node_modules/.package-lock.json');
  if(ourPackageLock) {
    return checkCachedFiles('package-lock.json', ourPackageLock, cachedPackageLock);
  } else {
    const ourPackageJson = readJson('package.json', true);
    const cachedPackageJson = readJson('node_modules/.package.json');
    return checkCachedFiles('package.json', ourPackageJson, cachedPackageJson);
  }
}

function setCache() {
  readJson('package.json', true); // fail if doesn't exist
  execFileSync('cp', ['package.json', 'node_modules/.package.json']);
  if(readJson('package-lock.json')) {
      execFileSync('cp', ['package-lock.json', 'node_modules/.package-lock.json']);
  }
}

function clearCache() {
  execFileSync('rm', ['-f', 'node_modules/.package.json']);
  execFileSync('rm', ['-f', 'node_modules/.package-lock.json']);
}

const stdioOpts = {
  stdio: ['inherit', 'inherit', 'inherit']
};

function install(reinstall = false) {
  if(!checkCache()) {
    clearCache();
    const args = ['install', ...process.argv.splice(3)];
    if(reinstall) {
      log('Removing old node_modules');
      execFileSync('rm', ['-rf', 'node_modules'], stdioOpts);
    }
    var npm = spawn('npm', args, stdioOpts);
    npm.on('close', code => {
      if(code === 0) {
        log('Setting cache after successful npm install');
        setCache();
      }
      process.exit(code);
    });
  } else {
    log('No install necessary as cache appears to be valid')
  }
}

if(process.argv[2] === 'check') {
  if(!checkCache()) {
    process.exit(1);
  }
} else if(process.argv[2] === 'clear') {
  clearCache();
}
else if(process.argv[2] === 'set') {
  setCache();
} else if(process.argv[2] === 'reinstall') {
  install(true);
} else if(process.argv[2] === 'install') {
  install();
} else {
  log('Valid options are')
  process.exit(1);
}
