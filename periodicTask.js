const HALF_DAY_MILLISECONDS = 1000 * 60 * 60 * 12;

const setHours = () => {
  var d = new Date();
  return (-d + d.setHours(20,0,0,0));
}

const runPeriodicTask = (func, arg) => {
  setTimeout(function() {
    func(arg);
    setInterval(function() { 
      func(arg);
    }, HALF_DAY_MILLISECONDS)
  }, setHours());
};

module.exports = runPeriodicTask;