import express from 'express';
import User from './models/User';
import multer from 'multer';
import {s3} from '../../middlewares/s3-middleware';
import  {authMiddleware}  from '../../middlewares/auth-middleware';

const userRouter = express.Router();
const upload = multer();


userRouter.get('/favorites', authMiddleware, async (req, res) => {
    try {
        const userId = (req as any).user.id; 
        const userFavorites = await User.findById(userId)
            .populate('favoriteSongs')
            .populate('favoritePlaylists');

        if (!userFavorites) {
            return res.status(404).send('User not found');
        }

        res.status(200).json({
            songs: userFavorites.favoriteSongs,
            playlists: userFavorites.favoritePlaylists
        });
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).send('Internal server error');
    }
});

userRouter.get('/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).send('Error fetching user data');
    }
});

userRouter.put('/:id', upload.single('avatar'), async (req, res) => {
    const { username, email, description } = req.body;
    const avatarFile = req.file;
    const userId = req.params.id;

    try {
        let avatarUrl;
        if (avatarFile) {
            const avatarParams = {
                Bucket: process.env.AWS_BUCKET_NAME || '',
                Key: `avatars/${Date.now()}_${avatarFile.originalname}`,
                Body: avatarFile.buffer,
                ContentType: avatarFile.mimetype,
            };
            const avatarUpload = await s3.upload(avatarParams).promise();
            avatarUrl = avatarUpload.Location;
        }

        const updatedData = {
            username,
            email,
            description,
            ...(avatarUrl && { avatarUrl })
        };

        const user = await User.findByIdAndUpdate(userId, { $set: updatedData }, { new: true });
        if (!user) {
            return res.status(404).send('User not found.');
        }
        res.status(200).send(user);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('Failed to update the user.');
    }
});

userRouter.get('/search', async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).send('Query parameter is required.');
    }

    try {
        const users = await User.find({
            username: { $regex: query, $options: 'i' } 
        });
        res.status(200).json(users);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).send('Failed to search users.');
    }
});

userRouter.get('/', async (req, res) => {  
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Error fetching users');
    }
});


export default userRouter;

