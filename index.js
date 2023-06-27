const express = require('express');
const morgan = require('morgan');

const app = express();

const topMovies = [
  {
    title: 'Pulp Fiction',
  },
  {
    title: 'Excalibur',
  },
  {
    title: 'Casablanca',
  },
  {
    title: 'Robocop',
  },
  {
    title: 'Austin Powers',
  },
  {
    title: 'The Matrix',
  },
  {
    title: 'The Matrix Reloaded',
  },
  {
    title: 'The Matrix Revolutions',
  },
  {
    title: 'The Bourne Identity',
  },
  {
    title: 'The Bourne Supremacy',
  },
];

app.use(morgan('common'));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('Welcome to my movie app.');
});

app.get('/movies', (req, res) => {
  res.json(topMovies);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('An error occurred on the server.');
});

app.listen(8080, () => {
  console.log('App is listening on port 8080');
});
