const express = require('express');

const router = express.Router();
const Student = require('../models/student');
const teacherAuth = require('../middleware/teacherAuth');
const Teacher = require('../models/teacher');
const Class = require('../models/class');
const mongoose = require('mongoose');

const { check, body, query, param, validationResult } = require('express-validator');

const teacherController = require('../controller/teacher');
const e = require('express');

router.get('/login', teacherController.getTeacherLogin);

router.post('/login', teacherController.postTeacherLogin);

router.get('/dashboard',teacherAuth, teacherController.getDashboard);

router.get('/addStudent',teacherAuth,teacherController.getAddStudentForTeacher);

router.post('/addStudent', teacherAuth, [
    body('name').notEmpty().withMessage('لطفا نام را وارد کنید.').bail().isAlpha('fa-IR').withMessage('نام تنها میتواند شامل حروف فارسی باشد'),
    body('lsatName').notEmpty().withMessage('لطفا نام خانوادگی را وارد کنید.').bail().isAlpha('fa-IR').withMessage('نام-خانوادگی تنها میتواند شامل حروف فارسی باشد'),
    body('username').notEmpty().withMessage('لطفا نام کاربری را وارد کنید.').bail().isNumeric().withMessage('نام کاربری تنها میتواند شامل اعداد باشد.').bail()
        .custom(async(value, { req }) => {
            const user = await Student.findOne({ username: value });
            if (user) {
                throw new Error('دانش آموز با نام کاربری وارد شده در سیستم ثبت شده است.')
            }else{return true}
        }),
    body('classNumber').notEmpty().withMessage('لطفا شماره کلاس را وارد کنید.').bail()
        .isNumeric().withMessage('شماره کلاس باید تنها شامل اعداد باشد').bail(),
    body('password').notEmpty().withMessage('لطفا رمز عبور را وارد کنید.').bail()
        .isAlphanumeric().withMessage('رمز عبور باید شامل کارکتر های مجاز باشد').bail()
        .isLength({min:8,max:20}).withMessage('رمز عبور باید حداقل شامل 8 کارکتر باشد')
], teacherController.postAddStudentForTeacher);

router.get('/getClasses',teacherAuth, teacherController.getClassListOfTeacher);

router.get('/class/:id', [
    param('id').custom((value, { req }) => {
        if (mongoose.Types.ObjectId.isValid(value)) {
            return true;
        } else {
            throw new Error('دسترسی غیر مجاز')
        }
    })
],teacherAuth, teacherController.getSelectClassTeacher);

router.get('/class/:id/exams',[
    param('id').custom((value, { req }) => {
        if (mongoose.Types.ObjectId.isValid(value)) {
            return true;
        } else {
            throw new Error('دسترسی غیر مجاز')
        }
    })
],teacherAuth, teacherController.getExamsOFClass);

router.post('/class/:id/createExam',[
    param('id').custom((value, { req }) => {
        if (mongoose.Types.ObjectId.isValid(value)) {
            return true;
        } else {
            throw new Error('دسترسی غیر مجاز')
        }
    })
],teacherAuth, teacherController.postCreateExamInSelectedClass);

router.get('/class/:classId/edit/',[
    param('classId').custom((value, { req }) => {
        if (mongoose.Types.ObjectId.isValid(value)) {
            return true;
        } else {
            throw new Error('تلاش برای دسترسی غیر مجاز - وارد کردن شناسه کلاس نا معتبر')
        }
    }), query('exam').custom((value, { req }) => {
        if (mongoose.Types.ObjectId.isValid(value)) {
            return true;
        } else {
            throw new Error('تلاش برای دسترسی غیر مجاز - وارد کردن شناسه آزمون نامعتبر')
        }
    })
],teacherAuth, teacherController.getSelectExamOfClass);

