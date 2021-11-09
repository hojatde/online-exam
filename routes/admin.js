const express = require('express');

const router = express.Router();
const mongoose = require('mongoose');
const { validationResult, body, param } = require('express-validator');
const Student = require('../models/student');
const Class = require('../models/class');

const adminMiddleware = require('../middleware/adminAuth');

const adminController = require('../controller/admin');

router.get('/login', adminController.getLoginAdmin);

router.post('/login', adminController.postLoginAdmin);

router.get('/dashboard', adminController.getDashboard);

router.get('/addTeacher',adminMiddleware, adminController.getAddTeacher);

router.post('/addTeacher',[
    body('name').notEmpty().withMessage('لطفا نام را وارد کنید').bail().isAlpha('fa-IR').withMessage('نام تنها میتواند شامل حروف فارسی باشد'),
    body('lastName').notEmpty().withMessage('لطفا نام خانوادگی را وارد کنید').bail().isAlpha('fa-IR').withMessage('نام-خانوادگی تنها میتواند شامل حروف فارسی باشد'),
    body('username').notEmpty().withMessage('لطفا نام کاربری را وارد کنید').bail()
        .isNumeric().withMessage('نام کاربری باید تنها شامل اعداد باشد.'),
    body('password').notEmpty().withMessage('لطفا رمز عبور را وارد کنید').bail()
        .isAlphanumeric().withMessage('رمز عبور باید شامل کارکتر های مجاز باشد')
        .isLength({min:8,max:20}).withMessage('رمز عبور باید حداقل شامل 8 ک باشد.'),
],adminMiddleware, adminController.postAddTeacher);

router.get('/addClass',adminMiddleware, adminController.getAddClass);

router.post('/addClass', [
    body('classNumber').notEmpty().withMessage('شماره کلاس را وارد کنید.').isNumeric().withMessage('شناسه کلاس باید تنها شامل اعداد باشد')
],adminMiddleware, adminController.postAddClass);

router.get('/addTeacherToClass',adminMiddleware, adminController.getAddTacherToClass);

router.post('/addTeacherToClass', [
    body('classNumber').notEmpty().withMessage('شماره کلاس را وارد کنید.').bail().isNumeric().withMessage('شناسه کلاس باید تنها شامل اعداد باشد'),
    body('username').notEmpty().withMessage('شناسه دبیر را وارد کنید.').bail().isNumeric().withMessage('شناسه دبیر باید تنها شامل اعداد باشد')
], adminMiddleware, adminController.postAddTacherToClass);

router.get('/addStudent', adminController.getAddStudent);

router.post('/addStudent',adminMiddleware, [
    body('username').isNumeric().withMessage('نام کاربری تنها شامل اعداد است').custom(async(value, { req }) => {
        const student = await Student.findOne({ username: value });
        if (student) { throw new Error('دانش اموزی با این شماره در سیستم ثبت شده است.') }
        else{return true}
    }),
    body('classNumber').isNumeric().withMessage('شماره کلاس عدد است').custom(async (value, { req }) => {
        const classOb = await Class.findOne({ number: value });
        if (!classOb) {
            throw new Error('کلاسی با شماره وارد شده در سیستم ثبت نشده است.')
        }else{return true}
    }),
    body('password').isAlphanumeric().withMessage('کلمه عبور کارکتر غیر مجاز')
], adminController.postAddStudent);

router.get('/viewClass',adminMiddleware, adminController.getViewClasses);

router.get('/class/:classId', adminMiddleware, [
    param('classId').custom((value, { req }) => {
        if (mongoose.Types.ObjectId.isValid(value)) { return true }
        else{throw new Error('دسترسی غیر مجاز ای دی کلاس نا معتبر است')}
    })
], adminController.getClassForAdmin);

router.post('/class/:classId/deleteTeacherFromClass', adminMiddleware, [
    param('classId').custom((value, { req }) => {
        if (mongoose.Types.ObjectId.isValid(value)) { return true }
        else{throw new Error('دسترسی غیر مجاز ای دی کلاس نا معتبر است')}
    }), body('teacherId').custom((value, { req }) => {
        if (mongoose.Types.ObjectId.isValid(value)) { return true }
        else{throw new Error('دسترسی غیر مجاز ای دی دبیر نا معتبر است')}
    })
],adminController.postDeleteTeacherFromClass);

router.post('/class/:classId/deleteStudentFromClass', adminMiddleware, [
    param('classId').custom((value, { req }) => {
        if (mongoose.Types.ObjectId.isValid(value)) { return true }
        else{throw new Error('دسترسی غیر مجاز ای دی کلاس نا معتبر است')}
    }), body('studentId').custom((value, { req }) => {
        if (mongoose.Types.ObjectId.isValid(value)) { return true }
        else{throw new Error('دسترسی غیر مجاز ای دی دانش آموز نا معتبر است')}
    })
], adminController.postDeleteStudentFromClass);

module.exports = router;