const apiKey = import.meta.env.VITE_WEATHER_KEY;
const baseURL = "https://api.openweathermap.org/data/2.5/";

export const fetchWeather = async (city) => {
  try {
    const res = await fetch(`${baseURL}weather?q=${city}&appid=${apiKey}`);
    const data = await res.json();

    if (data.cod !== 200) {
      throw new Error(data.message);
    }

    return data;
  } catch (error) {
    console.error("Failed to fetch weather", error.message);
    throw { error: error.message };
  }
};

export const fetchWeeklyData = async (cityid) => {
  try {
    const res = await fetch(`${baseURL}forecast?id=${cityid}&appid=${apiKey}`);
    const data = await res.json();
    if (data.cod !== "200") {
      throw new Error(data.message);
    }
    return data;
  } catch (error) {
    console.error("Failed to fetch weekly data", error.message);
    throw error;
  }
};
