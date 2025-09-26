import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  password: string;
  role: 'admin' | 'user';
  isPermanent?: boolean; // เพิ่มฟิลด์สำหรับ Admin ถาวร
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  isPermanent: { type: Boolean, default: false }, // ค่าเริ่มต้นเป็น false
});

// Hash password ก่อนบันทึก
UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

export default mongoose.model<IUser>('User', UserSchema);