# Antisback's bushtarion toolkit

Add on functionality for bushtarion.

# The repo

The repo is a mono repo, the various packages are contained in the packages folder, the different applications are then found in the apps folder.

To build the browser extension go into the individual packages and run 
```
npm ci
npm run get-dependencies
```

then navigate to the apps/extension folder and run
```
npm ci
npm run build
```
