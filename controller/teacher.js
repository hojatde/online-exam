const Student = require('../models/student');
const Exam = require('../models/exam');
const Class = require('../models/class');
const Teacher = require('../models/teacher');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
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
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'video/mp4') {
        cb(null,true)
    } else {
        cb('فرمت فایل انتخاب شده غیر مجاز است.', false);
    }
}
const uploadImage = multer({ storage: fileStorage, fileFilter: fileFilter, limits: { fileSize:1024*1024*8} }).array('image', 2);

exports.getTeacherLogin = (req, res) => {
    const errorMessages = req.flash('error');
    let message;
    if (errorMessages.length > 0) {
        message = errorMessages[0];
    } else {
        message = false;
    }

    res.render('./teacher/login', {
        title: 'ورود دبیر',
        errorMessage:message
    })
}

exports.postTeacherLogin = async (req, res) => {
    const inputUsername = req.body.username;
    const inputPassword = req.body.password;

    const teacher = await Teacher.findOne({ username: inputUsername });
    if (teacher) {
        if (teacher.password === inputPassword) {
            req.session.isLogin = true;
            req.session.isTeacher = true;
            req.session.teacherId = teacher._id;

            res.redirect('/teacher/dashboard');
        } else {
            req.flash('error', 'دبیری با اطلاعات وارد شده در سیستم ثبت نشده است.');
            res.redirect('/teacher/login');
        }
    } else {
        req.flash('error', 'دبیری با اطلاعات وارد شده در سیستم ثبت نشده است.');
        res.redirect('/teacher/login');
    }
}

exports.getDashboard = (req, res) => {
    res.render('./teacher/dashboard', {
        title: 'میز کار',
    })
}

exports.getAddStudentForTeacher = (req, res) => {
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
    res.render('./teacher/addStudent', {
        title: 'add-Student',
        sucssesMessage: sucssesMessage,
        errorMessage:errorMessage
    })
}

exports.postAddStudentForTeacher = async (req, res) => {
    const errors = validationResult(req);
    let errorMessage = false;
    if (!errors.isEmpty()) {
        errorMessage = errors.array()[0].msg;
        req.flash('error', errorMessage)
        return res.redirect('/teacher/addStudent');
    }

    const inputName = req.body.name;
    const inputFamily = req.body.family;
    const inputUsername = req.body.username;
    const inputPassword = req.body.password;
    const classNumber = req.body.classNumber;
    const teacherId = req.session.teacherId;

    const classOb = await Class.findOne({ number: classNumber });
    if (classOb) {
        const student = new Student({teacherId:teacherId, name: inputName, family: inputFamily, username: inputUsername, password: inputPassword, classId: classOb._id })
        student.save().catch(err => { console.log(err) });
        let result = await classOb.addStudent(student._id,inputUsername);
        if (!result) {
            console.log('salam');
        }
        req.flash('msg','دانش آموز با موفقیت به کلاس اضافه شد.')
        res.redirect('/teacher/addStudent');
    } else {
        req.flash('error','کلاسی با شناسه وارد شده ثبت نشده است.')
        res.redirect('/teacher/addStudent');
    }
    
}

exports.getClassListOfTeacher = async(req, res) => {
    const teacherId = req.session.teacherId;
    const teacher = await Teacher.findById(teacherId);
    let classes = [];
    if (teacher) {
        const list = await teacher.populate('classes.classId').execPopulate();
        classes = list.classes;
    }
    res.render('./teacher/classes', {
        title: 'classe',
        classes:classes
    })

}

