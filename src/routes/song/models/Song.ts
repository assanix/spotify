import mongoose, { Document, Schema } from 'mongoose'

export interface ISong extends Document {
    title: string,
    artistId: string,
    songUrl: string,
    image: string,
    likes: Schema.Types.ObjectId[];
}

const SongSchema: Schema = new Schema({
  title: {
    type: String,
    required: true
  },
  artistId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true },
  songUrl: {
    type: String,
    required: true
  },
  image:{
    type: String,
    required: true,
    default: 'https://via.placeholder.com/150',
  },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

export default mongoose.model<ISong>('Song', SongSchema);