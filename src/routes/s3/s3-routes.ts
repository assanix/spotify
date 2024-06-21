    import express, { Request, Response } from 'express';
    import multer from 'multer';
    import AWS from 'aws-sdk';
    import { s3 } from '../../middlewares/s3-middleware';
    import Song from '../song/models/Song';
    import { authMiddleware } from '../../middlewares/auth-middleware';
import mongoose, { Schema } from 'mongoose';
import User from '../user/models/User';

    const s3Router = express.Router();
    const storage = multer.memoryStorage();
    const upload = multer({ storage: storage });

    AWS.config.update({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION
    });

    s3Router.post('/upload', authMiddleware, upload.fields([{ name: 'song', maxCount: 1 }, { name: 'image', maxCount: 1 }]), async (req: Request, res: Response) => {
        
        
        const { title } = req.body;
        const artistId = (req as any).user.id;
        console.log(artistId);
         
        
        const files: any = req.files;
        const songFile = files.song ? files.song[0] : null;
        const imageFile = files.image ? files.image[0] : null;

        if (!songFile) {
            return res.status(400).send('Song file is required.');
        }

        try {
            const songParams: AWS.S3.PutObjectRequest = {
                Bucket: process.env.AWS_BUCKET_NAME || '',
                Key: `songs/${Date.now()}_${songFile.originalname}`,
                Body: songFile.buffer,
                ContentType: songFile.mimetype,
            };
            
            const imageParams: AWS.S3.PutObjectRequest | undefined = imageFile ? {
                Bucket: process.env.AWS_BUCKET_NAME || '',
                Key: `images/${Date.now()}_${imageFile.originalname}`,
                Body: imageFile.buffer,
                ContentType: imageFile.mimetype,
            } : undefined;

            const songUpload = songParams ? await s3.upload(songParams).promise() : undefined;
            const imageUpload = imageParams ? await s3.upload(imageParams).promise() : undefined;

            const newSong = new Song({
                title,
                artistId,
                songUrl: songUpload ? songUpload.Location : '',
                image: imageUpload ? imageUpload.Location : ''
            });

        
            await newSong.save();

            res.status(201).send(newSong);
        } catch (error: any) {
            console.error('AWS S3 Error:', error);
            res.status(500).send('Failed to upload song and image.');
        }
    });


    s3Router.get('/', async (req: Request, res: Response) => {
        try {
            const songs = await Song.find().populate('artistId', 'username');
            res.json(songs);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching songs', error });
        }
    });

    s3Router.get('/:id', async (req: Request, res: Response) => {
        try {
            const song = await Song.findById(req.params.id);
            if (!song) {
                return res.status(404).send('Song not found.');
            }
            res.status(200).send(song);
        } catch (error) {
            console.error('Error finding song:', error);
            res.status(500).send('Failed to find the song.');
        }
    });

    s3Router.put('/:id', upload.fields([{ name: 'song', maxCount: 1 }, { name: 'image', maxCount: 1 }]), async (req: Request, res: Response) => {
        const { title } = req.body;
        const files: any = req.files;
        const songFile = files.song ? files.song[0] : null;
        const imageFile = files.image ? files.image[0] : null;
    
        try {
            const songParams: AWS.S3.PutObjectRequest = {
                Bucket: process.env.AWS_BUCKET_NAME || '',
                Key: `songs/${Date.now()}_${songFile.originalname}`,
                Body: songFile.buffer,
                ContentType: songFile.mimetype,
            };
            
            const imageParams: AWS.S3.PutObjectRequest | undefined = imageFile ? {
                Bucket: process.env.AWS_BUCKET_NAME || '',
                Key: `images/${Date.now()}_${imageFile.originalname}`,
                Body: imageFile.buffer,
                ContentType: imageFile.mimetype,
            } : undefined;
    
            const songUpload = songParams ? await s3.upload(songParams).promise() : undefined;
            const imageUpload = imageParams ? await s3.upload(imageParams).promise() : undefined;
    
            const updatedData = {
                title,
                songUrl: songUpload ? songUpload.Location : undefined,
                image: imageUpload ? imageUpload.Location : undefined
            };
    
            const song = await Song.findByIdAndUpdate(req.params.id, { $set: updatedData }, { new: true });
            if (!song) {
                return res.status(404).send('Song not found.');
            }
            res.status(200).send(song);
        } catch (error) {
            console.error('Error updating song:', error);
            res.status(500).send('Failed to update the song.');
        }
    });


    s3Router.delete('/:id', async (req: Request, res: Response) => {
        try {
            const result = await Song.findByIdAndDelete(req.params.id);
            if (!result) {
                return res.status(404).send('Song not found.');
            }
            res.status(200).send('Song deleted successfully.');
        } catch (error) {
            console.error('Error deleting song:', error);
            res.status(500).send('Failed to delete the song.');
        }
    });
    
    s3Router.get('/user/:userId', async (req, res) => {
        try {
            const songs = await Song.find({ artistId: req.params.userId });
            console.log(songs);
            
            res.status(200).json(songs);
        } catch (error) {
            console.error('Error fetching songs:', error);
            res.status(500).send('Error fetching songs');
        }
    });

    s3Router.post('/:songId/like', authMiddleware, async (req: Request, res: Response) => {
        try {
            const { songId } = req.params;
            const userId = (req as any).user.id;
    
            const songObjectId = new mongoose.Types.ObjectId(songId); 
            const userObjectId = new mongoose.Types.ObjectId(userId);
    
            const song = await Song.findById(songObjectId);
            const user = await User.findById(userObjectId);
    
            if (!song || !user) {
                return res.status(404).send('Song or User not found.');
            }
    
            const isAlreadyLiked = song.likes.some(id => id.toString() === userObjectId.toString());
            if (isAlreadyLiked) {
                await Song.findByIdAndUpdate(songObjectId, { $pull: { likes: userObjectId } });
                await User.findByIdAndUpdate(userObjectId, { $pull: { favoriteSongs: songObjectId } });
            } else {

                await Song.findByIdAndUpdate(songObjectId, { $addToSet: { likes: userObjectId } });
                await User.findByIdAndUpdate(userObjectId, { $addToSet: { favoriteSongs: songObjectId } });
            }
    
            res.status(200).json({ liked: !isAlreadyLiked });
        } catch (error) {
            console.error('Error liking song:', error);
            res.status(500).send('Internal server error');
        }
    });

    s3Router.get('/:songId/like-status', authMiddleware, async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const { songId } = req.params;
            const song = await Song.findById(songId);
            if (!song) {
                return res.status(404).send('Song not found');
            }
  
            const liked = song.likes.some(likeId => likeId.toString() === userId.toString());
            
            res.status(200).json({ liked });
        } catch (error) {
            console.error('Error fetching song like status:', error);
            res.status(500).send('Internal server error');
        }
    });

    s3Router.post('/:songId/unlike', authMiddleware, async (req, res) => {
        const userId = (req as any).user.id;
        const { songId } = req.params;
        const songObjectId = new mongoose.Types.ObjectId(songId);
        const userObjectId = new mongoose.Types.ObjectId(userId);
    
        try {
            const song = await Song.findById(songObjectId);
            const user = await User.findById(userObjectId);
    
            if (!song || !user) {
                return res.status(404).send('Song or User not found.');
            }
    
            const isAlreadyLiked = song.likes.some(id => id.toString() === userObjectId.toString());
            if (isAlreadyLiked) {

                await Song.findByIdAndUpdate(songObjectId, { $pull: { likes: userObjectId } });
                await User.findByIdAndUpdate(userObjectId, { $pull: { favoriteSongs: songObjectId } });
                res.status(200).send('Song unliked and removed from favorites');
            } else {
                res.status(400).send('Song not liked by this user');
            }
        } catch (error) {
            console.error('Error unliking song:', error);
            res.status(500).send('Internal server error');
        }
    });



    


    

    



    export default s3Router;
