const express = require('express');
const app = express();
const path = require('path');

app.use('/stories/malawi/', express.static('./'));

app.get('/stories/malawi/de/*', function (req, res) {
  res.sendFile(path.resolve('./de/index.html'));
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
