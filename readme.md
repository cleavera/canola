# Canola (formerly Antisback's bushtarion toolkit)

Add on functionality for bushtarion web game (http://www.bushtarion.com).

# Building

The repo is a mono repo, the various packages are contained in the packages folder, the different applications are then found in the apps folder.

First the build module needs to be installed, navigate to /build and run
```
npm ci
```

To build the browser extension go into the individual packages and run: 
```
npm ci
npm run installALl
npm run build
```

This will install all the dependent packages and build them in the correct order.
