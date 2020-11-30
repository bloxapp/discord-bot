const app = require('express')();
const http = require('http').createServer(app);
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
app.use(cors());

app.get('/', (req,res)=> {
  res.send('BloxStaking Discord Bot');
});

http.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
  require('./bot');
});

