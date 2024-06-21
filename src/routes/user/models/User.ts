import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  email: string
  username?: string
  password: string
  avatarUrl?: string
  description?: string
  favoriteSongs: Schema.Types.ObjectId[]
  favoritePlaylists: Schema.Types.ObjectId[]
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String },
  password: { type: String, required: true },
  avatarUrl: { type: String, required: false },
  description: { type: String, required: false, default: 'No description yet', },
  favoriteSongs: [{ type: Schema.Types.ObjectId, ref: 'Song' }],
  favoritePlaylists: [{ type: Schema.Types.ObjectId, ref: 'Playlist' }]
})

export default mongoose.model<IUser>('User', UserSchema)
