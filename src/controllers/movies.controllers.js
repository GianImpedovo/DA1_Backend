import fetch from 'node-fetch';

export const getMovies = async (req, res) => {

    const url = 'https://api.themoviedb.org/3/trending/movie/day?language=en-US';
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyZTUzMTAwNDIxM2MyNGQxZjZlMmE1YjUxNjMwYzg0ZCIsInN1YiI6IjY2MWQ2NjYwZWMwYzU4MDE3Yzc0ZGY5ZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.gtIXH-XpTI3d62vL5GM8Zpbunu8TfVvdK2tU6coNvS0'
      }
    };
    
    try {
        const response = await fetch(url, options);
        const json = await response.json();
        res.json(json);
    } catch (error) {
        console.error('error:' + error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

}