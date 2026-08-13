// 날씨 데이터 API 모듈
// - Open-Meteo Geocoding: 도시명(한글 포함) -> 좌표 변환 (API 키 불필요)
// - OpenWeatherMap: 좌표 기반 실시간 날씨 + 5일/3시간 예보 (API 키 필요)
import axios from 'axios'

const OWM_BASE_URL = 'https://api.openweathermap.org/data/2.5'
const GEOCODE_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast'
const OPEN_METEO_AIR_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality'
const DETAIL_CACHE_PREFIX = 'weather-detail-v1:'

// 실시간 제공 서버가 안정화될 때까지 사용하는 임시 예보 모드입니다.
// 도시/날짜/시간을 씨앗으로 사용해 새로고침해도 같은 범위(25~35°C)의 값이 유지됩니다.
export const TEMPORARY_WEATHER_MODE = true

const seededNumber = (seed, min, max) => {
  const value = Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1
  return Math.round(min + value * (max - min))
}

const localIso = (date) => {
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const temporaryWeatherCode = (seed) => [0, 1, 2, 3, 61][Math.abs(seed) % 5]

export const createTemporaryDetailedWeather = (lat = 37.5665, lon = 126.978) => {
  const now = new Date()
  now.setMinutes(0, 0, 0)
  const seed = Math.round((Number(lat) * 1000) + (Number(lon) * 1000))
  const hourTimes = []
  const hourTemps = []
  const hourCodes = []
  const hourRain = []
  const hourVisibility = []
  const hourUv = []
  const hourHumidity = []
  const hourPressure = []
  const hourWind = []
  const hourDirection = []
  const hourGusts = []
  for (let index = 0; index < 48; index += 1) {
    const time = new Date(now.getTime() + index * 60 * 60 * 1000)
    const daylightCurve = Math.max(0, Math.sin(((time.getHours() - 6) / 12) * Math.PI))
    const temp = Math.max(25, Math.min(35, 26 + Math.round(daylightCurve * 7) + seededNumber(seed + index, -1, 2)))
    const code = temporaryWeatherCode(seed + time.getDate() + Math.floor(index / 4))
    hourTimes.push(localIso(time)); hourTemps.push(temp); hourCodes.push(code)
    hourRain.push(code >= 51 ? seededNumber(seed + index, 35, 70) : seededNumber(seed + index, 0, 15))
    hourVisibility.push(seededNumber(seed + index, 12000, 24000)); hourUv.push(time.getHours() >= 7 && time.getHours() <= 18 ? seededNumber(seed + index, 2, 8) : 0)
    hourHumidity.push(seededNumber(seed + index, 52, 76)); hourPressure.push(seededNumber(seed + index, 1004, 1018))
    hourWind.push(seededNumber(seed + index, 1, 5)); hourDirection.push(seededNumber(seed + index, 0, 359)); hourGusts.push(seededNumber(seed + index, 3, 8))
  }

  const daily = { time: [], weather_code: [], temperature_2m_max: [], temperature_2m_min: [], apparent_temperature_max: [], apparent_temperature_min: [], sunrise: [], sunset: [], uv_index_max: [], precipitation_sum: [], precipitation_probability_max: [], wind_speed_10m_max: [], wind_gusts_10m_max: [] }
  for (let index = 0; index < 8; index += 1) {
    const date = new Date(now); date.setDate(date.getDate() + index)
    const min = seededNumber(seed + index * 3, 25, 28)
    const max = seededNumber(seed + index * 7, 31, 35)
    const code = temporaryWeatherCode(seed + date.getDate())
    const sunrise = new Date(date); sunrise.setHours(5, seededNumber(seed + index, 25, 55), 0, 0)
    const sunset = new Date(date); sunset.setHours(19, seededNumber(seed + index, 10, 40), 0, 0)
    daily.time.push(localIso(date).slice(0, 10)); daily.weather_code.push(code)
    daily.temperature_2m_min.push(min); daily.temperature_2m_max.push(Math.max(min + 3, max))
    daily.apparent_temperature_min.push(min + 1); daily.apparent_temperature_max.push(Math.max(min + 4, max + 1))
    daily.sunrise.push(localIso(sunrise)); daily.sunset.push(localIso(sunset)); daily.uv_index_max.push(seededNumber(seed + index, 4, 9))
    daily.precipitation_sum.push(code >= 51 ? seededNumber(seed + index, 1, 8) : 0)
    daily.precipitation_probability_max.push(code >= 51 ? seededNumber(seed + index, 40, 75) : seededNumber(seed + index, 0, 20))
    daily.wind_speed_10m_max.push(seededNumber(seed + index, 3, 7)); daily.wind_gusts_10m_max.push(seededNumber(seed + index, 5, 10))
  }

  const currentHour = now.getHours()
  const isDay = currentHour >= 6 && currentHour < 19 ? 1 : 0
  return {
    temporary: true,
    current: {
      time: hourTimes[0], temperature_2m: hourTemps[0], apparent_temperature: Math.min(35, hourTemps[0] + 1),
      relative_humidity_2m: hourHumidity[0], is_day: isDay, precipitation: daily.precipitation_sum[0] ? 0.5 : 0,
      weather_code: hourCodes[0], cloud_cover: hourCodes[0] ? 55 : 12, surface_pressure: hourPressure[0],
      wind_speed_10m: hourWind[0], wind_direction_10m: hourDirection[0], wind_gusts_10m: hourGusts[0]
    },
    hourly: {
      time: hourTimes, temperature_2m: hourTemps, apparent_temperature: hourTemps.map((value) => Math.min(35, value + 1)),
      precipitation_probability: hourRain, precipitation: hourRain.map((value) => value >= 35 ? 0.5 : 0),
      weather_code: hourCodes, visibility: hourVisibility, uv_index: hourUv, relative_humidity_2m: hourHumidity,
      surface_pressure: hourPressure, wind_speed_10m: hourWind, wind_direction_10m: hourDirection, wind_gusts_10m: hourGusts
    },
    daily,
    air: { us_aqi: seededNumber(seed, 25, 65), pm10: seededNumber(seed, 16, 38), pm2_5: seededNumber(seed, 8, 24), carbon_monoxide: 210, nitrogen_dioxide: 18, ozone: 62 }
  }
}

const temporaryQuickWeather = (city, index) => {
  const detail = createTemporaryDetailedWeather(city.latitude, city.longitude)
  return {
    temporary: true,
    main: { temp: detail.current.temperature_2m, temp_max: detail.daily.temperature_2m_max[0], temp_min: detail.daily.temperature_2m_min[0] },
    weather: [{ main: weatherCodeLabel(detail.current.weather_code), description: `${weatherCodeLabel(detail.current.weather_code)} · 임시 예보` }],
    index
  }
}

const OWM_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

export const isApiKeyConfigured = () =>
  Boolean(OWM_API_KEY) && OWM_API_KEY !== 'your_openweathermap_api_key_here'

// 홈 화면 지역별 날씨 현황에 기본으로 보여줄 국내 주요 도시 목록
// (좌표 고정 - 검색 없이 바로 조회 가능, region은 카드에 표시할 행정구역명)
export const QUICK_CITIES = [
  { id: 'seoul', name: '서울', region: '서울특별시', country: 'KR', latitude: 37.5665, longitude: 126.978 },
  { id: 'busan', name: '부산', region: '부산광역시', country: 'KR', latitude: 35.1796, longitude: 129.0756 },
  { id: 'daegu', name: '대구', region: '대구광역시', country: 'KR', latitude: 35.8714, longitude: 128.6014 },
  { id: 'incheon', name: '인천', region: '인천광역시', country: 'KR', latitude: 37.4563, longitude: 126.7052 },
  { id: 'gwangju', name: '광주', region: '광주광역시', country: 'KR', latitude: 35.1595, longitude: 126.8526 },
  { id: 'daejeon', name: '대전', region: '대전광역시', country: 'KR', latitude: 36.3504, longitude: 127.3845 },
  { id: 'ulsan', name: '울산', region: '울산광역시', country: 'KR', latitude: 35.5384, longitude: 129.3114 },
  { id: 'sejong', name: '세종', region: '세종특별자치시', country: 'KR', latitude: 36.4801, longitude: 127.2891 },
  { id: 'suwon', name: '수원', region: '경기도 수원시', country: 'KR', latitude: 37.2636, longitude: 127.0286 },
  { id: 'ansan', name: '안산', region: '경기도 안산시', country: 'KR', latitude: 37.3219, longitude: 126.8309 },
  { id: 'chuncheon', name: '춘천', region: '강원특별자치도 춘천시', country: 'KR', latitude: 37.8813, longitude: 127.7298 },
  { id: 'gangneung', name: '강릉', region: '강원특별자치도 강릉시', country: 'KR', latitude: 37.7519, longitude: 128.8761 },
  { id: 'jeonju', name: '전주', region: '전북특별자치도 전주시', country: 'KR', latitude: 35.8242, longitude: 127.148 },
  { id: 'yeosu', name: '여수', region: '전라남도 여수시', country: 'KR', latitude: 34.7604, longitude: 127.6622 },
  { id: 'pohang', name: '포항', region: '경상북도 포항시', country: 'KR', latitude: 36.019, longitude: 129.3435 },
  { id: 'gyeongju', name: '경주', region: '경상북도 경주시', country: 'KR', latitude: 35.8562, longitude: 129.2247 },
  { id: 'andong', name: '안동', region: '경상북도 안동시', country: 'KR', latitude: 36.5684, longitude: 128.7294 },
  { id: 'jinju', name: '진주', region: '경상남도 진주시', country: 'KR', latitude: 35.18, longitude: 128.1076 },
  { id: 'cheonan', name: '천안', region: '충청남도 천안시', country: 'KR', latitude: 36.8151, longitude: 127.1139 },
  { id: 'jeju', name: '제주', region: '제주특별자치도 제주시', country: 'KR', latitude: 33.4996, longitude: 126.5312 },
  { id: 'seogwipo', name: '서귀포', region: '제주특별자치도 서귀포시', country: 'KR', latitude: 33.2541, longitude: 126.5601 },
]

export const geocodeCity = async (cityName) => {
  const response = await axios.get(GEOCODE_BASE_URL, {
    params: { name: cityName, count: 5, language: 'ko', format: 'json' }
  })
  return response.data.results || []
}

export const fetchCurrentWeather = async (lat, lon) => {
  if (TEMPORARY_WEATHER_MODE) {
    const detail = createTemporaryDetailedWeather(lat, lon)
    return { main: { temp: detail.current.temperature_2m }, weather: [{ main: weatherCodeLabel(detail.current.weather_code), description: '임시 예보' }] }
  }
  const response = await axios.get(`${OWM_BASE_URL}/weather`, {
    params: { lat, lon, appid: OWM_API_KEY, units: 'metric', lang: 'kr' }
  })
  return response.data
}

export const fetchForecast = async (lat, lon) => {
  if (TEMPORARY_WEATHER_MODE) return createTemporaryDetailedWeather(lat, lon).hourly.time.slice(0, 8).map((time, index) => ({ dt_txt: time, main: { temp: createTemporaryDetailedWeather(lat, lon).hourly.temperature_2m[index] } }))
  const response = await axios.get(`${OWM_BASE_URL}/forecast`, {
    params: { lat, lon, appid: OWM_API_KEY, units: 'metric', lang: 'kr' }
  })
  return (response.data.list || []).slice(0, 8)
}

// Apple Weather 스타일 상세 화면에 필요한 시간별·일별·대기질 데이터를 한 번에 조회한다.
// Open-Meteo는 UV·가시거리·돌풍·일출/일몰을 별도 API 키 없이 제공한다.
export const fetchDetailedWeather = async (lat, lon) => {
  if (TEMPORARY_WEATHER_MODE) return createTemporaryDetailedWeather(lat, lon)
  const cacheKey = `${DETAIL_CACHE_PREFIX}${Number(lat).toFixed(3)},${Number(lon).toFixed(3)}`
  try {
    const stored = JSON.parse(localStorage.getItem(cacheKey) || 'null')
    if (stored?.at && Date.now() - stored.at < 10 * 60 * 1000) return stored.data
  } catch { /* 캐시를 읽을 수 없으면 실시간 조회 */ }

  const weatherRequest = axios.get(OPEN_METEO_BASE_URL, {
      params: {
        latitude: lat,
        longitude: lon,
        timezone: 'auto',
        forecast_days: 8,
        current: [
          'temperature_2m', 'relative_humidity_2m', 'apparent_temperature',
          'is_day', 'precipitation', 'weather_code', 'cloud_cover',
          'surface_pressure', 'wind_speed_10m', 'wind_direction_10m', 'wind_gusts_10m'
        ].join(','),
        hourly: [
          'temperature_2m', 'apparent_temperature', 'precipitation_probability',
          'precipitation', 'weather_code', 'visibility', 'uv_index',
          'relative_humidity_2m', 'surface_pressure', 'wind_speed_10m',
          'wind_direction_10m', 'wind_gusts_10m'
        ].join(','),
        daily: [
          'weather_code', 'temperature_2m_max', 'temperature_2m_min',
          'apparent_temperature_max', 'apparent_temperature_min',
          'sunrise', 'sunset', 'uv_index_max', 'precipitation_sum',
          'precipitation_probability_max', 'wind_speed_10m_max', 'wind_gusts_10m_max'
        ].join(','),
        wind_speed_unit: 'ms'
      }
    })
  const airRequest = axios.get(OPEN_METEO_AIR_URL, {
      params: {
        latitude: lat,
        longitude: lon,
        timezone: 'auto',
        forecast_days: 3,
        current: 'us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone'
      }
    }).catch(() => ({ data: { current: null } }))
  try {
    const [weatherResponse, airResponse] = await Promise.all([weatherRequest, airRequest])
    const result = { ...weatherResponse.data, air: airResponse.data.current || null }
    try { localStorage.setItem(cacheKey, JSON.stringify({ at: Date.now(), data: result })) } catch { /* 저장 불가 */ }
    return result
  } catch (error) {
    if (error.response?.status === 429) {
      try {
        const stale = JSON.parse(localStorage.getItem(cacheKey) || 'null')
        if (stale?.data) return stale.data
      } catch { /* 손상된 캐시는 무시 */ }
      throw new Error('날씨 제공 서버가 잠시 혼잡합니다. 1분 뒤 다시 시도해 주세요.')
    }
    throw error
  }
}

export const fetchMountainWeather = async (lat, lon, elevation = 0) => {
  if (TEMPORARY_WEATHER_MODE) return createTemporaryDetailedWeather(lat, lon)
  const response = await axios.get(OPEN_METEO_BASE_URL, { params: {
    latitude: lat, longitude: lon, elevation, timezone: 'auto', forecast_days: 1,
    current: 'temperature_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_gusts_10m,precipitation,snowfall',
    daily: 'temperature_2m_max,temperature_2m_min,sunrise,sunset'
  } })
  return response.data
}

export const fetchAllMountainWeather = async (locations) => {
  if (TEMPORARY_WEATHER_MODE) return locations.map((location) => createTemporaryDetailedWeather(location.latitude, location.longitude))
  const response = await axios.get(OPEN_METEO_BASE_URL, { params: {
    latitude: locations.map(x => x.latitude).join(','), longitude: locations.map(x => x.longitude).join(','),
    elevation: locations.map(x => x.elevation || 0).join(','), timezone: 'auto', forecast_days: 1,
    current: 'temperature_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_gusts_10m,precipitation,snowfall',
    daily: 'temperature_2m_max,temperature_2m_min,sunrise,sunset'
  } })
  return Array.isArray(response.data) ? response.data : [response.data]
}

// 도시명(검색어) 하나로 좌표 변환 + 실시간 날씨 + 예보를 한 번에 조회하는 헬퍼
export const fetchWeatherByCityName = async (cityName) => {
  const candidates = await geocodeCity(cityName)
  if (candidates.length === 0) {
    return { place: null, current: null, forecast: [] }
  }
  const place = candidates[0]
  const [current, forecast] = await Promise.all([
    fetchCurrentWeather(place.latitude, place.longitude),
    fetchForecast(place.latitude, place.longitude)
  ])
  return { place, current, forecast }
}

export const fetchDetailedWeatherByCityName = async (cityName) => {
  const normalized = decodeURIComponent(cityName).trim()
  const known = QUICK_CITIES.find((city) =>
    city.name === normalized || city.region === normalized || city.region.includes(normalized)
  )
  const candidates = known ? [] : await geocodeCity(normalized)
  if (!known && candidates.length === 0) return { place: null, detail: null }
  const place = known
    ? { name: known.region, country: known.country, latitude: known.latitude, longitude: known.longitude }
    : candidates[0]
  const detail = await fetchDetailedWeather(place.latitude, place.longitude)
  return { place, detail }
}

export const weatherCodeLabel = (code) => {
  if (code === 0) return '맑음'
  if (code <= 2) return '대체로 맑음'
  if (code === 3) return '흐림'
  if ([45, 48].includes(code)) return '안개'
  if (code >= 51 && code <= 57) return '이슬비'
  if (code >= 61 && code <= 67) return '비'
  if (code >= 71 && code <= 77) return '눈'
  if (code >= 80 && code <= 82) return '소나기'
  if (code >= 85 && code <= 86) return '눈보라'
  if (code >= 95) return '뇌우'
  return '변화 가능'
}

export const weatherCodeEmoji = (code, isDay = 1) => {
  if (code === 0) return isDay ? '☀️' : '☾'
  if (code <= 2) return isDay ? '🌤️' : '☾☁'
  if (code === 3) return '☁️'
  if ([45, 48].includes(code)) return '🌫️'
  if (code >= 51 && code <= 82) return '🌧️'
  if (code >= 71 && code <= 86) return '❄️'
  if (code >= 95) return '⛈️'
  return '☁️'
}

// 좌표를 이미 알고 있을 때(즐겨찾기 도시 등) 바로 조회
export const fetchWeatherByCoords = async (lat, lon) => {
  const [current, forecast] = await Promise.all([fetchCurrentWeather(lat, lon), fetchForecast(lat, lon)])
  return { current, forecast }
}

let quickCitiesCache = null
let quickCitiesCachedAt = 0
const QUICK_CACHE_KEY = 'weather-quick-cities-v2'
const quickCityFallback = () => Object.fromEntries(QUICK_CITIES.map((city) => [city.id, null]))

// 전국 도시를 요청 1회로 묶어 호출 제한(429)을 방지한다. 10분 메모리 캐시 적용.
export const fetchAllQuickCities = async () => {
  if (TEMPORARY_WEATHER_MODE) return Object.fromEntries(QUICK_CITIES.map((city, index) => [city.id, temporaryQuickWeather(city, index)]))
  if (quickCitiesCache && Date.now() - quickCitiesCachedAt < 10 * 60 * 1000) return quickCitiesCache
  try {
    const stored = JSON.parse(sessionStorage.getItem(QUICK_CACHE_KEY) || 'null')
    if (stored?.at && stored?.data && Date.now() - stored.at < 30 * 60 * 1000) {
      quickCitiesCache = stored.data; quickCitiesCachedAt = stored.at; return stored.data
    }
  } catch { /* 캐시가 손상되면 새로 조회 */ }
  const params = {
    latitude: QUICK_CITIES.map(c => c.latitude).join(','),
    longitude: QUICK_CITIES.map(c => c.longitude).join(','),
    timezone: 'auto', forecast_days: 1,
    current: 'temperature_2m,weather_code',
    daily: 'temperature_2m_max,temperature_2m_min'
  }
  let response
  try {
    response = await axios.get(OPEN_METEO_BASE_URL, {
      params,
      headers: { 'Cache-Control': 'no-cache' }
    })
  } catch (error) {
    if (error.response?.status !== 429) throw error
    // 429 상태에서 곧바로 같은 대량 요청을 반복하면 제한 시간이 더 길어진다.
    // 이전 캐시가 있으면 사용하고, 없으면 빈 카드 모델을 반환해 UI를 유지한다.
    try {
      const stale = JSON.parse(sessionStorage.getItem(QUICK_CACHE_KEY) || 'null')
      if (stale?.data) return stale.data
    } catch { /* 손상된 캐시는 무시 */ }
    return quickCityFallback()
  }
  const rows = Array.isArray(response.data) ? response.data : [response.data]
  const weatherByCity = {}
  QUICK_CITIES.forEach((city, index) => {
    const data = rows[index]
    if (!data?.current) { weatherByCity[city.id] = null; return }
    weatherByCity[city.id] = {
      main: { temp: data.current.temperature_2m, temp_max: data.daily.temperature_2m_max[0], temp_min: data.daily.temperature_2m_min[0] },
      weather: [{ main: weatherCodeLabel(data.current.weather_code), description: weatherCodeLabel(data.current.weather_code) }]
    }
  })
  quickCitiesCache = weatherByCity
  quickCitiesCachedAt = Date.now()
  try { sessionStorage.setItem(QUICK_CACHE_KEY, JSON.stringify({ at: quickCitiesCachedAt, data: weatherByCity })) } catch { /* 저장 불가 환경 */ }
  return weatherByCity
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
  맑음: '☀️',
  '대체로 맑음': '🌤️',
  흐림: '☁️',
  안개: '🌫️',
  이슬비: '🌦️',
  비: '🌧️',
  소나기: '🌧️',
  눈: '❄️',
  눈보라: '🌨️',
  뇌우: '⛈️'
}
export const getWeatherEmoji = (main) => WEATHER_EMOJI[main] || '🌡️'
