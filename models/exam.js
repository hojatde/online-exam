const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const examSchema = new Schema({
    status: {
        type: Boolean,
        required: true
    }, classId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref:'Class'
    }, teacherId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref:'Teacher'
    }, AvailableToTheStudent: {
        type: Boolean,
        required:true
    }, finished: {
        type: Boolean,
        required:true
    },
    title: {
        type: String,
        required:true
    },
    questions: [
        {
            text: {
                type: String,
                required: false
            }, imageUrl: {
                type: String,
                required: false
            }
        }
    ],
    StudentAnswers: [
        {
            studentId: {
                type: Schema.Types.ObjectId,
                required: true,
                ref:'Student'
            },
            answers: [
                {
                    questionId: {
                        type: Schema.Types.ObjectId,
                        required: true,
                        ref:'Question'
                    },
                    text: {
                        type: String,
                        required: false,
                    },_id:false
                }
            ], reviewed: {
                type: Boolean,
                required: true
            }, imagesList: [
                {
                    imageUrl:{
                        type: String,
                        required:false
                    },_id:false
                }
            ]
            , point: {
                type: Number,
                required:true
            }, _id: false
            , registerTime: {
                required:true,
                type: Date,
                default:Date.now()
            }
        }
    ]
})

examSchema.methods.addQuestionByImage = function (text,inputImg) {
    const updateQuestions = [...this.questions];
    updateQuestions.push({
        text: text,
        imageUrl:inputImg
    })

    this.questions = updateQuestions;
    return this.save();
}

examSchema.methods.addQuestion = function (text) {
    const updateQuestions = [...this.questions];
    updateQuestions.push({
        text: text,
    })

    this.questions = updateQuestions;
    return this.save();
}

examSchema.methods.deleteQuestion = function (id) {
    const updateQuestions = this.questions.filter(question => {
        return question._id.toString() !== id;
    });
    this.questions = updateQuestions;
    return this.save();
}

examSchema.methods.editQuestion = function (id, text) {
    const questionIndex = this.questions.findIndex(question => {
        return question._id.toString() === id;
    })
    let updatedQuestion = [...this.questions];
    if (questionIndex > -1) {
        updatedQuestion[questionIndex].text = text;
    }
    this.questions = updatedQuestion;
    return this.save();
}

module.exports = mongoose.model('Exam', examSchema);