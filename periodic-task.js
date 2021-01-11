const runPeriodicTask = (func, args, timeConfig) => {
  const { start, interval } = timeConfig;
  setTimeout(() => {
    func(...args);
    setInterval(() => { 
      func(...args);
    }, interval)
  }, start);
};

module.exports = runPeriodicTask;