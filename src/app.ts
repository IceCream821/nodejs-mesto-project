import cookieParser from 'cookie-parser';
import express from 'express';
import mongoose from 'mongoose';
import './models/user';
import './models/card';
import { createUser, login } from './controllers/users';
import auth from './middlewares/auth';
import errorHandler from './middlewares/error-handler';
import requestResponseLogger from './middlewares/logger';
import usersRouter from './routes/users';
import cardsRouter from './routes/cards';
import { signinCelebrate, signupCelebrate } from './validators/schemas';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());
app.use(requestResponseLogger);
app.post('/signup', signupCelebrate, createUser);
app.post('/signin', signinCelebrate, login);
app.use(auth);
app.use('/users', usersRouter);
app.use('/cards', cardsRouter);
app.use(errorHandler);

mongoose.connect('mongodb://localhost:27017/mestodb')
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('Подключено к базе mestodb');
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Сервер слушает порт ${PORT}`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Ошибка подключения к MongoDB', err);
    process.exit(1);
  });
