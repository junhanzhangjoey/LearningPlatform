import dynamoose,{ Schema, model} from "dynamoose";
const userSchema=new Schema({
  userId: {
    type: String,
    required: true,
  },
});
const commentSchema = new Schema({
  commentId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: String,
    required: true,
  },
});
const moduleSchema = new Schema({
  moduleId: {
    type: String,
    hashKey: true,
    required: true,
  },
  courseId: {
    type: String,
    required: true,
    index: {
      name: "courseIdIndex",
      type: "global"
    }//can query on courseId
  },
  type: {
    type: String,
    enum: ["Text","Video"],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  comments: {
    type: Array,
    schema: [commentSchema],
  },
  moduleVideo: {
    type: String,
  },
  order: {
    type: Number,
    required: true
  },
});

const courseSchema = new Schema(
  {
    courseId: {
      type: String,
      hashKey: true,
      required: true,
    },
    teacherId: {
      type: String,
      required: true,
      index: {
        name: 'teacherIdIndex',
        global: true,
      }as any,
    },
    teacherName: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    category: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    price: {
      type: Number,
    },
    level: {
      type: String,
      required: true,
      enum: ["Beginner", "Intermediate", "Advanced"],
    },
    status: {
      type: String,
      required: true,
      enum: ["Draft", "Published"],
    },
    enrollments: {
      type: Array,
      schema: [userSchema],
    },
  },
  {
    timestamps: true,
  }
);

const Course = dynamoose.model("Course", courseSchema,{
  create: true,
  update: true 
});
const Module = dynamoose.model("Module", moduleSchema, {
  create: true,  // automatically create a table when running the project
  update: true   // automatically update the schema to match the schema definition
});
export  {Course,Module};
