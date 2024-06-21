import { Request, Response } from 'express';
import { PlaylistService } from './playlist-service';
import multer from 'multer';
import { authMiddleware } from '../../middlewares/auth-middleware';
import Playlist from './models/Playlist';
import mongoose from 'mongoose';
import User from '../user/models/User';

const upload = multer();
const playlistService = new PlaylistService();

export const createPlaylist =  async (req: Request, res: Response) => {
        try {
            const { name, description, genre } = req.body;
            const userId = (req as any).user.id;
            const coverImage = req.file;
            
            if (!coverImage) {
                return res.status(400).send('Cover image is required.');
            }

            const playlist = await playlistService.createPlaylist({
                name,
                userId,
                coverImageBuffer: coverImage.buffer,
                coverImageType: coverImage.mimetype,
                description,
                genre
            });

            res.status(201).json(playlist);
        } catch (error) {
            console.error('Error creating playlist:', error);
            res.status(500).send('Internal server error');
        }
    }

export const getPlaylists = [
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const playlists = await playlistService.getPlaylists();
      console.log(playlists);
      
      res.status(200).json(playlists);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      res.status(500).send('Internal server error');
    }
  }
];

export const updatePlaylist = [
  authMiddleware,
  upload.single('coverImage'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, description, genre } = req.body;
      const coverImage = req.file;
      const updateData = {
        name,
        description,
        genre,
        coverImageBuffer: coverImage ? coverImage.buffer : undefined,
        coverImageType: coverImage ? coverImage.mimetype : undefined
      };

      const updatedPlaylist = await playlistService.updatePlaylist(id, updateData);
      if (!updatedPlaylist) {
        return res.status(404).send('Playlist not found.');
      }

      res.status(200).json(updatedPlaylist);
    } catch (error) {
      console.error('Error updating playlist:', error);
      res.status(500).send('Internal server error');
    }
  }
];

export const deletePlaylist = [
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = await playlistService.deletePlaylist(id);
      if (!success) {
        return res.status(404).send('Playlist not found.');
      }

      res.status(200).send('Playlist deleted successfully.');
    } catch (error) {
      console.error('Error deleting playlist:', error);
      res.status(500).send('Internal server error');
    }
  }
];

export const addSongToPlaylist = [
    async (req: Request, res: Response) => {
        try {
            const { playlistId, songId } = req.body;
            
            const updatedPlaylist = await playlistService.addSongToPlaylist(playlistId, songId);

            
            
            if (!updatedPlaylist) {
                return res.status(404).send('Playlist not found or song already in playlist.');
            }
            res.status(200).json(updatedPlaylist);
        } catch (error) {
            console.error('Error adding song to playlist:', error);
            res.status(500).send('Internal server error');
        }
    }
];

export const getUserPlaylists = async (req: Request, res: Response) => {
    const userId = req.params.userId; 
    try {
      const playlists = await playlistService.getUserPlaylists(userId);
      res.json(playlists);
    } catch (error) {
      console.error('Error fetching user playlists:', error);
      res.status(500).send('Internal server error');
    }
};

export const getPlaylistById = async (req: Request, res: Response) => {
    const playlistId = req.params.playlistId;
    try {
      const playlist = await playlistService.getPlaylistById(playlistId);
      if (!playlist) {
        return res.status(404).send('Playlist not found.');
      }
      res.json(playlist);
    } catch (error) {
      console.error('Error fetching playlist:', error);
      res.status(500).send('Internal server error');
    }
}

export const likePlaylist =[ authMiddleware, async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { playlistId } = req.params;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const playlistObjectId = new mongoose.Types.ObjectId(playlistId);

    try {
        const playlist = await Playlist.findById(playlistObjectId);
        const user = await User.findById(userObjectId);

        if (!playlist || !user) {
            return res.status(404).send('Playlist or User not found.');
        }

        const isAlreadyLiked = playlist.likes.some(id => id.toString() === userObjectId.toString());
        if (isAlreadyLiked) {
            await Playlist.findByIdAndUpdate(playlistObjectId, { $pull: { likes: userObjectId } });
            await User.findByIdAndUpdate(userObjectId, { $pull: { favoritePlaylists: playlistObjectId } });
        } else {
            await Playlist.findByIdAndUpdate(playlistObjectId, { $addToSet: { likes: userObjectId } });
            await User.findByIdAndUpdate(userObjectId, { $addToSet: { favoritePlaylists: playlistObjectId } });
        }

        res.status(200).json({ liked: !isAlreadyLiked });
    } catch (error) {
        console.error('Error liking/unliking playlist:', error);
        res.status(500).send('Internal server error');
    }
}
]

export const getPlaylistLikeStatus = async (req, res) => {
    const userId = (req as any).user.id;
    const { playlistId } = req.params;

    try {
        const playlist = await Playlist.findById(playlistId);
        const liked = playlist && playlist.likes.some(id => id.toString() === userId.toString());
        res.status(200).json({ liked });
    } catch (error) {
        console.error('Error fetching playlist like status:', error);
        res.status(500).send('Internal server error');
    }
};


export const unlikePlaylist = async (req, res) => {
    const userId = (req as any).user.id;
    const { playlistId } = req.params;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const playlistObjectId = new mongoose.Types.ObjectId(playlistId);

    try {
        await Playlist.findByIdAndUpdate(playlistObjectId, { $pull: { likes: userObjectId } });
        await User.findByIdAndUpdate(userObjectId, { $pull: { favoritePlaylists: playlistObjectId } });

        res.status(200).send('Playlist unliked and removed from favorites');
    } catch (error) {
        console.error('Error unliking playlist:', error);
        res.status(500).send('Internal server error');
    }
};


  