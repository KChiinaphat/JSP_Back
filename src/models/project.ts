import mongoose, { Schema , Document} from 'mongoose' ; 

export interface IProject extends Document{
    name: string;
    description: string;
    location : string;
    category: 'ตู้พาเนล' | 'ตู้เฟรม';
    images: {
        url: string;
        publicId: string;
    }[];
}

const ProjectSchema: Schema = new Schema({
    name: { type: String, required: true},
    description: { type: String, required: true},
    location: { type: String, required: true},
    category: {type: String, enum:['ตู้พาเนล','ตู้เฟรม'], required: true},
    images : [
        {
            url: { type: String, required: true},
            publicId: { type: String, required:true},
        },
    ],
});

export default mongoose.model<IProject>('Project',ProjectSchema);