const db = require("../db");
const stats = {};

stats.getAverages = () => {
  return db.getAverages();
};
stats.getLatestData = () => {
  return db.getLatestData();
};
stats.getLatestNormalizedValues = () => {
  const avgs = stats.getAverages();
  const latest = stats.getLatestData();
  console.log(avgs,latest)
  const avgsByPosition = avgs.reduce((prev, curr)=>{
    prev[curr.position] = curr.average;
    return prev;
  },{});
  const latestByPosition = latest.reduce((prev, curr)=>{
    prev[curr.position] = curr.q;
    return prev;
  },{});
  const res = {}
  for(pos in avgsByPosition){
    res[pos] = 
      latestByPosition[pos] ? 
      Math.round((latestByPosition[pos] - avgsByPosition[pos]) * 100 / avgsByPosition[pos]) / 100
      :
      'null' 

  }
  return res;
};

module.exports = stats;
