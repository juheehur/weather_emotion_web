'use client';

import { useEffect, useState } from 'react';
import { WeatherData, SearchHistory } from '@/types/weather';
import { getCurrentWeather, getWeatherByCity, getClothingRecommendation, getCatImage } from '@/utils/weather';
import Image from 'next/image';

export default function Home() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // 시스템 다크모드 감지
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeMediaQuery.matches);
    
    // 현재 위치 기반 날씨 정보 가져오기
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const data = await getCurrentWeather(
              position.coords.latitude,
              position.coords.longitude
            );
            setWeather(data);
          } catch (err) {
            setError('날씨 정보를 가져오는데 실패했습니다.');
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          setError('위치 정보를 가져오는데 실패했습니다.');
          setLoading(false);
        }
      );
    } else {
      setError('위치 정보를 지원하지 않는 브라우저입니다.');
      setLoading(false);
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const data = await getWeatherByCity(searchQuery);
      setWeather(data);
      
      // 검색 히스토리 업데이트
      setSearchHistory(prev => {
        const newHistory = [
          { city: searchQuery, timestamp: Date.now() },
          ...prev.filter(h => h.city !== searchQuery)
        ].slice(0, 5);
        return newHistory;
      });
    } catch (err) {
      setError('도시를 찾을 수 없습니다.');
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <main className={`min-h-screen p-4 md:p-8 ${isDarkMode ? 'dark' : ''}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">날씨 앱</h1>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
          >
            {isDarkMode ? '🌞' : '🌙'}
          </button>
        </div>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="도시 이름을 입력하세요"
              className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              검색
            </button>
          </div>
        </form>

        {error && (
          <div className="p-4 mb-8 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {weather && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {weather.location.name}
                </h2>
                <div className="space-y-2">
                  <p className="text-gray-600 dark:text-gray-300">
                    기온: {weather.current.temp_c}°C
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    체감온도: {weather.current.feelslike_c}°C
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    습도: {weather.current.humidity}%
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    풍속: {weather.current.wind_kph} km/h
                  </p>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    추천 옷차림
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {getClothingRecommendation(weather.current.temp_c).description}{' '}
                    {getClothingRecommendation(weather.current.temp_c).emoji}
                  </p>
                </div>
              </div>
              <div className="flex justify-center items-center">
                <Image
                  src={getCatImage(weather.current.temp_c)}
                  alt="날씨에 맞는 고양이"
                  width={200}
                  height={200}
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {searchHistory.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              최근 검색 기록
            </h2>
            <div className="space-y-2">
              {searchHistory.map((item) => (
                <button
                  key={item.timestamp}
                  onClick={() => setSearchQuery(item.city)}
                  className="w-full p-2 text-left rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  {item.city}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
