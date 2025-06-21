import dynamoose,{ Schema, model} from "dynamoose";
const moduleStatus=new Schema({
    moduleId:{
        type:String,
        required:true,
    },
    completed:{
        type:Boolean,
        required:true,
    }
});
const userCourse=new Schema({
    userId:{
        type:String,
        hashKey: true,
        required: true,
    },
    courseId: {
        type: String,
        required: true,
        rangeKey: true,//composite key
        index: {
            name: "courseIdIndex", // 🔍 你要查询时用的名字
            type: "global"
          }
    },
    courseTitle:{
        type: String,
        required: true,
    },
    progressPercentage:{
        type:Number,
        required:true,
    },
    modules:{
        type:Array,
        schema:[moduleStatus],// This array includes all modules of the course and a flag indicating whether the student has completed each module.

    }
});


const Progress = dynamoose.model("Progress", userCourse, {
    create: true,  // automatically create a table when running the project
    update: true   // automatically update the schema to match the schema definition
  });
export default Progress;
