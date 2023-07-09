const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;
mongoose.connect('mongodb://localhost:27017/cfDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const app = express();

app.use(morgan('common'));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

app.get('/', (req, res) => {
  res.send('Welcome to my movie app.');
});

// READ - returns all movies
app.get(
  '/movies',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.find()
      .then((movies) => res.status(200).json(movies))
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  }
);

// READ - returns one movie given the title
app.get(
  '/movies/:Title',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { Title } = req.params;

    Movies.findOne({ Title })
      .then((movie) => {
        if (movie) {
          res.status(200).json(movie);
        } else {
          res.status(400).json('Movie not found.');
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  }
);

// READ - returns information on a director
app.get(
  '/movies/director/:Name',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { Name } = req.params;

    Movies.findOne({ 'Director.Name': Name })
      .then((movie) => {
        if (movie) {
          res.status(200).json(movie.Director);
        } else {
          res.status(400).json('Director not found.');
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  }
);

// READ - returns information about a genre
app.get(
  '/movies/genre/:Name',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { Name } = req.params;

    Movies.findOne({ 'Genre.Name': Name })
      .then((movie) => {
        if (movie) {
          res.status(200).json(movie.Genre);
        } else {
          res.status(400).json('Genre not found.');
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  }
);

// CREATE - add a new user to the list of users
/* We'll expect JSON in this format
{
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/
app.post('/users', (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + ' already exists');
      }

      Users.create({
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
      })
        .then((user) => res.status(201).json(user))
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// GET - Get all users
app.get(
  '/users',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.find()
      .then((users) => res.status(201).json(users))
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  }
);

// GET - Get a user by Username
app.get('/users/:Username', (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => res.status(200).json(user))
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// UPDATE - Update a user's info, by Username
/* We'll expect JSON in this format
{
  Username: String, (required)
  Password: String, (required)
  Email: String, (required)
  Birthday: Date
}*/
app.put(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true }
    )
      .then((updatedUser) => res.status(200).json(updatedUser))
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  }
);

// CREATE - Add a new movie to user's favorites
app.post('/users/:Username/movies/:MovieID', (req, res) => {
  const { Username, MovieID } = req.params;

  Users.findOneAndUpdate(
    { Username },
    { $addToSet: { FavoriteMovies: MovieID } },
    { new: true }
  )
    .then((updatedUser) => res.status(201).json(updatedUser))
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// DELETE - Remove a movie from user's favorites
app.delete('/users/:Username/movies/:MovieID', (req, res) => {
  const { Username, MovieID } = req.params;

  Users.findOneAndUpdate(
    { Username },
    { $pull: { FavoriteMovies: MovieID } },
    { new: true }
  )
    .then((updatedUser) => res.status(200).json(updatedUser))
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// DELETE - Remove a user
app.delete('/users/:Username', (req, res) => {
  const { Username } = req.params;

  Users.findOneAndRemove({ Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(Username + ' was not found.');
      } else {
        res.status(200).send(Username + ' was deleted.');
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// Handle any errors that occur
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('An error occurred on the server.');
});

app.listen(8080, () => {
  console.log('App is listening on port 8080');
});
