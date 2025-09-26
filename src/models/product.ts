import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: 'ตู้พาเนล' | 'ตู้เฟรม';
  images: {
    url: string;
    publicId: string;
  }[];
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, enum: ['ตู้พาเนล', 'ตู้เฟรม'], required: true },
  images: [
    {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },
  ],
});

export default mongoose.model<IProduct>('Product', ProductSchema);
