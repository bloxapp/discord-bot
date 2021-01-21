import axios from 'axios';

const organizationsApi = () => {
  const loadStats = async () => {
    const url = `${process.env.ORG_URL}/stats`;
    const stats = await axios(url);
    return stats.data.users;
  };

  return {
    loadStats
  };
};

export default organizationsApi();