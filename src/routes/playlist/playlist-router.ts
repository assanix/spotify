import { Router } from 'express';
import multer from 'multer';
import { createPlaylist, getPlaylists, updatePlaylist, deletePlaylist,getUserPlaylists, addSongToPlaylist, getPlaylistById, likePlaylist, getPlaylistLikeStatus, unlikePlaylist } from './playlist-controller';
import { authMiddleware } from '../../middlewares/auth-middleware';

const playlistRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

playlistRouter.post('/', authMiddleware, upload.single('coverImage'), createPlaylist);
playlistRouter.get('/', authMiddleware, getPlaylists);
playlistRouter.get('/:playlistId', authMiddleware, getPlaylistById);
playlistRouter.put('/:id', authMiddleware, upload.single('coverImage'), updatePlaylist);
playlistRouter.delete('/:id', authMiddleware, deletePlaylist);
playlistRouter.post('/:playlistId/add-song', authMiddleware, addSongToPlaylist);
playlistRouter.get('/user/:userId', authMiddleware, getUserPlaylists);
playlistRouter.post('/:playlistId/like', authMiddleware, likePlaylist);
playlistRouter.get('/:playlistId/like-status', authMiddleware, getPlaylistLikeStatus);
playlistRouter.post('/:playlistId/unlike', authMiddleware, unlikePlaylist);

export default playlistRouter;
