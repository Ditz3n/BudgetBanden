import mongoose, { Schema, Document } from 'mongoose';

// Define the User interface
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
}

// Define the User schema
const UserSchema: Schema<IUser> = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
