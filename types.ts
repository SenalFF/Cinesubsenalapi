
export interface MovieResult {
  title: string;
  type: 'movie' | 'tvshow' | 'unknown';
  quality: string;
  rating: string;
  poster_url: string | null;
  movie_url: string;
}

export interface DownloadLink {
  quality: string;
  size: string;
  countdown_url: string;
}

export interface MovieDetails {
  movie_info: {
    title: string;
    type: string;
    year: string;
    rating: string;
    genres: string[];
    description: string;
  };
  poster_url: string | null;
  movie_url: string;
  download_links: DownloadLink[];
}

export interface ResolvedDownload {
  type: 'direct' | 'google' | 'telegram' | 'mega';
  label: string;
  raw_url: string;
  download_url: string;
}
