const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const flash = require('connect-flash');

const MONGODB_URI = '';

const app = express();

const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions',
    expires: 18000000
})

app.set("view engine", "ejs");
app.set("views", "views");


app.use(flash());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public/')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(session({
    secret: 'secretKey',
    saveUninitialized: false,
    resave: false,
    store:store
}))

app.use((req, res, next) => {
    res.locals.isAdmin = req.session.isAdmin;
    res.locals.isLogin = req.session.isLogin;
    res.locals.isTeacher = req.session.isTeacher;
    res.locals.isStudent = req.session.isStudent;
    next();
})

//Router
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const teacherRouter = require('./routes/teacher');


app.use(userRouter);
app.use('/admin', adminRouter);
app.use('/teacher', teacherRouter);

app.use((req, res) => {
    console.log('page not found occured');
    res.status(404).render('./user/error', {
        title: 'صفحه پیدا نشد.',
        errorMessage: 'صفحه پیدا نشد',
        classId:''
    });
})

mongoose
    .connect(MONGODB_URI,{ useNewUrlParser: true ,useUnifiedTopology: true} )
    .then(
        app.listen(7020)
    )
    .catch(err => {
        console.log(err)
    })
