import { CreateSongDto } from "./dtos/CreateSong.dto";
import Song, { ISong } from "./models/Song";
import { createServer } from 'node:http';

class SongService {


    async getAllSongs(): Promise<ISong[] | null> {
        return await Song.find().exec();
    }

    async getSongById(id: string): Promise<ISong | null> {
        return await Song.findById(id).exec();
    }

    async createSong(createSongDto: CreateSongDto, artistId: string): Promise<ISong | null> {
        const { title, songUrl, image } = createSongDto;
        const newSong = new Song({
            title,
            artistId,
            songUrl,
            image,
        });
        
        return await newSong.save();
    }

    async updateSong(id: string, updateSongDto: CreateSongDto): Promise<ISong | null> {
        const { title, songUrl } = updateSongDto;

        return await Song.findByIdAndUpdate(id, {
            title,
            songUrl,
        }, {new: true}).exec();
    }

    async deleteSong(id: string): Promise<ISong | null> {
        return await Song.findByIdAndDelete(id).exec();
    }

    async getSongByUserId(artistId: string): Promise<ISong[] | null> {
        return await Song.find({ artistId }).exec();
    }
}

export default SongService;