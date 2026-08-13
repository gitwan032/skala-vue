// 종합실습4(Router) 블록이 Axios(⑥)로 진화하며 추가된 API 모듈
// - Open-Meteo Geocoding: 도시명(한글 포함) -> 좌표 변환 (API 키 불필요, 기타 외부 API 요구사항)
// - OpenWeatherMap: 좌표 기반 실시간 날씨 + 5일/3시간 예보 (API 키 필요)
import axios from 'axios'

const OWM_BASE_URL = 'https://api.openweathermap.org/data/2.5'
const GEOCODE_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search'

// 가이드 기준 변수명: VITE_WEATHER_API_KEY (.env.local 에 저장, Git 업로드 금지)
const OWM_API_KEY = import.meta.env.VITE_WEATHER_API_KEY

export const isApiKeyConfigured = () =>
  Boolean(OWM_API_KEY) && OWM_API_KEY !== 'your_openweathermap_api_key_here'

// 홈 화면 즐겨찾기 도시(좌표 고정)
export const QUICK_CITIES = [
  { id: 'city_01', name: '서울', latitude: 37.5665, longitude: 126.978 },
  { id: 'city_02', name: '수원', latitude: 37.2636, longitude: 127.0286 },
  { id: 'city_03', name: '부산', latitude: 35.1796, longitude: 129.0756 },
  { id: 'city_04', name: '인천', latitude: 37.4563, longitude: 126.7052 },
]

// 기타 외부 API(Open-Meteo Geocoding): 도시명 -> 좌표
export const geocodeCity = async (cityName) => {
  const response = await axios.get(GEOCODE_BASE_URL, {
    params: { name: cityName, count: 5, language: 'ko', format: 'json' },
  })
  return response.data.results || []
}

// OpenWeatherMap: 실시간 날씨
export const fetchCurrentWeather = async (lat, lon) => {
  const response = await axios.get(`${OWM_BASE_URL}/weather`, {
    params: { lat, lon, appid: OWM_API_KEY, units: 'metric', lang: 'kr' },
  })
  return response.data
}

// OpenWeatherMap: 5일/3시간 예보 (다른 API 추가 요구사항)
export const fetchForecast = async (lat, lon) => {
  const response = await axios.get(`${OWM_BASE_URL}/forecast`, {
    params: { lat, lon, appid: OWM_API_KEY, units: 'metric', lang: 'kr' },
  })
  return (response.data.list || []).slice(0, 8)
}

// 좌표 기준으로 현재 날씨를 WeatherCard가 쓰는 { id, name, temp, status } 형태로 변환
export const fetchQuickCityWeather = async (city) => {
  const current = await fetchCurrentWeather(city.latitude, city.longitude)
  return {
    id: city.id,
    name: city.name,
    temp: Math.round(current.main.temp),
    status: current.weather[0].description,
  }
}

// 도시명 검색 -> 좌표 변환 -> 실시간 날씨 + 예보를 한 번에 조회
export const fetchWeatherByCityName = async (cityName) => {
  const candidates = await geocodeCity(cityName)
  if (candidates.length === 0) {
    return { place: null, current: null, forecast: [] }
  }
  const place = candidates[0]
  const [current, forecast] = await Promise.all([
    fetchCurrentWeather(place.latitude, place.longitude),
    fetchForecast(place.latitude, place.longitude),
  ])
  return { place, current, forecast }
}

export const WEATHER_EMOJI = {
  Clear: '☀️',
  Clouds: '☁️',
  Rain: '🌧️',
  Drizzle: '🌦️',
  Thunderstorm: '⛈️',
  Snow: '❄️',
  Mist: '🌫️',
  Fog: '🌫️',
  Haze: '🌫️',
}
export const getWeatherEmoji = (main) => WEATHER_EMOJI[main] || '🌡️'
