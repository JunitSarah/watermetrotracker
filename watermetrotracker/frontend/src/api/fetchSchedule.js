import BASE_URL from './config';

const fetchSchedule = async (routeName) => {
  try {
    const response = await fetch(`${BASE_URL}/schedule?route=${routeName}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return [];
  }
};

export default fetchSchedule;

