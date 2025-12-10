import { useMemo } from 'react';

// Sample movie posters - these can be replaced with actual API data
const moviePosters = [
  'https://image.tmdb.org/t/p/w300/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg', // The Shawshank Redemption
  'https://image.tmdb.org/t/p/w300/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', // The Godfather
  'https://image.tmdb.org/t/p/w300/rSPw7tgCH9c6NqICZef4kZjFOQ5.jpg', // The Dark Knight
  'https://image.tmdb.org/t/p/w300/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', // The Godfather Part II
  'https://image.tmdb.org/t/p/w300/9gk7adHYeDvHkCSEqAvQNLV5Ber.jpg', // Pulp Fiction
  'https://image.tmdb.org/t/p/w300/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', // Schindler's List
  'https://image.tmdb.org/t/p/w300/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg', // The Lord of the Rings
  'https://image.tmdb.org/t/p/w300/velWPhVMQeQKcxggNEU8YmIo52R.jpg', // Fight Club
  'https://image.tmdb.org/t/p/w300/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', // Forrest Gump
  'https://image.tmdb.org/t/p/w300/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', // The Matrix
  'https://image.tmdb.org/t/p/w300/8kSerJrhrJWKLk1LViesGcnrUPE.jpg', // Inception
  'https://image.tmdb.org/t/p/w300/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg', // Interstellar
  'https://image.tmdb.org/t/p/w300/Ab8mkHmkYADjU7wQiOkia9BzGvS.jpg', // Avatar
  'https://image.tmdb.org/t/p/w300/6DrHO1jr3qVrViUO6s6kFiAGM7.jpg', // Titanic
  'https://image.tmdb.org/t/p/w300/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg', // The Avengers
  'https://image.tmdb.org/t/p/w300/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', // Parasite
  'https://image.tmdb.org/t/p/w300/or06FN3Dka5tukK1e9sl16pB3iy.jpg', // Joker
  'https://image.tmdb.org/t/p/w300/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg', // The Shining
  'https://image.tmdb.org/t/p/w300/wuMc08IPKEatf9rnMNXvIDxqP4W.jpg', // Alien
  'https://image.tmdb.org/t/p/w300/rzRwTcFvttcN1ZpX2xv4j3tSdJu.jpg', // Blade Runner
  'https://image.tmdb.org/t/p/w300/qJ2tW6WMUDux911r6m7haRef0WH.jpg', // The Hunger Games
  'https://image.tmdb.org/t/p/w300/pIkRyD18kl4FhoCNQuWxWu5cBLM.jpg', // Spider-Man
  'https://image.tmdb.org/t/p/w300/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg', // Deadpool
  'https://image.tmdb.org/t/p/w300/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg', // Black Panther
];

interface PosterColumnProps {
  posters: string[];
  direction: 'up' | 'down';
  duration: number;
  delay?: number;
}

function PosterColumn({ posters, direction, duration, delay = 0 }: PosterColumnProps) {
  // Double the posters for seamless loop
  const doubledPosters = [...posters, ...posters];
  
  const animationStyle = {
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
  };

  return (
    <div className="poster-column">
      <div 
        className={`poster-scroll ${direction === 'up' ? 'scroll-up' : 'scroll-down'}`}
        style={animationStyle}
      >
        {doubledPosters.map((poster, index) => (
          <div key={index} className="poster-item">
            <img 
              src={poster} 
              alt={`Movie poster ${index + 1}`}
              className="w-full h-full object-cover rounded-md"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MoviePosterBackground() {
  // Distribute posters into columns with different arrangements
  const columns = useMemo(() => {
    const cols: string[][] = [[], [], [], [], [], []];
    moviePosters.forEach((poster, index) => {
      cols[index % 6].push(poster);
    });
    // Shuffle each column slightly differently for variety
    return cols.map((col, i) => [...col.slice(i % col.length), ...col.slice(0, i % col.length)]);
  }, []);

  return (
    <div className="movie-poster-background">
      <div className="poster-grid">
        {columns.map((columnPosters, index) => (
          <PosterColumn
            key={index}
            posters={columnPosters}
            direction={index % 2 === 0 ? 'up' : 'down'}
            duration={30 + (index * 5)} // Slightly different speeds for each column
            delay={index * 0.5}
          />
        ))}
      </div>
      {/* Dark overlay for readability */}
      <div className="poster-overlay" />
    </div>
  );
}
