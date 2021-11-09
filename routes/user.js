const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const { check, body, query, param } = require('express-validator');

const userAuth = require('../middleware/studentAuth');

const userLogin = require('../middleware/isLogin');

const userController = require('../controller/user');
const notLogin = require('../middleware/notLogin');

router.get('/', userController.getHome);

router.get('/login',notLogin, userController.getLogin);

router.post('/login', [
    body('username').isNumeric().withMessage('نام کاربری تنها شامل عدد است.'),
    body('password').isAlphanumeric().withMessage('پسور تنها شامل اعداد و حروف زبان لاتین است.')
], userController.postLogin);

router.get('/class/:classId',userAuth, [param('classId').custom((value,{req}) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        console.log(value.length)
        throw new Error("دسترسی غیر مجاز")
    }else{return true}
})],
    userController.getClass);

router.post('/class/:classId/exam',userAuth,
    [param('classId').custom((value, { req }) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("دسترسی غیر مجاز")
    }else{return true}
}), body('examId').custom((value, { req }) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("دسترسی غیر مجاز")
    }else{return true}
})
], userController.postStartExam);

router.get('/class/:classId/student/identityConfirmation', [
    param('classId').custom((value, { req }) => {
        if (mongoose.Types.ObjectId.isValid(value)) { return true }
        else{throw new Error('دسترسی غیز مجاز')}
    })
], userController.getIdentityConfirmation);

router.post('/class/:classId/student/identityConfirmation', [
    param('classId').custom((value, { req }) => {
        if (mongoose.Types.ObjectId.isValid(value)) { return true }
        else { throw new Error('دسترسی غیز مجاز') }
    })
    , body('name').blacklist(' ').isAlpha('fa-IR').withMessage('نام باید شامل حروف فارسی باشد'),
    body('lastName').blacklist(' ').trim().isAlpha('fa-IR').withMessage('نام خانوادگی تنها شامل حروف فارسی است'),
    body('password').isAlphanumeric().withMessage('رمز عبور تنها شامل اعداد و حروف لاتین است').isLength({ min: 8, max: 20 }).withMessage('کلمه عبور باید حداقل 8 کارکتر و حداکثر 20 کارکتر باشد'),
    body('confirmPassword').isAlphanumeric().custom((value, { req }) => {
        if (req.body.password === value) {
            return true;
        } else {
            throw Error('رمز عبور وارد شده با تکرار آن یکسان نیست.')
        }
    })
], userController.postIdentityConfirmation);

router.post('/class/:classId/exam/answer', userAuth,userController.postUploadImage, [param('classId').custom((value, { req }) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("دسترسی غیر مجاز")
    } else { return true }
}), body('examId').custom((value, { req }) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("دسترسی غیر مجاز");
    } else { return true; }
}), body('questionId').isArray().withMessage('----------دسترسی غیر مجاز').bail().custom((value, { req }) => {
    const len = value.length;
    for (let i = 0; i < len; i++) {
        if (!mongoose.Types.ObjectId.isValid(value[0])) {
            throw new Error("دسترسی غیر مجاز");
        }
    }
    return true;
}), body('answer').isArray().withMessage('دسترسی غیر مجاز')
], userController.postSendAnswer);

router.get('/examExample', userController.getExamExample);

router.get('/student/sucssefully', userController.getSucsses);

router.post('/logOut',userLogin, userController.postLogOut);

router.get('/error', userController.getErrorPage);

module.exports = router;