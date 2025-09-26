import mongoose, { Document, Schema } from 'mongoose';

export interface IContact extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  subject?: string; // เพิ่มหัวข้อที่ติดต่อ
  createdAt: Date;
}

const ContactSchema = new Schema<IContact>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  company: { type: String },
  subject: { type: String }, // เพิ่มใน schema ด้วย
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IContact>('Contact', ContactSchema);
