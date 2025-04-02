import { WeatherData, ClothingRecommendation } from '@/types/weather';

const API_KEY = process.env.WEATHERAPI_KEY;
const BASE_URL = 'http://api.weatherapi.com/v1';

export async function getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
  const response = await fetch(
    `${BASE_URL}/current.json?key=${API_KEY}&q=${lat},${lon}&aqi=no`
  );
  if (!response.ok) throw new Error('날씨 정보를 가져오는데 실패했습니다.');
  return response.json();
}

export async function getWeatherByCity(city: string): Promise<WeatherData> {
  const response = await fetch(
    `${BASE_URL}/current.json?key=${API_KEY}&q=${city}&aqi=no`
  );
  if (!response.ok) throw new Error('날씨 정보를 가져오는데 실패했습니다.');
  return response.json();
}

export function getClothingRecommendation(temp: number): ClothingRecommendation {
  if (temp >= 30) {
    return { description: '민소매, 반팔, 반바지, 원피스', emoji: '🌞' };
  } else if (temp >= 24) {
    return { description: '반팔, 얇은 셔츠, 반바지, 면바지', emoji: '🌤️' };
  } else if (temp >= 15) {
    return { description: '얇은 니트, 맨투맨, 얇은 가디건, 청바지', emoji: '☀️' };
  } else if (temp >= 9) {
    return { description: '얇은 패딩, 얇은 니트, 맨투맨, 얇은 청바지', emoji: '🌥️' };
  } else {
    return { description: '패딩, 두꺼운 코트, 목도리, 기모제품', emoji: '❄️' };
  }
}

export function getCatImage(temp: number): string {
  if (temp >= 30) return '/assets/illustrations/cat_male_30C.png';
  if (temp >= 24) return '/assets/illustrations/cat_male_24C.png';
  if (temp >= 15) return '/assets/illustrations/cat_male_15C.png';
  if (temp >= 9) return '/assets/illustrations/cat_male_9C.png';
  return '/assets/illustrations/cat_male_0C.png';
} 