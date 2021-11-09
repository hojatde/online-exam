const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
    status: {
        type: Boolean,
        required: true,
        default:false
    },
    teacherId: {
        type: Schema.Types.ObjectId,
        required:false
    },
    name: {
        type: String,
        required: true,
        default:'nonset'
    },
    lastName: {
        type: String,
        required: true,
        default:'nonset'
    },
    username: {
        type: String,
        required:true
    },
    password: {
        type: String,
        required:false
    },
    classId: {
        type: Schema.Types.ObjectId,
        ref: 'Class',
        required:true
    }
})

module.exports = mongoose.model('Student', studentSchema);