import { WeatherData, ClothingRecommendation } from '@/types/weather';

const API_KEY = process.env.NEXT_PUBLIC_WEATHERAPI_KEY;
const BASE_URL = 'http://api.weatherapi.com/v1';

const KOREAN_CITIES: { [key: string]: string } = {
  '서울': 'Seoul, South Korea',
  '부산': 'Busan, South Korea',
  '인천': 'Incheon, South Korea',
  '대구': 'Daegu, South Korea',
  '대전': 'Daejeon, South Korea',
  '광주': 'Gwangju, South Korea',
  '수원': 'Suwon, South Korea',
  '울산': 'Ulsan, South Korea',
  '창원': 'Changwon, South Korea',
  '고양': 'Goyang, South Korea',
  '용인': 'Yongin, South Korea',
  '성남': 'Seongnam, South Korea',
  '제주': 'Jeju City, South Korea',
  '청주': 'Cheongju, South Korea',
  '안산': 'Ansan, South Korea',
  '전주': 'Jeonju, South Korea',
  '천안': 'Cheonan, South Korea',
  '안양': 'Anyang, South Korea',
  '남양주': 'Namyangju, South Korea',
  '평택': 'Pyeongtaek, South Korea'
};

export async function getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
  const response = await fetch(
    `${BASE_URL}/current.json?key=${API_KEY}&q=${lat},${lon}&aqi=no&lang=ko`
  );
  if (!response.ok) throw new Error('날씨 정보를 가져오는데 실패했습니다.');
  return response.json();
}

export async function getWeatherByCity(city: string): Promise<WeatherData> {
  // 한글 도시명을 영문으로 변환
  const englishCity = KOREAN_CITIES[city] || city;
  
  const response = await fetch(
    `${BASE_URL}/current.json?key=${API_KEY}&q=${englishCity}&aqi=no&lang=ko`
  );
  if (!response.ok) throw new Error('도시를 찾을 수 없습니다.');
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