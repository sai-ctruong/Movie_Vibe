// OPhim API Types (ophim1.com)

export interface OphimMovie {
  _id: string;
  name: string;
  slug: string;
  origin_name: string;
  type: 'series' | 'single' | 'tvshows' | 'hoathinh';
  thumb_url: string;
  poster_url: string;
  time: string;
  episode_current: string;
  episode_total?: string;
  quality: string;
  lang: string;
  year: number;
  category: {
    id: string;
    name: string;
    slug: string;
  }[];
  country: {
    id: string;
    name: string;
    slug: string;
  }[];
  modified?: {
    time: string;
  };
  tmdb?: {
    type: string;
    id: string;
    vote_average: number;
    vote_count: number;
  };
  imdb?: {
    id: string;
    vote_average: number;
    vote_count: number;
  };
}

export interface OphimEpisodeItem {
  name: string;
  slug: string;
  filename: string;
  link_embed: string;
  link_m3u8: string;
}

export interface OphimEpisodeServer {
  server_name: string;
  server_data: OphimEpisodeItem[];
}

export interface OphimMovieDetail extends OphimMovie {
  content: string;
  status: string;
  actor: string[];
  director: string[];
  notify?: string;
  showtimes?: string;
  trailer_url?: string;
  episodes: OphimEpisodeServer[];
}

export interface OphimApiResponse {
  status: string;
  msg?: string;
  data: {
    titlePage: string;
    items: OphimMovie[];
    params: {
      pagination: {
        totalItems: number;
        totalItemsPerPage: number;
        currentPage: number;
        pageRanges: number;
      };
    };
    APP_DOMAIN_CDN_IMAGE: string;
  };
}

export interface OphimMovieResponse {
  status: string;
  msg?: string;
  data: {
    item: OphimMovieDetail;
    breadCrumb: {
      name: string;
      slug: string;
    }[];
    params: {
      slug: string;
    };
    APP_DOMAIN_CDN_IMAGE: string;
  };
}