exports.getSelectClassTeacher = async (req, res) => {
    const errors = validationResult(req);
    let errorMessage = false;
    if (!errors.isEmpty()) {
        errorMessage = errors.array()[0].msg;
        req.flash('error', errorMessage)
        return res.redirect('/error');
    }

    const teacherId = req.session.teacherId;
    const classStringId = req.params.id;
    
    let studentsList = [];
    let teachersList = [];
    const teacher = await Teacher.findById(teacherId);
    if (teacher) {
        const resultFoundClasss = await teacher.isClassForTeacher(classStringId);
        if(resultFoundClasss > -1) {
            const classOb = await Class.findById(classStringId);
            if (classOb) {
                const list = await classOb.populate(['students.studentId','teachers.teacherId']).execPopulate();
                studentsList = list.students;
                res.render('./teacher/class', {
                    title: 'class',
                    classId:classOb._id,
                    students: studentsList,
                });
            } else{
                req.flash('error', 'دسترسی غیر مجاز');
                res.redirect('/error');
            }
        }
    } else {
        req.flash('error', 'دسترسی غیر مجاز');
        res.redirect('/error');
    }

}

exports.getExamsOFClass = async (req, res) => {
    const errors = validationResult(req);
    let errorMessage = false;
    if (!errors.isEmpty()) {
        errorMessage = errors.array()[0].msg;
        req.flash('error', errorMessage)
        return res.redirect('/error');
    }

    const classId = req.params.id;
    const teacherId = req.session.teacherId;

    const classOb = await Class.findById(classId);
    let exams = [];
    
    if (classOb) {
        const list = await classOb.populate('exams.examId').execPopulate();
        const examsList = list.exams;
        exams = examsList.filter(exam => {
            return exam.examId.teacherId.toString() === teacherId.toString();
        })
        if (exams.length < 1) { exams = null }
        res.render('./teacher/exams', {
            title: 'exams',
            classId:classOb._id,
            exams:exams
        })
    } else{
        req.flash('error', 'آزمون یافت نشد.');
        res.redirect('/error');
    }
        
}

exports.postCreateExamInSelectedClass = async (req, res) => {
    const errors = validationResult(req);
    let errorMessage = false;
    if (!errors.isEmpty()) {
        errorMessage = errors.array()[0].msg;
        req.flash('error', errorMessage)
        return res.redirect('/error');
    }

    const inputClassId = req.params.id;
    const inputTitle = req.body.title;
    const teacherId = req.session.teacherId;
    
    const teacher = await Teacher.findById(teacherId);
    if (teacher) {
        const exam = new Exam({ status: false,finished:false,AvailableToTheStudent:false, classId:inputClassId,teacherId:teacher._id,title:inputTitle });
        await exam.save();
        const classOb = await Class.findById(inputClassId);
        await classOb.addExam(exam._id);
        res.redirect('/teacher/class/'+inputClassId+'/exams');
    } else {
        req.flash('error', 'تلاش برای دسترسی غیر مجاز');
        res.redirect('/error');
    }
}

exports.getSelectExamOfClass = async (req, res) => {
    const errors = validationResult(req);
    let errorMessage = false;
    if (!errors.isEmpty()) {
        errorMessage = errors.array()[0].msg;
        req.flash('error', errorMessage)
        return res.redirect('/error');
    }

    const classId = req.params.classId;
    const examId = req.query.exam;
    const teacherId = req.session.teacherId;

    const exam = await Exam.findById(examId);
    if (exam) {
        if (exam.teacherId.toString() === teacherId.toString()) {
            const list = exam.questions;
        
            res.render('./teacher/editQuestion', {
                title: 'add Question',
                questions: list,
                classId: classId,
                examId:examId
            })
        } else {
            req.flash('error','تلاش برای دسترسی غیر مجاز');
            res.redirect('/error');
        }
    } else {
        req.flash('error','تلاش برای دسترسی غیر مجاز');
        res.redirect('/error');
    }
}


