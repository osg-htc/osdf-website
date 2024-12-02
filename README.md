OSDF Website
============
## Running
### Fastest Iterator

```shell
npm install
npm run dev
```

### Runs Everywhere

```shell
docker build -t osdf-website --file Dockerfile . 
docker run -p 3000:3000 --env-file .env -t osdf-website
```

## Deployment

This website is deployed automatically. 

https://osdf-website.osgdev.chtc.io/ is backed by the latest commit on the main branch

https://osdf.osg-htc.org is backed by the highest semver tag. 

