const axios = require('axios');

const organizationsApi = () => {
  const loadStats = async (isStage) => {
    const path = 'stats';
    const url = isStage ? `${process.env.ORG_STAGE_URL}/${path}` : `${process.env.ORG_URL}/${path}`;
    const stats = await axios(url);
    return stats.data.users;
  };

  return {
    loadStats
  };
};

module.exports = organizationsApi();