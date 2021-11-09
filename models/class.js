const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const classSchema = new Schema({
    adminId: {
        type: Schema.Types.ObjectId,
        required:true
    },
    number: {
        type: String,
        required:true
    },
    teachers: [
        {
            teacherId: {
                type: Schema.Types.ObjectId,
                required: true,
                ref:'Teacher'
            },
            username: {
                type: String,
                required:true,
            },
            _id: false
        }
    ],
    students: [
        {
            studentId: {
                type: Schema.Types.ObjectId,
                required: true,
                ref:'Student'
            },
            username: {
                type: String,
                required:true,
            },_id:false
        }
    ],
    exams: [
        {
            examId: {
                type: Schema.Types.ObjectId,
                required: true,
                ref:'Exam'
            },_id:false
        }
    ]
})

classSchema.methods.getConStudent = function (username) {
    const conStudent = this.students.findIndex(student => {
        return student.username === username;
    })
    return conStudent;
}

classSchema.methods.addStudent = function (id,username) {
    let updatedStudent = [...this.students];
    updatedStudent.push({
        studentId: id,
        username:username
    })
    this.students = updatedStudent;
    return this.save();
}

classSchema.methods.getConTeacher = function (username) {
    const conTeacher = this.teachers.findIndex(teacher => {
        return teacher.username === username;
    })
    return conTeacher;
}

classSchema.methods.addTeacher = function (id,username) {
    let updatedTeacher = [...this.teachers];
    updatedTeacher.push({
        teacherId: id,
        username:username
    })
    this.teachers = updatedTeacher;
    return this.save();
}

classSchema.methods.addExam = function (id) {
    const updatedExams = [...this.exams];
    updatedExams.push({
        examId: id
    });
    this.exams = updatedExams;
    return this.save();
}


classSchema.methods.isTeacher = function (id) {
    const index = this.teachers.findIndex(p => {
        return p.teacherId.toString() === id;
    })
    if (index > -1) { return true }
    else{return false}
}

classSchema.methods.deleteExam = function (id) {
    const examId = id.toString();
    const exams = this.exams.filter(p => {
        return p.examId.toString() !== examId;
    })
    this.exams = exams;
    return this.save();
}


module.exports = mongoose.model('Class', classSchema);