exports.postUploadImage = async (req, res, next) => {
    uploadImage(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            req.flash('error','اندازه فایل ارسال شده بیشتر از حد مجاز است')
        } else if (err) {
            req.flash('error',err)
        }
        next();
    })
}
exports.postEditQuestionOfExam = async (req, res, err) => {
    const errorList = req.flash('error');
    if (errorList.length > 0) {
        return res.json({ 'status': 'error','message':errorList[0]})
    }
    const inputClassId = req.body.classId;
    const examId = req.body.examId;
    const questionText = req.body.text;
    const editMode = req.query.edit;
    const deleteMode = req.query.delete;
    const newMode = req.query.new;
    const teacherId = req.session.teacherId;
    const inputImageUrl = req.files;

    let editingMode = false;
    let deletingMode = false;
    let newModing = false;
    
    if (deleteMode === 'true') {
        deletingMode = true;
    }
    if (editMode === 'true') {
        editingMode = true;
    }
    if (newMode === 'true') {
        newModing=true
    }

    const exam = await Exam.findById(examId);
    if (exam) {
        if (exam.teacherId.toString() === teacherId.toString()) {
            if (deletingMode) {
            const questionId = req.body.questionId;
                const result = await exam.deleteQuestion(questionId);
                res.json({ 'status': 'deleteQuestion',message:'سوال با موفقیت حذف شد.' })
                //console.log(result);
            } else if (editingMode) {
                const questionId = req.body.questionId;
                const result = await exam.editQuestion(questionId, questionText);
                res.json({ 'status': 'editQuestion','newText':questionText,message:'اطلاعات با موفقیت ویرایش شد.' })
                //console.log(result);
            } else if (newModing) {
                let imagePath = '';
                let result;
                if (inputImageUrl[0] === undefined) {
                    imagePath = false;
                    result = await exam.addQuestion(questionText);
                } else {
                    imagePath = inputImageUrl[0].path;
                    result = await exam.addQuestionByImage(questionText,inputImageUrl[0].path);
                }
                const lengthQuestion = result.questions.length;
                const sendQuestionId = result.questions[lengthQuestion - 1]._id;
                res.json({ 'status': 'newQuestion','questionText': questionText,'imgUrl': imagePath,'questionId':sendQuestionId,message:'اطلاعات با موفقیت ارسال شد.' })
                //console.log(result);
            } else {
                return res.redirect('/teacher/class/' + inputClassId + '/edit/?exam=' + examId);
            }
        } else {
            req.flash('error','شما اجازه دسترسی به این آزمون را ندارید.');
            res.redirect('/error');
        }
    } else {
        req.flash('error', 'آزمون در سیستم ثبت نشده است.');
        res.redirect('/error');
    }

}

exports.postDeleteExam = async (req, res) => {
    const teacherId = req.session.teacherId;
    const examId = req.body.examId;
    const classId = req.params.classId;
    
    const classOb = await Class.findOne({ _id: classId });
    if (classOb) {
        const exam = await Exam.findOne({ _id: examId })
        if (exam) {
            if (exam.teacherId.toString() === teacherId.toString()) {
                const result2 = await classOb.deleteExam(exam._id);
                const result = await Exam.findByIdAndDelete(exam._id);
                res.redirect('/teacher/class/' + classId + '/exams');
            } else {
                req.flash('error', 'شما اجازه دسترسی به این آزمون را ندارید.');
                res.redirect('/error');
            }
        } else {
            req.flash('error', 'آزمون یافت نشد');
            res.redirect('/error');
        }
    }

}

exports.postOpenExam = async (req, res) => {
    const examId = req.body.examId;
    const classId = req.params.classId;
    const teacherId = req.session.teacherId;
    
    const exam = await Exam.findOne({ _id: examId });
    if (exam) {
        if (exam.teacherId.toString() === teacherId.toString()) {
            exam.AvailableToTheStudent = true;
            const result = await exam.save();
            res.redirect('/teacher/class/' + classId + '/exams');
        } else {
            req.flash('error', 'شما اجازه دسترسی به این آزمون را ندارید.');
            res.redirect('/error');
        }
    } else {
        req.flash('error', 'آزمون یافت نشد.');
        res.redirect('/error');
    }
}

exports.postCloseExam = async (req, res) => {
    const examId = req.body.examId;
    const classId = req.params.classId;
    const teacherId = req.session.teacherId;
    
    
    const exam = await Exam.findOne({ _id: examId });
    if (exam) {
        if (exam.teacherId.toString() === teacherId.toString()) {
            exam.AvailableToTheStudent = false;
            const result = await exam.save();
            res.redirect('/teacher/class/' + classId + '/exams');
        } else {
            req.flash('error', 'شما اجازه دسترسی به آزمون را ندارید.');
            res.redirect('/error');
        }
    } else {
        req.flash('error', 'آزمون یافت نشد.');
        res.redirect('/error');
    }
}

