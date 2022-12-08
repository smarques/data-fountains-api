const db = require("../db");
const stats = {};
const CAP_AVERAGE = 5;

stats.getAverages = () => {
  return db.getAverages();
};
stats.getLatestData = (dt) => {
  return db.getLatestData(dt);
};
stats.getLatestNormalizedValues = (dt) => {
  const avgs = stats.getAverages();
  const latest = stats.getLatestData(dt);
  // console.log(avgs,latest)
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
    const normalizedChange = Math.round((latestByPosition[pos] - avgsByPosition[pos]) * 100 / avgsByPosition[pos]) / 100
    res[pos] = 
      latestByPosition[pos] ? 
      capChangePerc(normalizedChange)
      :
      'null' 
  }
  return res;
};

const capChangePerc = (changePerc) => {
  console.log(CAP_AVERAGE)

  if(changePerc < (-1 * CAP_AVERAGE)) return -1 * CAP_AVERAGE;
  if(changePerc > CAP_AVERAGE) return CAP_AVERAGE;
  return changePerc;
}

module.exports = stats;
