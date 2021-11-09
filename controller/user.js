const Student = require('../models/student');
const Exam = require('../models/exam');
const Class = require('../models/class');
const Teacher = require('../models/teacher');
const mongoose = require('mongoose');
const {validationResult } = require('express-validator');

const multer = require('multer');

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        //console.log(typeof(file.mimetype))
        cb(null, 'images');
    }, filename: (req, file, cb) => {
        cb(null, new Date().getTime().toString() + file.originalname);
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null,true)
    } else {
        //console.log(file.mimetype)
        cb('فرمت فایل انتخاب شده صحیح نیست.', false);
    }
}

const uploadImage = multer({ storage: fileStorage, fileFilter: fileFilter, limits: { fileSize: 1024*1024*8} }).array('image', 2);

exports.postUploadImage = async (req, res, next) => {
    try {
        uploadImage(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error','اندازه فایل انتخاب شده بیشتر از حد مجاز است.')
                }
                console.log(err);
                console.log('1');
            } else if (err) {
                req.flash('error', err);
            }

            next();
        })
    } catch (err) {
        console.log('salam')
        console.log(err);
    }
}


exports.getHome = (req, res) => {
    res.render('./user/home',{title:'خانه',classId:false});
}

exports.getLogin = (req, res) => {

    const errorMessages = req.flash('error');
    let message;
    if (errorMessages.length > 0) {
        message = errorMessages[0];
    } else {
        message = false;
    }
    res.status(422).render('./user/login', {
        title: 'login',
        errorMessage: message,
        classId:''
    })
}

exports.postLogin = async (req, res) => {
    const errors = validationResult(req);
    let errorMessage = false;
    if (!errors.isEmpty()) {
        errorMessage = errors.array()[0].msg;
        //console.log(errors.array()[1]);
        return res.status(422).render('./user/Login', {
            title: 'login',
            errorMessage:errorMessage
        })
    }
    const inputUserName = req.body.username;
    const inputPassword = req.body.password;

    const student = await Student.findOne({ username: inputUserName });
    if (student) {
        if (student.password === inputPassword) {
            req.session.isLogin = true;
            req.session.studentId = student._id;
            req.session.isStudent = true;
            const classId = student.classId.toString();
            res.redirect('/class/' + classId);
        } else {
            req.flash('error', 'کاربری با اطلاعات وارد شده در سیستم ثبت نشده است.')
            res.redirect('/login');
        }
    }
    else {
        req.flash('error', 'کاربری با اطلاعات وارد شده در سیستم ثبت نشده است.')
        res.redirect('/login');
    }
}


exports.getClass = async (req, res) => {
    const errorMessages = req.flash('error');
    const sucssesMessages = req.flash('msg');
    let errorMessage = false;
    let sucssesMessage;
    if (errorMessages.length > 0) {
        errorMessage = errorMessages[0];
    } else {
        errorMessage = false;
    }
    if (sucssesMessages.length > 0) {
        sucssesMessage = sucssesMessages[0];
    } else {
        sucssesMessage = false;
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errorMessage = errors.array()[0].msg;
        //console.log(errors.array()[1]);
        req.flash('error', errorMessage)
        return res.redirect('/error');
    }
    const classId = req.params.classId;
    
    const studentId = req.session.studentId;

    const student = await Student.findById(studentId);
    if (student) {
        const classOb = await Class.findById(classId);
        if (classOb) {
            if (student.classId.toString() === classOb._id.toString()) {
                const examList = await (await classOb.populate('exams.examId')).execPopulate();
                const list = examList.exams;
                let examExist = true;
                if (list.length < 1) {
                    examExist = false;
                }
                res.render('./user/dashboard', {
                    title: 'میز کار',
                    exams: list,
                    examExist: examExist,
                    classId: classId,
                    studentStatus: student.status,
                    sucssesMessage: sucssesMessage,
                    errorMessage:errorMessage
                })
            } else {
                req.flash('error', 'کاربر اجازه دسترسی به این کلاس را ندارد.');
                res.redirect('/error');
            }
        }
        else {
            req.flash('error','کلاس درخواست شده در سیستم ثبت نشده است.')
            res.redirect('/error');
        }
    } else {
        req.flash('error','دانش آموزی با مشخصات وارد شده در سیستم ثبت نشده است.')
        res.redirect('/error');
    }
}

exports.getIdentityConfirmation = async (req, res) => {

    const classId = req.params.classId;
    const errorMessages = req.flash('error');
    const sucssesMessages = req.flash('msg');
    let errorMessage;
    let sucssesMessage;
    if (errorMessages.length > 0) {
        errorMessage = errorMessages[0];
    } else {
        errorMessage = false;
    }
    if (sucssesMessages.length > 0) {
        sucssesMessage = sucssesMessages[0];
    } else {
        sucssesMessage = false;
    }

    const studentId = req.session.studentId;

    const studnet = await Student.findById(studentId);
    if (studnet) {
        if (studnet.status === false) {
            res.render('./user/identityConfirmation', {
                title: 'تایید هویت',
                sucssesMessage: sucssesMessage,
                errorMessage: errorMessage,
                classId: classId
            })
        }else{res.redirect('/class/'+classId)}
    }
}

