const Admin = require('../models/admin');
const Teacher = require('../models/teacher');
const Class = require('../models/class');
const Student = require('../models/student');
const bcrypt = require('bcryptjs');


const { validationResult } = require('express-validator');

exports.getLoginAdmin = (req, res) => {
    const errorMessage = req.flash('error');
    
    let message;

    if (errorMessage.length > 0) {
        message = errorMessage[0];
    } else {
        message = false;
    }

    res.render('./admin/login', {
        title: 'login-admin',
        message: message
    })
}

exports.postLoginAdmin = async(req, res) => {
    const inputUsername = req.body.username;
    const inputPassword = req.body.password;

    const admin = await Admin.findOne({ username: inputUsername});
    if (admin) {
        const isMach = await bcrypt.compare(inputPassword, admin.password);
        if (isMach) {
            req.session.isAdmin = true;
            req.session.adminId = admin._id;
            req.session.isLogin = true;
            res.redirect('/admin/dashboard');
        } else {
            req.flash('error','نام کاربری با رمز عبور مطابقت ندارد.')
            res.redirect('/admin/login');
        }
    }
    else {
        req.flash('error','نام کاربری با رمز عبور مطابقت ندارد.')
        res.redirect('/admin/login');
    }
}

exports.getDashboard = (req, res) => {
    res.render('./admin/dashboard', {
        title: 'میز کار',
    })
}

exports.getAddTeacher = (req, res) => {
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
    

    res.render('./admin/addTeacher', {
        title: 'addTeacher',
        sucssesMessage: sucssesMessage,
        errorMessage:errorMessage
        
    })
}

exports.postAddTeacher = async (req, res) => {
    const errors = validationResult(req);
    let errorMessage = false;
    if (!errors.isEmpty()) {
        errorMessage = errors.array()[0].msg;
        req.flash('error', errorMessage)
        return res.redirect('/admin/addTeacher');
    }
    const inputName = req.body.name;
    const inputFamily = req.body.family;
    const inputUsername = req.body.username;
    const inputPassword = req.body.password;
    const adminId = req.session.adminId;

    const teacherExist = await Teacher.findOne({ username: inputUsername });
    if (teacherExist) {
        req.flash('error', 'دبیر در سیستم ثبت شده است.')
        res.redirect('/admin/addTeacher');
    } else {
        const teacher = new Teacher({adminId:req.session.adminId, name: inputName, family: inputFamily, username: inputUsername, password: inputPassword });
        const result = await teacher.save();
        req.flash('msg','دبیر با موفقیت ثبت شد')
        res.redirect('/admin/addTeacher');
    }
}

exports.getAddClass = (req, res) => {
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

    res.render('./admin/addClass', {
        title: 'addClass',
        errorMessage: errorMessage,
        sucssesMessage,sucssesMessage
    })
}

exports.postAddClass = async (req, res) => {
    const errors = validationResult(req);
    let errorMessage = false;
    if (!errors.isEmpty()) {
        errorMessage = errors.array()[0].msg;
        req.flash('error', errorMessage)
        return res.redirect('/admin/addClass');
    }
    const inputClassNumber = req.body.classNumber;
    const adminId = req.session.adminId;
    const classExist = await Class.findOne({number: inputClassNumber });

    if (classExist) {
        req.flash('error', 'کلاس در سیستم ثبت شده است.')
        res.redirect('/admin/addClass');
    } else {
        const classob = new Class({adminId:adminId, number: inputClassNumber });
        const result = classob.save();
        req.flash('msg','کلاس با موفقیت در سیستم ثبت شد.')
        res.redirect('/admin/addClass');
    }
}

exports.getAddTacherToClass = (req, res) => {
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

    res.render('./admin/addTeacherToClass', {
        title: 'Add Teacher To Class',
        errorMessage: errorMessage,
        sucssesMessage:sucssesMessage
    })
}

