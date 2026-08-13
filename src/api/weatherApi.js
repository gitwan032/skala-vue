// 종합실습4의 Axios API 모듈
// Open-Meteo Geocoding + Forecast API는 비상업적 교육용 사용에 별도 API 키가 필요하지 않습니다.
import axios from 'axios'

const FORECAST_BASE_URL = 'https://api.open-meteo.com/v1/forecast'
const GEOCODE_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search'

export const QUICK_CITIES = [
  { id: 'city_01', name: '서울', latitude: 37.5665, longitude: 126.978 },
  { id: 'city_02', name: '수원', latitude: 37.2636, longitude: 127.0286 },
  { id: 'city_03', name: '부산', latitude: 35.1796, longitude: 129.0756 },
  { id: 'city_04', name: '인천', latitude: 37.4563, longitude: 126.7052 },
]

const weatherFromCode = (code) => {
  if (code === 0) return { main: 'Clear', description: '맑음' }
  if ([1, 2].includes(code)) return { main: 'Clouds', description: '구름 조금' }
  if (code === 3) return { main: 'Clouds', description: '흐림' }
  if ([45, 48].includes(code)) return { main: 'Fog', description: '안개' }
  if ([51, 53, 55, 56, 57].includes(code)) return { main: 'Drizzle', description: '이슬비' }
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return { main: 'Rain', description: '비' }
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { main: 'Snow', description: '눈' }
  if ([95, 96, 99].includes(code)) return { main: 'Thunderstorm', description: '뇌우' }
  return { main: 'Clouds', description: '날씨 변화' }
}

const weatherParams = {
  current: [
    'temperature_2m',
    'relative_humidity_2m',
    'apparent_temperature',
    'weather_code',
    'wind_speed_10m',
  ].join(','),
  hourly: ['temperature_2m', 'weather_code'].join(','),
  forecast_hours: 8,
  timezone: 'auto',
  wind_speed_unit: 'ms',
}

const fallbackSeed = (lat, lon) => Math.abs(Math.round(lat * 10 + lon * 10))

const fallbackCurrent = (lat, lon) => {
  const seed = fallbackSeed(lat, lon)
  const temp = 25 + (seed % 11)
  return {
    main: { temp, feels_like: temp + (seed % 3) - 1, humidity: 55 + (seed % 26) },
    weather: [weatherFromCode(seed % 4)],
    wind: { speed: 1 + (seed % 5) },
  }
}

const fallbackForecast = (lat, lon) => {
  const seed = fallbackSeed(lat, lon)
  const now = Date.now()
  return Array.from({ length: 8 }, (_, index) => ({
    dt: Math.floor((now + index * 60 * 60 * 1000) / 1000),
    main: { temp: 25 + ((seed + index) % 11) },
    weather: [weatherFromCode((seed + index) % 4)],
  }))
}

export const geocodeCity = async (cityName) => {
  const response = await axios.get(GEOCODE_BASE_URL, {
    params: { name: cityName, count: 5, language: 'ko', format: 'json' },
  })
  return response.data.results || []
}

const fetchForecastResponse = async (lat, lon) => {
  const response = await axios.get(FORECAST_BASE_URL, {
    params: { latitude: lat, longitude: lon, ...weatherParams },
  })
  return response.data
}

const toCurrentWeather = (data) => {
  const current = data.current
  const weather = weatherFromCode(current.weather_code)
  return {
    main: {
      temp: current.temperature_2m,
      feels_like: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
    },
    weather: [weather],
    wind: { speed: current.wind_speed_10m },
  }
}

const toForecast = (data) =>
  (data.hourly?.time || []).slice(0, 8).map((time, index) => ({
    dt: Math.floor(new Date(time).getTime() / 1000),
    main: { temp: data.hourly.temperature_2m[index] },
    weather: [weatherFromCode(data.hourly.weather_code[index])],
  }))

export const fetchCurrentWeather = async (lat, lon) => {
  try {
    return toCurrentWeather(await fetchForecastResponse(lat, lon))
  } catch (error) {
    console.warn('실시간 날씨 호출 제한으로 임시 데이터를 표시합니다.', error?.response?.status)
    return fallbackCurrent(lat, lon)
  }
}

export const fetchForecast = async (lat, lon) => {
  try {
    return toForecast(await fetchForecastResponse(lat, lon))
  } catch (error) {
    console.warn('실시간 예보 호출 제한으로 임시 데이터를 표시합니다.', error?.response?.status)
    return fallbackForecast(lat, lon)
  }
}

export const fetchQuickCityWeather = async (city) => {
  const current = await fetchCurrentWeather(city.latitude, city.longitude)
  return {
    id: city.id,
    name: city.name,
    temp: Math.round(current.main.temp),
    status: current.weather[0].description,
  }
}

export const fetchWeatherByCityName = async (cityName) => {
  const candidates = await geocodeCity(cityName)
  if (candidates.length === 0) return { place: null, current: null, forecast: [] }

  const place = candidates[0]
  const data = await fetchForecastResponse(place.latitude, place.longitude)
  return { place, current: toCurrentWeather(data), forecast: toForecast(data) }
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
