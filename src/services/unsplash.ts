import axios from 'axios';

const unsplashApi = axios.create({
  baseURL: 'https://api.unsplash.com',
  headers: {
    Authorization: `Client-ID ${import.meta.env.VITE_UNSPLASH_ACCESS_KEY}`
  }
});

export interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  user: {
    name: string;
    username: string;
    location: string | null;
    profile_image: {
      small: string;
    };
  };
  description: string | null;
  alt_description: string | null;
  likes: number;
  created_at: string;
}

export const getPhotos = async (page: number = 1, perPage: number = 10) => {
  try {
    const response = await unsplashApi.get<UnsplashPhoto[]>('/photos', {
      params: {
        page,
        per_page: perPage,
        order_by: 'latest'
      }
    });
    console.log('Get Photos Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const searchPhotos = async (query: string, page: number = 1, perPage: number = 10) => {
  try {
    const response = await unsplashApi.get('/search/photos', {
      params: {
        query,
        page,
        per_page: perPage
      }
    });
    console.log('Search Photos Response:', JSON.stringify(response.data.results, null, 2));
    return response.data.results;
  } catch (error) {
    throw error;
  }
}; 