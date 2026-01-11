import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

const usersSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true, versionKey: false },
);

usersSchema.methods.toJSON = function () {
  const obj = this.toObject(); //'this' is current user documents and .toObj converts it into plain JS obj
  delete obj.password;
  return obj;
};

export const UserCollection = model('users', usersSchema);
