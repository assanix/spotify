import { Schema, model, Document } from 'mongoose';

interface IPlaylist extends Document {
  name: string;
  user: Schema.Types.ObjectId;
  coverUrl: string;
  description: string;
  genre: string;
  songs: Schema.Types.ObjectId[];
  likes: Schema.Types.ObjectId[];
}

const playlistSchema = new Schema<IPlaylist>({
  name: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  coverUrl: { type: String, required: true },
  description: { type: String, required: true },
  genre: { type: String, required: true, enum: ['Popular', 'For you', 'Hip-Hop', 'Other'] },
  songs: [{ type: Schema.Types.ObjectId, ref: 'Song' }],
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

export default model<IPlaylist>('Playlist', playlistSchema);
