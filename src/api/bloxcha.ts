import axios from 'axios';

const bloxchaApi = () => {
  const loadStats = async (network) => {
    const domain = network === 'pyrmont'
      ? process.env.BLOXCHA_PYRMONT_URL
      : process.env.BLOXCHA_MAINNET_URL;
    const { data } = await axios(`${domain}/v1/block/latest`);
    return data;
  };

  return {
    loadStats
  };
};

export default bloxchaApi();