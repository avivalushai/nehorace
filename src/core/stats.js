// Personal records, saved in this browser: races, wins, podiums, best score, fastest time, total victims.
// Loaded values are validated like the wallet, so bad data resets to zero instead of breaking the game.
const STATS_KEY='nehorace-stats';
const Stats={races:0,wins:0,podiums:0,bestScore:0,bestTime:0,victims:0};
function statsLoad(){try{const o=JSON.parse(localStorage.getItem(STATS_KEY)||'null');if(o&&typeof o==='object')for(const k in Stats)if(Number.isFinite(o[k])&&o[k]>0)Stats[k]=k==='bestTime'?o[k]:Math.floor(o[k]);}catch(e){}}
function statsSave(){try{localStorage.setItem(STATS_KEY,JSON.stringify(Stats));}catch(e){}}
// returns which records this race broke. The first race sets records without calling them "new"
function recordRace({score,pos,time,victims}){
  const first=Stats.races===0,newScore=score>Stats.bestScore,newTime=time>0&&(!Stats.bestTime||time<Stats.bestTime);
  Stats.races++;if(pos===1)Stats.wins++;if(pos<=3)Stats.podiums++;Stats.victims+=victims;
  if(newScore)Stats.bestScore=score;if(newTime)Stats.bestTime=time;statsSave();
  return{newScore:newScore&&!first,newTime:newTime&&!first};
}
statsLoad();

export { Stats, recordRace };
