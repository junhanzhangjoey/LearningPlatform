import dynamoose,{ Schema, model} from "dynamoose";
const userSchema=new Schema({
    userId: {
      type: String,
      hashKey: true,
      required: true,
    },
    role: {
        type: String,
        enum: ["Student","Teacher","Manager","Admin"],
        required: true,
      },
  });
const User = model("User", userSchema);
export default User;