import { Router } from 'express'
import authRouter from './auth/auth-router'
import s3Router from './s3/s3-routes'
import userRouter from './user/user-router';
import searchRouter from './search-router';
import playlistRouter from './playlist/playlist-router';
import { authMiddleware } from '../middlewares/auth-middleware';


const globalRouter = Router();

globalRouter.use('/auth',authRouter);
globalRouter.use('/songs', s3Router );
globalRouter.use('/users', userRouter );
globalRouter.use('/search', searchRouter);
globalRouter.use('/playlists', playlistRouter);

// other routers can be added here

export default globalRouter
