import {Router} from 'express';
import User from './user/models/User'; 
import Song from './song/models/Song';
import Playlist from './playlist/models/Playlist';
const searchRouter = Router();


searchRouter.get('/', async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).send('Query parameter is required.');
    }

    try {
        const users = await User.find({
            username: { $regex: query, $options: 'i' }
        });

        const songs = await Song.find({
            title: { $regex: query, $options: 'i' }
        }).populate('artistId', 'username');

        const playlists = await Playlist.find({ name: { $regex: query, $options: 'i' } }); 

        res.status(200).json({ users, songs, playlists});
    } catch (error) {
        console.error('Error performing search:', error);
        res.status(500).send('Failed to perform search.');
    }
});

export default searchRouter;
