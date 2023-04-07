const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path')
const session = require('express-session')
const nunjucks = require('nunjucks') // 풀스택 개발자를 생각하면 react, vue로 만들어보기
const dotenv = require('dotenv');
const passport = require('passport');
const { sequelize } = require('./models');
// process.env.COOKIE_SECRET 없음
dotenv.config(); // process.env
// process.env.COOKIE_SECRET 있음
const pageRouter = require('./routes/page');
const passportConfig = require('./passport');

const app = express();
passportConfig();
app.set('port', process.env.Port || 8001);
app.set('view engine', 'html');
nunjucks.configure('views', {
    express: app,
    watch: true,
});
sequelize.sync({ force: false }) // 개발 시에만 쓰기 (잘못 만들었을 경우 대비)
    .then(() => {
        console.log('데이터베이스 연결 성공')
    })
    .catch((err) => {
        console.log(err);
    })
    
app.use(morgan('dev')); // 개발모드 // 배포할 땐 combined
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // req.body를 ajax json 요청으로부터
app.use(express.urlencoded({ extended: false })); // req.body 폼으로부터
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
    }
}));
app.use(passport.initialize()); // req.user, req.login, req.isAuthenticate, req.logout
app.use(passport.session()); // connect.id 라는 이름으로 세션 쿠키가 브라우저로 전송

app.use('/', pageRouter);
app.use('/auth', authRouter);

app.use((req, res, next) => { // 404 NOT FOUND
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    next(error);
});

app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== 'production' ? err: {}; // 에러 로그를 서비스한테 넘겨요
    res.status(err.status || 500);
    res.render('error');
});

app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 대기 중');
});