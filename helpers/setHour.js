const setHour = () => {
  var d = new Date();
  return (-d + d.setHours(16,40,0,0));
}

module.exports = setHour;