router.post('/class/:classId/exam/editExam', [
    param('classId').custom((value, { req }) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            throw new Error('تلاش برای دسترسی غیر مجار وارد کردن شماره کلاس نامعتبر');
        } else { return true }
    }),
    body('examId').custom((value, { req }) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            throw new Error('تلاش برای دسترسی غیر مجار وارد کردن شماره آزمون نامعتبر');
        } else { return true }
    }),
    body('questionId').custom((value, { req }) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            throw new Error('تلاش برای دسترسی غیر مجار وارد کردن شماره سوال نامعتبر');
        } else { return true }
    })
], teacherAuth,teacherController.postUploadImage, teacherController.postEditQuestionOfExam);

router.post('/class/:classId/exam/delete',[
    param('classId').custom((value, { req }) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            throw new Error('تلاش برای دسترسی غیر مجار وارد کردن شماره کلاس نامعتبر');
        }else{return true}
    }),
    body('examId').custom((value, { req }) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            throw new Error('تلاش برای دسترسی غیر مجار وارد کردن شماره آزمون نامعتبر');
        }else{return true}
    }),
    body('questionId').custom((value, { req }) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            throw new Error('تلاش برای دسترسی غیر مجار وارد کردن شماره سوال نامعتبر');
        }else{return true}
    })
],teacherAuth, teacherController.postDeleteExam);

router.post('/class/:classId/exam/open',[
    param('classId').custom((value, { req }) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            throw new Error('تلاش برای دسترسی غیر مجار وارد کردن شماره کلاس نامعتبر');
        }else{return true}
    }),
    body('examId').custom((value, { req }) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            throw new Error('تلاش برای دسترسی غیر مجار وارد کردن شماره آزمون نامعتبر');
        }else{return true}
    })
],teacherAuth, teacherController.postOpenExam);

router.post('/class/:classId/exam/close',[
    param('classId').custom((value, { req }) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            throw new Error('تلاش برای دسترسی غیر مجار وارد کردن شماره کلاس نامعتبر');
        }else{return true}
    }),
    body('examId').custom((value, { req }) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            throw new Error('تلاش برای دسترسی غیر مجار وارد کردن شماره آزمون نامعتبر');
        }else{return true}
    })
],teacherAuth, teacherController.postCloseExam);

router.post('/class/:classId/exam/finish',[
    param('classId').custom((value, { req }) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            throw new Error('تلاش برای دسترسی غیر مجار وارد کردن شماره کلاس نامعتبر');
        }else{return true}
    }),
    body('examId').custom((value, { req }) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            throw new Error('تلاش برای دسترسی غیر مجار وارد کردن شماره آزمون نامعتبر');
        }else{return true}
    })
],teacherAuth, teacherController.postFinishExam);

router.get('/class/:classId/exam/view/:examId',teacherAuth,[
    param('classId').custom((value, { req }) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            throw new Error('تلاش برای دسترسی غیر مجار وارد کردن شماره کلاس نامعتبر');
        }else{return true}
    }),
    param('examId').custom((value, { req }) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            throw new Error('تلاش برای دسترسی غیر مجار وارد کردن شماره آزمون نامعتبر');
        }else{return true}
    })
], teacherController.getStudentsAnswers);

router.get('/class/:classId/exam/view/:examId/reviewed',teacherAuth,[
    param('classId').custom((value, { req }) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            throw new Error('تلاش برای دسترسی غیر مجار وارد کردن شماره کلاس نامعتبر');
        }else{return true}
    }),
    param('examId').custom((value, { req }) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            throw new Error('تلاش برای دسترسی غیر مجار وارد کردن شماره آزمون نامعتبر');
        }else{return true}
    })
], teacherController.getSelectedStudentAnswer);

router.post('/class/:classId/exam/view/:examId/point', teacherAuth, [
    param('classId').custom((value, { req }) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            throw new Error('تلاش برای دسترسی غیر مجار وارد کردن شماره کلاس نامعتبر');
        }else{return true}
    }),
    param('examId').custom((value, { req }) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            throw new Error('تلاش برای دسترسی غیر مجار وارد کردن شماره آزمون نامعتبر');
        }else{return true}
    }),
    body('studentId').custom((value, { req }) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            throw new Error('تلاش برای دسترسی غیر مجار وارد کردن شماره دانش آموز نامعتبر');
        }else{return true}
    })
], teacherController.postPointOfSelectedStudentExam);

router.post('/test2', teacherController.postUploadImage);


module.exports = router;