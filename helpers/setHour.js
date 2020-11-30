const setHour = () => {
  var d = new Date();
  return (-d + d.setHours(20,0,0,0));
}

module.exports = setHour;