import axios from 'axios';

const bloxchaApi = () => {
  const loadStats = async (network) => {
    const domain = network === 'prater'
      ? process.env.BLOXCHA_PRATER_URL
      : process.env.BLOXCHA_MAINNET_URL;
    const { data } = await axios(`${domain}/v1/block/latest`);
    return data;
  };

  return {
    loadStats
  };
};

export default bloxchaApi();