exports.postFinishExam = async (req, res) => {
    const examId = req.body.examId;
    const classId = req.params.classId;
    const teacherId = req.session.teacherId;
    
    const exam = await Exam.findOne({ _id: examId });
    if (exam) {
        if (exam.teacherId.toString() === teacherId.toString()) {
            exam.finished = true;
            exam.AvailableToTheStudent = false;
            const result = await exam.save();
            res.redirect('/teacher/class/' + classId + '/exams');
        } else {
            req.flash('error', 'شما اجازه دسترسی به این آزمون را ندارید.');
            res.redirect('/error');
        }
    } else {
        req.flash('error', 'تلاش برای دسترسی غیر مجاز');
        res.redirect('/error');
    }
}

exports.getStudentsAnswers = async (req, res) => {
    const examId = req.params.examId;
    const classId = req.params.classId;
    const teacherId = req.session.teacherId;

    const exam = await Exam.findById(examId);
    if (exam) {
        if (exam.teacherId.toString() === teacherId.toString()) {
            const list = await exam.populate(['StudentAnswers.studentId']).execPopulate();
            const questionList = exam.questions;
            const answers = list.StudentAnswers;
            res.render('./teacher/view', {
                title: 'برسی امتحان',
                answers: answers,
                questionList: questionList,
                classId: classId,
                examId: examId
            })
        } else {
            req.flash('error', 'شما اجازه دسترسی به این آزمون را ندارید.');
            res.redirect('/error');
        }
    } else {
        req.flash('error', 'آزمون پیدا نشد.');
        res.redirect('/error');
    }
}

exports.getSelectedStudentAnswer = async (req, res) => {
    const examId = req.params.examId;
    const classId = req.params.classId;
    const studentId = req.query.studentId;
    const teacherId = req.session.teacherId;

    const exam = await Exam.findOne({ _id: examId });
    if (exam) {
        if (exam.teacherId.toString() === teacherId.toString()) {
            let examFound={}
            const answers = exam.StudentAnswers;
            let answerslength = answers.length;
            for (let i = 0; i < answerslength; i++){
                if (answers[i].studentId.toString() === studentId) {
                    examFound = answers[i];
                    break;
                }
            }
    
            const questions = exam.questions;
            const studentAnswer = examFound.answers;
            const studentImages = examFound.imagesList;
            res.render('./teacher/reviewed', {
                title: 'reviewed',
                answer: studentAnswer,
                questions: questions,
                classId: classId,
                examId: examId,
                studentId: studentId,
                studentImages:studentImages
            })
        } else {
            req.flash('error', 'شما اجازه دسترسی به این آزمون را ندارید.');
            res.redirect('/error');    
        }
    } else {
        req.flash('error', 'آزمون پیدا نشد.');
        res.redirect('/error');
    }
}

exports.postPointOfSelectedStudentExam = async (req, res)=>{
    const examId = req.params.examId;
    const classId = req.params.classId;
    const studentId = req.body.studentId;
    const sumPoint = req.body.totalPoint;
    const sumPointParse = parseFloat(sumPoint);
    const teacherId = req.session.teacherId;

    const exam = await Exam.findOne({ _id: examId });
    if (exam) {
        if (exam.teacherId.toString() === teacherId.toString()) {
            let answerslength = exam.StudentAnswers.length;
            for (let i = 0; i < answerslength; i++) {
                if (exam.StudentAnswers[i].studentId.toString() === studentId) {
                    exam.StudentAnswers[i].point = sumPointParse;
                    exam.StudentAnswers[i].reviewed = true;
                    const result = await exam.save();
                    //http://localhost:3001/teacher/class/6096f5280284a325aca74fff/exam/view/6097eb1561935d25247c3035
                    return res.redirect('/teacher/class/' + classId + '/exam/view/' + examId);
                }
            }
            res.send('exam of student not found!');
        }
        res.send('student not found')
    } else {
        res.send('exam not found!')
    }
}