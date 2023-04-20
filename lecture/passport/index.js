const passport = require('passport');
const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const User = require('../models/user');

module.exports = () => {
    passport.serializeUser((user, done) => {
        done(null, user.id); // user id만 추출
    });
    // 세션 {123456789: 1} {세션쿠키: 유저아이디} -> 메모리 저장됨

    passport.deserializeUser((id, done) => {
        User.findOne({ where: {id}})
            .then((User) => done(null, user)) // req.user, req.session
            .catch(err => done(err));
    });

    local();
    kakao();
};