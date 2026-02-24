export type Movie = {
  id: string;
  title: string;
  genre: string;
  releaseDate: string;
  lastUpdated: string;
}

export const mockMovies: Movie[] = [
  { id: '1', title: 'Inception', genre: 'Sci-Fi', releaseDate: '2010-07-16', lastUpdated: '2026-02-20T10:00:00Z' },
  { id: '2', title: 'The Dark Knight', genre: 'Action', releaseDate: '2008-07-18', lastUpdated: '2026-02-21T11:30:00Z' },
  { id: '3', title: 'Interstellar', genre: 'Sci-Fi', releaseDate: '2014-11-07', lastUpdated: '2026-02-22T09:15:00Z' },
  { id: '4', title: 'Parasite', genre: 'Thriller', releaseDate: '2019-05-30', lastUpdated: '2026-02-23T14:20:00Z' },
  { id: '5', title: 'Avengers: Endgame', genre: 'Action', releaseDate: '2019-04-26', lastUpdated: '2026-02-24T08:45:00Z' },
  { id: '6', title: 'The Matrix', genre: 'Sci-Fi', releaseDate: '1999-03-31', lastUpdated: '2026-02-19T16:00:00Z' },
  { id: '7', title: 'Spirited Away', genre: 'Animation', releaseDate: '2001-07-20', lastUpdated: '2026-02-18T12:10:00Z' },
  { id: '8', title: 'Joker', genre: 'Drama', releaseDate: '2019-10-04', lastUpdated: '2026-02-17T15:30:00Z' },
  { id: '9', title: 'Spider-Man: Into the Spider-Verse', genre: 'Animation', releaseDate: '2018-12-14', lastUpdated: '2026-02-16T09:00:00Z' },
  { id: '10', title: 'Mad Max: Fury Road', genre: 'Action', releaseDate: '2015-05-15', lastUpdated: '2026-02-15T10:20:00Z' },
];

export const mockLastSyncTime = '2026-02-24T09:00:00Z';
