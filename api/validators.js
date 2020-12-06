const axios = require('axios');

const validatorsApi = () => {
  const loadWallets = async (isStage) => {
    const path = 'monitor/wallets_states';
    const url = isStage ? `${process.env.VC_STAGE_URL}/${path}` : `${process.env.VC_URL}/${path}`;
    const wallets = await axios(url);
    return wallets.data.result;
  }
  
  const loadValidators = async (isStage) => {
    const path = 'monitor/accounts_states';
    const url = isStage ? `${process.env.VC_STAGE_URL}/${path}` : `${process.env.VC_URL}/${path}`;
    const validators = await axios(url);
    return validators.data.result;
  }

  const loadNewValidators = async (isStage, network) => {
    const interval = `activation={"minutes":30}&network=${network}`;
    const url = isStage ? 
      `${process.env.VC_STAGE_URL}/accounts/?${interval}` :
      `${process.env.VC_URL}/accounts/?${interval}`;
    const validators = await axios(url);
    return validators.data.slice(0, 10);
  };

  return {
    loadWallets,
    loadValidators,
    loadNewValidators
  };
};

module.exports = validatorsApi();