// Configuración de variables de entorno
process.env.SECRET = "CoderCoder123";

import express from 'express';
import handlebars from 'express-handlebars';
import {Server} from 'socket.io';
import mongoose from 'mongoose';
import passport from 'passport';

import productRouter from './routes/productRouter.js';
import cartRouter from './routes/cartRouter.js';
import viewsRouter from './routes/viewsRouter.js';
import sessionRouter from './routes/sessionRouter.js';
import __dirname from './utils/constantsUtil.js';
import websocket from './websocket.js';
import { iniciarPassport } from './config/passport.config.js';

const app = express();

const uri = 'mongodb+srv://thurtadocr:Zpdqq3sC0kfm7MMT@cluster0.j4lzcic.mongodb.net/entrega-final';
mongoose.connect(uri);

//Handlebars Config
app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/../views');
app.set('view engine', 'handlebars');

//Middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(passport.initialize());

// Inicializar estrategias de Passport
iniciarPassport();

//Routers
app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);
app.use('/api/sessions', sessionRouter);
app.use('/', viewsRouter);

const PORT = 8080;
const httpServer = app.listen(PORT, () => {
    console.log(`Start server in PORT ${PORT}`);
});

const io = new Server(httpServer);

websocket(io);