exports.postAddTacherToClass = async (req, res) => {
    const errors = validationResult(req);
    let errorMessage = false;
    if (!errors.isEmpty()) {
        errorMessage = errors.array()[0].msg;
        req.flash('error', errorMessage)
        return res.redirect('/admin/addTeacherToClass');
    }
    const teacherUserName = req.body.username;
    const inputClassNumber = req.body.classNumber;

    const teacher = await Teacher.findOne({ username: teacherUserName });
    if (teacher) {
        const classOb = await Class.findOne({ number: inputClassNumber });
        if (classOb) {
            const conTeacher = await classOb.getConTeacher(teacher.username);
            if (conTeacher < 0) {
                await classOb.addTeacher(teacher._id, teacher.username);
                await teacher.addClass(classOb._id);
                req.flash('msg','دبیر با موفقیت به کلاس اضافه شد.')
                res.redirect('/admin/addTeacherToClass');
            }
            else {
                req.flash('error','دبیر از قبل به کلاس اضافه شده است')
                res.redirect('/admin/addTeacherToClass');
            }
        }
        else {
            req.flash('error','کلاس با مشخصات وارد شده در سیستم ثبت نشده است.')
            res.redirect('/admin/addTeacherToClass');
        }
    }
    else {
        req.flash('error','دبیر با مشخصات وارد شده در سیستم ثبت نشده است.')
        res.redirect('/admin/addTeacherToClass');
    }
}

exports.getAddStudent = (req, res) => {
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
    res.render('./admin/addStudent', {
        title: 'add-Student',
        sucssesMessage: sucssesMessage,
        errorMessage:errorMessage
    })
}

exports.postAddStudent = async (req, res) => {
    
    const errors = validationResult(req);
    let errorMessage = false;
    if (!errors.isEmpty()) {
        errorMessage = errors.array()[0].msg;
        req.flash('error', errorMessage)
        return res.redirect('/admin/addStudent');
    }
    const inputUsername = req.body.username;
    const inputPassword = req.body.password;
    const classNumber = req.body.classNumber;

    const classOb = await Class.findOne({ number: classNumber });
    if (classOb) {
        const student = new Student({username: inputUsername, password: inputPassword, classId: classOb._id })
        student.save().catch(err => { console.log(err) });
        let result = await classOb.addStudent(student._id,inputUsername);
        req.flash('msg','دانش آموز با موفقیت به کلاس اضافه شد.')
        res.redirect('/admin/addStudent');
    } else {
        req.flash('error','کلاسی با شناسه وارد شده ثبت نشده است.')
        res.redirect('/admin/addStudent');
    }
}

exports.getViewClasses = async (req, res) => {
    const classesList = await Class.find();
    let classesExist = false;
    if (classesList.length > 0) {
        classesExist = true;
    }
    res.render('./admin/classesList', {
        title: 'لیست کلاس ها',
        classes: classesList,
        classesExist:classesExist
    })
}

exports.getClassForAdmin = async (req, res) => {
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
    const classId = req.params.classId;
    const classOb = await Class.findById(classId);
    if (classOb) {
        const list = await classOb.populate(['teachers.teacherId', 'students.studentId']).execPopulate();
        const teachersList = list.teachers;
        const studentsList = list.students;

        res.render('./admin/viewClass', {
            title: 'نمایش کلاس',
            studentsList, teachersList, classId,
            sucssesMessage: sucssesMessage,
            errorMessage:errorMessage
        })
    }
}

exports.postDeleteTeacherFromClass = async (req, res) => {
    const classId = req.params.classId;
    const errors = validationResult(req);
    let errorMessage = false;
    if (!errors.isEmpty()) {
        errorMessage = errors.array()[0].msg;
        req.flash('error', errorMessage)
        return res.redirect('/admin/class'+classId);
    }
    const teacherId = req.body.teacherId;
    
    const classOb = await Class.findById(classId);
    if (classOb) {
        const newList = classOb.teachers.filter(teacher => {
            return teacher.teacherId.toString() !== teacherId.toString()
        })
        classOb.teachers = newList;
        const result = await classOb.save()
        const teacher = await Teacher.findById(teacherId);
        if (teacher) {
            const newList2 = teacher.classes.filter(ob => {
                return ob.classId.toString() !== classOb._id.toString();
            })
            teacher.classes = newList2;
            const result2 = await teacher.save();
            const result = classOb.save()
        }
        res.redirect('/admin/class/' + classId);
    }
}

exports.postDeleteStudentFromClass = async (req, res) => {
    const classId = req.params.classId;
    const errors = validationResult(req);
    let errorMessage = false;
    if (!errors.isEmpty()) {
        errorMessage = errors.array()[0].msg;
        req.flash('error', errorMessage)
        return res.redirect('/admin/class' + classId);
    }
    const studentId = req.body.studentId;

    const student = await Student.findById(studentId);
    if (student) {
        const classOb = await Class.findById(classId);
        if (classOb) {
            const newStudentList = classOb.students.filter(ob => {
                return ob.studentId.toString() !== student._id.toString();
            })
            classOb.students = newStudentList;
            const result = await classOb.save();
            const result2 = await Student.findByIdAndDelete(studentId);
        }
        res.redirect('/admin/class/' + classId);
    }
}