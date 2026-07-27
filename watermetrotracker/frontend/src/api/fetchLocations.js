import BASE_URL from './config';

const fetchLocations = async () => {
  try {
    const response = await fetch(`${BASE_URL}/locations`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching locations:", error);
    return [];
  }
};

export default fetchLocations;

