const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const teacherSchema = new Schema({
    adminId: {
        type: Schema.Types.ObjectId,
        required:true
    },
    name: {
        type: String,
        required:false
    },
    family: {
        type: String,
        required:false
    },
    username: {
        type: String,
        required:false
    },
    password: {
        type: String,
        required:false
    },
    classes: [
        {
            classId: {
                type: Schema.Types.ObjectId,
                required: true,
                ref:'Class'
            },
            _id:false
        }
    ]
})

teacherSchema.methods.addClass = function (id) {
    let updatedClasses = [...this.classes];
    updatedClasses.push({
        classId:id
    })
    this.classes = updatedClasses;
    return this.save();
}

teacherSchema.methods.getClass = function () {
    const list = [...this.classes];
    return list;
}

teacherSchema.methods.isClassForTeacher = function (id) {
    const list = [...this.classes];
    const listLength = list.length;
    let result = false;
    for (let i = 0; i < listLength; i++){
        if (list[i].classId.toString() === id) {
            result = i;
            break;
        }
    }
    return result;
}

module.exports = mongoose.model('Teacher', teacherSchema);