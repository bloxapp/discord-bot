const runPeriodicTask = async (func, args, timeConfig, sendMessageFunc) => {
  const { start, interval } = timeConfig;
  setTimeout(async() => {
    sendMessageFunc(await func(...args));
    setInterval(async () => sendMessageFunc(await func(...args)), interval);
  }, start);
};

module.exports = runPeriodicTask;