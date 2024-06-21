import { Request, Response } from 'express';
import SongService from './song-service';
import { CreateSongDto } from './dtos/CreateSong.dto';

export class SongController {
    private songService: SongService;

    constructor() {
        this.songService = new SongService();
    }

    getAllSongs = async(req: Request, res: Response): Promise<void> =>{
        try {
            const songs = this.songService.getAllSongs();
            res.json(songs);
        } catch (error:any) {
            res.status(500).send({error: error.message});
        }
    }

    getSongById = async(req: Request, res: Response): Promise<void> =>{
        try {
            const songId = req.params.id;
            const song = this.songService.getSongById(songId);

            if (song) {
                res.json(song);
            } else {
                res.status(404).json({ error: 'Song not found' });
            }
        } catch (error:any) {
            res.status(500).send({error: error.message});
        }
    }

    createSong = async(req: Request, res: Response): Promise<void> =>{
        try {
            const artistId = (req as any).user.id;
            const createSongDto: CreateSongDto = req.body;

            const newSong = await this.songService.createSong(createSongDto, artistId);

        res.status(201).json(newSong);
        } catch (error:any) {
            res.status(500).send({error: error.message});
        }
    }

    updateSong = async(req: Request, res: Response): Promise<void> =>{
        try {
            const songId = req.params.id;
            const updateSong: CreateSongDto= req.body;

            const updatedSong = this.songService.updateSong(songId, updateSong);

            if (updatedSong) {
                res.json(updatedSong);
            } else {
                res.status(404).json({ error: 'Song not found' });
            }
        } catch (error:any) {
                res.status(500).send({error: error.message});
            }
    }

    deleteSong = async(req: Request, res: Response): Promise<void> =>{
        try {
            const songId = req.params.id;

        const deletedSong = this.songService.deleteSong(songId);

        if (await deletedSong) {
            res.json({ message: 'Song deleted successfully' });
        } else {
            res.status(404).json({ error: 'Song not found' });
        }
        } catch (error:any) {
            res.status(500).send({error: error.message});
        }
    }

    getSongByUserId = async(req: Request, res: Response): Promise<void> =>{
        try {
            const artistId = req.params.userId;
            console.log(artistId);
            
            const songs = await this.songService.getSongByUserId(artistId);
            if (!songs?.length) {
                res.status(404).send('No songs found for this user');
            }
            res.status(200).json(songs);
        } catch (error) {
            console.error('Error fetching songs:', error);
            res.status(500).send('Error fetching songs');
        }
    }
}

export default SongController;