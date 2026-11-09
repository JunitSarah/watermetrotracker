import BASE_URL from './config';

const fetchLocations = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/routes/from`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching locations:", error);
    return [];
  }
};

export default fetchLocations;