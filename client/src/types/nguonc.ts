// NguonC API Types

export interface NguoncMovie {
  name: string;
  slug: string;
  original_name: string;
  thumb_url: string;
  poster_url: string;
  created: string;
  modified: string;
  description: string;
  total_episodes: number;
  current_episode: string;
  time: string;
  quality: string;
  language: string;
  director: string | null;
  casts: string | null;
}

export interface NguoncEpisodeItem {
  name: string;
  slug: string;
  embed: string;
  m3u8: string;
}

export interface NguoncEpisodeServer {
  server_name: string;
  items: NguoncEpisodeItem[];
}

export interface NguoncCategory {
  group: {
    id: string;
    name: string;
  };
  list: {
    id: string;
    name: string;
  }[];
}

export interface NguoncMovieDetail extends NguoncMovie {
  id: string;
  category: {
    [key: string]: NguoncCategory;
  };
  episodes: NguoncEpisodeServer[];
}

export interface NguoncPaginate {
  current_page: number;
  total_page: number;
  total_items: number;
  items_per_page: number;
}

export interface NguoncApiResponse {
  status: string;
  paginate: NguoncPaginate;
  items: NguoncMovie[];
}

export interface NguoncMovieResponse {
  status: string;
  movie: NguoncMovieDetail;
}
