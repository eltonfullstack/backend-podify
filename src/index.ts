import express from 'express';
import 'dotenv/config';
import './db'
import authRoutes from '#/routers/auth';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('src/public'));

app.use('/auth', authRoutes);

const PORT = process.env.APP_PORT || 8987;

app.listen(PORT, () => {
  console.log(`[SERVER RUNNING ON PORT ${PORT}]`);
});