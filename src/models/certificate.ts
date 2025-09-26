import mongoose, { Schema, Document } from 'mongoose';

export interface ICertificate extends Document {
  name: string;
  url: string;
  public_id?: string;
  category: 'สี' | 'เหล็ก' | 'สถาบันไฟฟ้าและอิเล็กทรอนิกส์';
  logo?: {
    url: string;
    public_id: string;
  };
}

const CertificateSchema: Schema = new Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  public_id: { type: String },
  category: { type: String, enum: ['สี', 'เหล็ก' ,'สถาบันไฟฟ้าและอิเล็กทรอนิกส์'], required: true }, // ✅ ใส่ enum ด้วย

  logo: {
    url: { type: String },
    public_id: { type: String }
  }
});

export default mongoose.model<ICertificate>('Certificate', CertificateSchema);