exports.postIdentityConfirmation = async (req, res) => {
    const errors = validationResult(req);
    const classId = req.params.classId;
    if (!errors.isEmpty()) {
        const errorMessage = errors.array()[0].msg;
        //console.log(errors.array()[1]);
        req.flash('error', errorMessage)
        return res.redirect('/class/'+classId+'/student/identityConfirmation');
    }
    const inputName = req.body.name;
    const inputLastname = req.body.lastName;
    
    const inputPassword = req.body.password;

    const studentId = req.session.studentId;
    const student = await Student.findById(studentId);
    if (student) {
        student.name = inputName;
        student.lastName = inputLastname;
        student.password = inputPassword;
        student.status = true;

        const result = await student.save();
        req.flash('msg','هویت شما با موفقیت ثبت شد.')
        res.redirect('/class/'+classId);
    }
    else {
        res.send('student not found')
    }
}

exports.postStartExam = async (req, res) => {
    const errors = validationResult(req);
    let errorMessage = false;
    if (!errors.isEmpty()) {
        errorMessage = errors.array()[0].msg;
        req.flash('error', errorMessage);
        return res.redirect('/error');
    }

    const classId = req.params.classId;
    const examId = req.body.examId;
    const studentId = req.session.studentId;

    const exam = await Exam.findOne({ _id: examId });
    if (exam) {
        const studentIndexInExam = exam.StudentAnswers.findIndex(ob => {
            return ob.studentId.toString()===studentId.toString()
        })
        if (studentIndexInExam > -1) {
            req.flash('error','شما تنها مجاز به یکبار شرکت در آزمون هستید.')
            return res.redirect('/error')
        } else {
            if (exam.AvailableToTheStudent) {
            const questions = exam.questions;
            res.render('./user/exam', {
                title: exam.title,
                    questions: questions,
                    classId: classId,
                    examId:examId
                })
            }
            else {
                res.redirect('/class/' + classId);
            }
        }
    }
    else {
        res.send('exam not foound!');
    }
}

exports.postSendAnswer = async (req, res) => {
    const errorList = req.flash('error');
    if (errorList.length>0) {
        return res.json({ 'status': 'error','message':errorList[0]})
    }
    const errors = validationResult(req);
    let errorMessage = false;
    if (!errors.isEmpty()) {
        errorMessage = errors.array()[0].msg;
        req.flash('error', errorMessage)
        return res.redirect('/error');
    }
    const answer = req.body.answer;
    const questionId = req.body.questionId;
    const studentId = req.session.studentId;
    const examId = req.body.examId;
    const inputImages = req.files;
    const classId = req.params.classId;

    const student = await Student.findById(studentId)
    if (student) {
        const exam = await Exam.findOne({ _id: examId });
        if (exam) {
            if (exam.AvailableToTheStudent === true) {
                const studentIndexInExam = exam.StudentAnswers.findIndex(ob => {
                    return ob.studentId.toString()===student._id.toString()
                })
                if (studentIndexInExam > -1) {
                    return res.json({status:'error',message:'شما تنها مجاز به یکبار شرکت در آزمون هستید.'})
                }
                let answerList = [];
                for (let i = 0; i < questionId.length; i++){
                    const qId = mongoose.Types.ObjectId(questionId[i]);
                    answerList.push({
                        questionId: qId,
                        text:answer[i].toString()
                    })
                }
                let images = [];
                for (let i = 0; i < inputImages.length; i++){
                    images.push({imageUrl:inputImages[i].path})
                }
                exam.StudentAnswers.push({
                    studentId: student._id,
                    reviewed: false,
                    point:0,
                    answers: answerList,
                    imagesList:images
                })
                const result = await exam.save();
    
                return res.json({'status':'ok','message':'اطلاعات با موفقیت ارسال شد.'})
            } else {
                req.flash('error','زمان آزمون به پایان رسیده است.')
                res.send('exam expired!');
            }
        } else {
            res.send('exam not fouind');
        }
    }
    else {
        res.send('student not found')
    }
}

//test ------------------------------------------------------------------------------------------------------------
exports.getExamExample = (req, res) => {

    res.render('./user/examExample', {
        title: 'نمونه سوال',
        classId:''
    })
}

exports.getSucsses = async (req, res) => {
    const studentId = req.session.studentId;
    const student = await Student.findById(studentId);
    res.render('./user/examFinished', {
        title: 'پایان آزمون',
        classId: student.classId
    })
}

exports.postLogOut = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log(err);
        }
        res.redirect('/');
    })
}

exports.getErrorPage = (req,res)=> {
    const errorMessages = req.flash('error');
    let errorMessage;
    if (errorMessages.length > 0) {
        errorMessage = errorMessages[0];
    } else {
        errorMessage = false;
    }
    req.session.destroy(err => {
        if (err) {
            console.log(err);
        } else {
            res.render('./user/error', {
                title: 'Error',
                errorMessage: errorMessage,
                classId:false
            })
        }
    })
}