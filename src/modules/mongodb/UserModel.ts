import mongoose, { Schema } from "mongoose";
import { hash } from 'bcryptjs';
import { User } from "../../models/User";

const UserSchema = new Schema<User>(
  {
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true
    },
  }, 
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    }
  }
);

UserSchema.pre('save', async function (next) {
  this.password = await hash(this.password, 8)
  next();
});

export const UserModel = mongoose.model('users', UserSchema)