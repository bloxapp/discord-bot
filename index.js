const app = require('express')();
const http = require('http').createServer(app);
const cors = require('cors');

app.use(cors());

app.get('/', (req,res)=> {
  res.send('BloxStaking Discord Bot');
});

http.listen(5000, () => {
  console.log('Listening on port 5000');
  require('./bot');
});

