'use client';

import { useEffect, useState } from 'react';
import { WeatherData, SearchHistory } from '@/types/weather';
import { getCurrentWeather, getWeatherByCity, getClothingRecommendation, getCatImage } from '@/utils/weather';
import Image from 'next/image';

interface ClothingPopupProps {
  temp: number;
  onClose: () => void;
}

function ClothingPopup({ temp, onClose }: ClothingPopupProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div 
        className="bg-white p-6 rounded-3xl max-w-sm w-full mx-4" 
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center space-y-4">
          <h3 className="text-xl mb-2">오늘의 옷차림 추천</h3>
          <p className="text-gray-600">
            {getClothingRecommendation(temp).description}
          </p>
          <button 
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-100 rounded-full text-sm"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showClothingPopup, setShowClothingPopup] = useState(false);

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
          } catch (_err) {
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
    } catch (_err) {
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
    <main className={`min-h-screen p-4 ${isDarkMode ? 'dark' : ''}`}>
      <div className="max-w-md mx-auto text-center">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🐱</span>
            <h1 className="text-2xl">날씨가 기분이다냥</h1>
          </div>
          <button
            onClick={toggleDarkMode}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100"
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
              className="flex-1 p-3 rounded-full bg-gray-100 text-gray-900 placeholder-gray-400 focus:outline-none"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-gray-100 text-gray-900"
            >
              검색
            </button>
          </div>
        </form>

        {error && (
          <div className="p-4 mb-8 text-red-500 text-center">
            {error}
          </div>
        )}

        {weather && (
          <div className="space-y-8">
            <h2 className="text-2xl">
              {weather.location.name}
            </h2>
            <div className="space-y-2">
              <p className="text-6xl font-light">
                {weather.current.temp_c}°C
              </p>
              <p className="text-xl text-gray-600">
                {weather.current.condition.text}
              </p>
              <p className="text-gray-500">
                습도 {weather.current.humidity}% · 풍속 {(weather.current.wind_kph * 1000 / 3600).toFixed(1)}m/s
              </p>
            </div>
            <div className="flex justify-center flex-col items-center">
              <button 
                onClick={() => setShowClothingPopup(true)}
                className="cursor-pointer transition-transform hover:scale-105"
              >
                <Image
                  src={getCatImage(weather.current.temp_c)}
                  alt="날씨에 맞는 고양이 (클릭하여 옷차림 추천 보기)"
                  width={200}
                  height={200}
                />
              </button>
              <p className="mt-2 text-sm text-gray-500 flex items-center gap-1">
                <span>👆</span> 고양이를 클릭하면 오늘의 옷차림을 추천해드려요!
              </p>
            </div>
          </div>
        )}

        {searchHistory.length > 0 && (
          <div className="mt-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {searchHistory.map((item) => (
                <button
                  key={item.timestamp}
                  onClick={() => setSearchQuery(item.city)}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-full"
                >
                  {item.city}
                </button>
              ))}
            </div>
          </div>
        )}

        {showClothingPopup && weather && (
          <ClothingPopup
            temp={weather.current.temp_c}
            onClose={() => setShowClothingPopup(false)}
          />
        )}
      </div>
    </main>
  );
}
