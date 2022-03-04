
export interface ISong {
    id: number;
    // 名称
    name: string;
    // 名称后面的字段
    transNames: string;
    // 歌手列表
    artists: string;
    // 歌手后面的字段
    album: string;
    mvid: number;
}

export interface ISongMore {
    // 歌曲名
    name: string;
    id: number;
    // 歌手列表
    ar: any[];
    // 歌曲名说明
    alia: [];
    al: {
        // 歌手后的字段：蓝光 新歌+精选
        name: string;
        picUrl: string;
    };
    originSongSimpleData: { artists: any } | null;
}

// 提取歌曲属性
export function extractSong(song: ISongMore) {
    const _song: ISongMore = {
        name: song.name,
        id: song.id,
        ar: song.ar.map((val: any) => ({ name: val.name })),
        alia: song.alia,
        al: {
            name: song.al.name,
            picUrl: song.al.picUrl,
        },
        originSongSimpleData: null,
    };
    // 原唱歌手
    if (song.originSongSimpleData) {
        song.originSongSimpleData = {
            artists: song.originSongSimpleData.artists,
        };
    }
    return _song
}
