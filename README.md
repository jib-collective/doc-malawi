# Webdoc about Tabacco-Workers in Malawi

Publication Date: 19/06/2016

## How to build

`npm install`

`cp aws.json.default aws.json`
`cp config.json.default config.json`

Fill in the required data.

### Build the assets

`gulp`

will create `/dist/`

## Run the static file server

`node server.js`

Now you are able to access the story at http://localhost:3000/stories/malawi/de/

## Upload data to S3 & Invalidate Cloudfront

`gulp upload`
