import Playlist from './models/Playlist';
import { S3 } from 'aws-sdk';
import mongoose from 'mongoose';


const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

interface PlaylistData {
  name: string;
  userId: string;
  coverImageBuffer: Buffer;
  coverImageType: string;
  description: string;
  genre: string;
  coverUrl?: string;
  songIds?: string[];
}

export class PlaylistService {
  async createPlaylist({ name, userId, coverImageBuffer, coverImageType, description, genre }: PlaylistData) {
    const key = `playlist-covers/${Date.now()}`;
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME as string,
      Key: key,
      Body: coverImageBuffer,
      ContentType: coverImageType,
      ACL: 'public-read'
    };
    const uploadResult = await s3.upload(params).promise();
    
    const playlist = new Playlist({
      name,
      user: userId,
      coverUrl: uploadResult.Location,
      description,
      genre
    });
    await playlist.save();
    return playlist;
  }

  async getPlaylists() {
    return Playlist.find();
  }

  async updatePlaylist(playlistId: string, updateData: Partial<PlaylistData>) {
    const playlist = await Playlist.findById(playlistId).exec();
    if (!playlist) return null;

    if (updateData.coverImageBuffer && updateData.coverImageType) {
      const key = `playlist-covers/${Date.now()}`;
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME as string,
        Key: key,
        Body: updateData.coverImageBuffer,
        ContentType: updateData.coverImageType,
        ACL: 'public-read'
      };
      const uploadResult = await s3.upload(params).promise();
      updateData.coverUrl = uploadResult.Location;
    }

    Object.assign(playlist, updateData);
    await playlist.save();
    return playlist;
  }

  async deletePlaylist(playlistId: string): Promise<boolean> {
    const result = await Playlist.findByIdAndDelete(playlistId);
    return result != null;
  }

  

  async addSongToPlaylist(playlistId: string, songId: string) {
    const playlist = await Playlist.findById(playlistId);
    console.log(playlistId);
    
    
    if (!playlist) {
        return null;
    }

    
    const songObjectId = new mongoose.Types.ObjectId(songId);

 
    if (!playlist.songs.some(id => id.toString() === songObjectId.toString())) {
        playlist.songs.push(songObjectId as any); 
        await playlist.save();
        return playlist;
    }

    return null;
}


async getUserPlaylists(userId: string) {
    try {
      const playlists = await Playlist.find({ user: userId }).populate('songs');
      return playlists;
    } catch (error:any) {
      throw new Error('Error fetching playlists: ' + error.message);
    }
  }

  async getPlaylistById(playlistId: string) {
    return Playlist.findById(playlistId).populate('songs');
  }
}
