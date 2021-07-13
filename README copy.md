# Client Catalog Browser Micro App.
Client Catalog Browser Micro App, provides a catalog browser to the Content Platform API.

# Dependencies
In order to build and use this API, you will need the following softwares installed no your computer.

1. nodejs [https://nodejs.org](http://nodejs.org)
2. Code editor ie: [Visual Studio Code](https://code.visualstudio.com)
3. [Git client](https://git-scm.com/)

# Build and Test
- clone the repository either via Visual Studio Code or via the command: 
```
git clone https://dev.azure.com/2020Development/Content%20Platform/_git/client-catalogbrowser
```

- once repository is cloned, go in to the cloned repository folder and install the code dependencies via
```
npm install
```
- in order to build the debug version of the API
```
npm run build-dev
```
- in order to build the production version of the API
```
npm run build-prod
```

- once code is built, it will reside in either the **dist** or **dist/debug** folder