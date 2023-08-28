import cors from 'cors';
import express from 'express';
import router from './routes/zendesk';

// const express = require('express')
const app = express();
const port = 8080;

const options: cors.CorsOptions = {
  origin: '*',
};

app.use(express.json());
app.use(cors(options));

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.use('/zendesk', router);

app.listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
});


