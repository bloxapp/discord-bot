const axios = require('axios');

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

module.exports = organizationsApi();