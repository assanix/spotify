import {Router} from 'express';
import { SongController } from './song-controller';

const songRouter = Router();

const songController = new SongController();


songRouter.get('/', songController.getAllSongs);
songRouter.get('/:id', songController.getSongById);
songRouter.get('/user/:userId', songController.getSongByUserId);
songRouter.post('/', songController.createSong);
songRouter.put('/:id', songController.updateSong);
songRouter.delete('/:id', songController.deleteSong);

export default songRouter;