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
          let errorMessage = '위치 정보를 가져오는데 실패했습니다.';
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = '위치 정보 접근이 거부되었습니다. 브라우저 설정에서 위치 정보 접근을 허용해주세요.';
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage = '위치 정보를 사용할 수 없습니다. 위치 서비스가 활성화되어 있는지 확인해주세요.';
              break;
            case err.TIMEOUT:
              errorMessage = '위치 정보 요청 시간이 초과되었습니다. 다시 시도해주세요.';
              break;
            default:
              errorMessage = '알 수 없는 오류가 발생했습니다.';
              break;
          }
          setError(errorMessage);
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      setError('이 브라우저는 위치 정보를 지원하지 않습니다.');
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
        <div className="flex justify-between items-center mb-8 bg-white/80 dark:bg-gray-800/80 p-4 rounded-2xl backdrop-blur-sm shadow-lg">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-5xl">🐱</span>
            날씨가 기분이다냥
          </h1>
          <button
            onClick={toggleDarkMode}
            className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 shadow-md"
          >
            {isDarkMode ? '🌞' : '🌙'}
          </button>
        </div>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="도시 이름을 입력하세요 (예: 서울, 부산, 제주)"
              className="flex-1 p-4 rounded-2xl border-2 border-gray-200 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 backdrop-blur-sm focus:outline-none focus:border-blue-400 dark:focus:border-blue-500 transition-all duration-300"
            />
            <button
              type="submit"
              className="px-6 py-4 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
            >
              찾기 🔍
            </button>
          </div>
        </form>

        {error && (
          <div className="p-4 mb-8 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 rounded-2xl border-2 border-red-100 dark:border-red-800 backdrop-blur-sm">
            <p className="flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              {error}
            </p>
          </div>
        )}

        {weather && (
          <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-lg p-8 backdrop-blur-sm border-2 border-gray-100 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>{weather.current.condition.text === 'Sunny' ? '☀️' : 
                         weather.current.condition.text === 'Cloudy' ? '☁️' : 
                         weather.current.condition.text.includes('rain') ? '🌧️' : 
                         weather.current.condition.text.includes('snow') ? '❄️' : '🌤️'}</span>
                  {weather.location.name}
                </h2>
                <div className="space-y-4 bg-gray-50/50 dark:bg-gray-700/50 p-6 rounded-xl">
                  <p className="text-2xl text-gray-900 dark:text-white">
                    {weather.current.temp_c}°C
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">체감온도</p>
                      <p className="text-lg text-gray-700 dark:text-gray-200">{weather.current.feelslike_c}°C</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">습도</p>
                      <p className="text-lg text-gray-700 dark:text-gray-200">{weather.current.humidity}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">풍속</p>
                      <p className="text-lg text-gray-700 dark:text-gray-200">{weather.current.wind_kph} km/h</p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50/50 dark:bg-blue-900/30 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    오늘의 옷차림 추천 💁‍♀️
                  </h3>
                  <p className="text-gray-700 dark:text-gray-200 text-lg">
                    {getClothingRecommendation(weather.current.temp_c).description}{' '}
                    {getClothingRecommendation(weather.current.temp_c).emoji}
                  </p>
                </div>
              </div>
              <div className="flex justify-center items-center bg-gray-50/50 dark:bg-gray-700/50 rounded-xl p-6">
                <div className="relative group">
                  <Image
                    src={getCatImage(weather.current.temp_c)}
                    alt="날씨에 맞는 고양이"
                    width={250}
                    height={250}
                    className="rounded-xl transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            </div>
          </div>
        )}

        {searchHistory.length > 0 && (
          <div className="mt-8 bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 backdrop-blur-sm border-2 border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>📝</span> 최근 검색 기록
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {searchHistory.map((item) => (
                <button
                  key={item.timestamp}
                  onClick={() => setSearchQuery(item.city)}
                  className="p-3 text-center rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300 text-gray-700 dark:text-gray-200"
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
