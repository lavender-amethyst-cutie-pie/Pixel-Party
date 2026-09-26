const games = {
  kingdoms: { title: 'Kingdoms of Emberfall', kicker: '01 / ADVENTURE', type: 'kingdom', emoji: '♞' },
  'dream-life': { title: 'Dream Life Simulator', kicker: '02 / SIMULATOR', type: 'dream', emoji: '✦' },
  'moto-rush': { title: 'Neon Moto Rush', kicker: '03 / RACING', type: 'moto', emoji: '🏍' }
};

const saveKey = 'pixel-party-save-v1';
const defaultState = {
  kingdoms: { level: 1, hp: 100, gold: 120, gems: 25, exp: 0, wood: 22, stone: 18, city: { walls: 0, homes: 0, workshop: 0, market: 0 }, talked: false, log: ['The Emberfall gate is open. Your story starts here.'] },
  dream: { part: 1, day: 1, cash: 85, saved: 0, joy: 13, goal: 2500, bought: [], feed: ['Mina says: “The dream is real. Start with one good shift.”'] },
  moto: { trophies: 0, bike: 1, shield: 0, best: 0, raceActive: false, ticks: 0, strikes: 0, speed: 0, place: 5, log: ['Pit crew ready. The city lights are yours.'] }
};

let state = loadState();
let currentGame = null;
let toastTimer;

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function loadState() {
  try { return { ...clone(defaultState), ...JSON.parse(localStorage.getItem(saveKey) || '{}') }; } catch { return clone(defaultState); }
}
function saveState() { localStorage.setItem(saveKey, JSON.stringify(state)); }
function $(id) { return document.getElementById(id); }
function money(value) { return '$' + Math.max(0, Math.floor(value)).toLocaleString(); }
function showToast(message) { const el = $('toast'); el.textContent = message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2700); }
function addLog(list, message, limit = 4) { list.unshift(message); list.splice(limit); }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#039;', '"':'&quot;' }[c])); }

function route() {
  const key = location.hash.replace('#', '') || 'home';
  const isGame = Object.prototype.hasOwnProperty.call(games, key);
  if (currentGame === 'moto-rush' && key !== 'moto-rush' && typeof stopMotoAnimation === 'function') stopMotoAnimation();
  $('home-view').hidden = isGame;
  $('game-view').hidden = !isGame;
  document.querySelector('.site-footer').hidden = isGame;
  if (!isGame) { currentGame = null; return; }
  currentGame = key;
  const meta = games[key];
  $('game-kicker').textContent = meta.kicker;
  $('game-title').textContent = meta.title;
  renderGame(key);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderGame(key) {
  if (key === 'kingdoms') renderKingdoms();
  if (key === 'dream-life') renderDreamLife();
  if (key === 'moto-rush') renderMotoRush();
  renderRail(key);
}

function renderRail(active) {
  $('game-rail').innerHTML = Object.entries(games).map(([key, game]) => `<a class="rail-card ${key === active ? 'active' : ''}" href="#${key}"><span class="rail-thumb ${game.type}">${game.emoji}</span><span class="rail-info"><strong>${game.title}</strong><span>${game.kicker.split(' / ')[1]}</span></span><span class="rail-arrow">↗</span></a>`).join('');
}

const levelNames = ['The First Spark', 'Whispering Pines', 'The Lost Cart', 'Mossy Crossing', 'The Bellmaker', 'Moonlit Mines', 'Squire School', 'The Rain Market', 'Old Crow Road', 'The Sunken Shrine', 'Goblin Garden', 'The Glass Bridge', 'Foxfire Camp', 'The Silent Mill', 'Ashen Orchard', 'The Two Banners', 'Rookwatch', 'The Sky Ferry', 'Cindercliff', 'The Clockwork Keep', 'Lantern Marsh', 'The Goldhorn', 'Stormgate', 'The Last Outpost', 'Wyrmwood', 'The Deep Road', 'Ember Lake', 'The Broken Crown', 'Castle at Dawn', 'Emberfall'];
const npcNames = ['Pip the courier', 'Edda the cartographer', 'Moss the baker', 'Sir Nibbs', 'Talla the bellmaker', 'Orin the miner', 'Bram the squire', 'Luma the trader', 'Old Crow', 'Sable the keeper'];
const enemyNames = ['a grumpy slime', 'three moss goblins', 'a runaway cart', 'a bramble beast', 'the bell thief', 'a crystal crawler', 'a practice dummy (rude)', 'a rain hag', 'the road bandits', 'a shrine warden'];
const monsterVisuals = [
  { kind: 'slime', icon: '●', label: 'GRUMPY SLIME', mood: 'BOING!' },
  { kind: 'goblin', icon: '✦', label: 'MOSS GOBLINS', mood: 'GRAAA!' },
  { kind: 'cart', icon: '▣', label: 'RUNAWAY CART', mood: 'ROLL!' },
  { kind: 'bramble', icon: '✺', label: 'BRAMBLE BEAST', mood: 'GRR!' },
  { kind: 'bell', icon: '♩', label: 'BELL THIEF', mood: 'DING!' },
  { kind: 'crystal', icon: '◆', label: 'CRYSTAL CRAWLER', mood: 'SHINE!' }
];
function kingdomMonster(level) { return monsterVisuals[(level - 1) % monsterVisuals.length]; }
function kingdomProgress() { return Math.min(100, Math.round((state.kingdoms.level - 1) / 29 * 100)); }
function renderKingdoms() {
  const s = state.kingdoms, level = Math.min(30, s.level), name = levelNames[level - 1], npc = npcNames[(level - 1) % npcNames.length], enemy = enemyNames[(level - 1) % enemyNames.length], monster = kingdomMonster(level);
  const won = level >= 30 && s.level > 30;
  $('game-shell').innerHTML = `<div class="play-panel"><div class="play-intro"><div><span class="pill pill-yellow">30 LEVEL CAMPAIGN</span><h2>${won ? 'Emberfall is yours.' : name}</h2></div><p>${won ? 'You built a medieval city, made allies, and lit the final beacon. The kingdom will remember your name.' : 'Explore, gather, build. Every level brings a new face, a new corner of Emberfall, and one very beatable problem.'}</p></div><div class="kingdom-layout"><div><div class="kingdom-scene"><div class="scene-copy"><small>LEVEL ${String(level).padStart(2, '0')} / 30</small><h3>${won ? 'A city worth defending' : 'The road ahead is glowing.'}</h3><p>${won ? 'The final banner flies above your new home.' : `A trail of ${level % 2 ? 'blue sparks' : 'golden leaves'} leads toward ${name.toLowerCase()}.`}</p></div><div class="scene-path"></div><div class="scene-land"></div><div class="scene-castle">♜</div><div class="scene-hero">♞</div><div class="scene-item scene-item-gem"><b>◆</b><small>+ GEM</small></div><div class="scene-item scene-item-chest"><b>▣</b><small>LOOT</small></div>${won ? '<div class="victory-banner">CITY COMPLETE <span>✦</span></div>' : `<div class="monster-pod monster-${monster.kind}"><span class="monster-icon">${monster.icon}</span><b>${monster.label}</b><small>${monster.mood}</small></div>`}<div class="level-chip"><span>CAMPAIGN</span><b>${level}<small> / 30</small></b></div></div>${won ? `<div class="kingdom-actions"><button class="btn btn-yellow" id="replay-kingdom" type="button">Replay the campaign ↺</button><a class="btn btn-primary" href="#dream-life">Try another game ↗</a></div>` : `<div class="kingdom-actions"><button class="btn btn-primary" id="explore-btn" type="button">Battle ${monster.label.toLowerCase()} <span>⚔</span></button><button class="btn btn-yellow" id="talk-btn" type="button">Talk to ${npc.split(' ')[0]} <span>✦</span></button></div>`}</div><div class="kingdom-side"><div class="kingdom-stats-card"><div class="stat-row"><div><small>HP</small><b>${s.hp}%</b></div><div><small>GOLD</small><b>${s.gold}</b></div><div><small>GEMS</small><b>${s.gems}</b></div><div><small>EXP</small><b>${s.exp}</b></div></div><div class="progress-label" style="margin-top:17px"><span>CAMPAIGN PROGRESS</span><span>${kingdomProgress()}%</span></div><div class="progress"><i style="width:${kingdomProgress()}%"></i></div><div class="stat-row"><div><small>WOOD</small><b>${s.wood}</b></div><div><small>STONE</small><b>${s.stone}</b></div><div><small>DEFEATS</small><b>${Math.max(0, Math.floor(s.exp / 15) - level + 1)}</b></div><div><small>LUCK</small><b>${s.city.market + 1}×</b></div></div></div><div class="npc-card"><div class="npc-name"><span class="npc-avatar">${npc[0]}</span><span>ENCOUNTER / ${escapeHtml(npc)}</span></div><h3>${s.talked ? '“You have a builder’s eye.”' : `${escapeHtml(npc)} waves you over.`}</h3><p>${s.talked ? 'The locals are talking about your new walls. It is a good kind of rumor.' : 'A new character is waiting at every turn. Talking is free, and sometimes it pays.'}</p><div class="quote-box">${s.talked ? '“The market is brighter when the right people show up.”' : '“Psst. I know a shortcut. But first, tell me — what do you want to build?”'}</div></div><div class="city-card"><h3>Your city <span>${s.city.walls + s.city.homes + s.city.workshop + s.city.market} upgrades</span></h3><div class="build-grid"><button class="build-btn" data-build="walls" ${s.wood < 12 || s.stone < 8 ? 'disabled' : ''}><span><b>Walls</b><small>12 wood · 8 stone</small></span><strong>＋</strong></button><button class="build-btn" data-build="homes" ${s.wood < 8 || s.gold < 30 ? 'disabled' : ''}><span><b>Homes</b><small>8 wood · 30 gold</small></span><strong>＋</strong></button><button class="build-btn" data-build="workshop" ${s.stone < 12 || s.gold < 45 ? 'disabled' : ''}><span><b>Workshop</b><small>12 stone · 45 gold</small></span><strong>＋</strong></button><button class="build-btn" data-build="market" ${s.wood < 6 || s.gold < 60 ? 'disabled' : ''}><span><b>Market</b><small>6 wood · 60 gold</small></span><strong>＋</strong></button></div><div class="battle-log">${s.log.map(line => `<div>${line}</div>`).join('')}</div></div></div></div></div>`;
  $('explore-btn')?.addEventListener('click', kingdomExplore);
  $('talk-btn')?.addEventListener('click', kingdomTalk);
  $('replay-kingdom')?.addEventListener('click', () => { state.kingdoms = clone(defaultState.kingdoms); saveState(); renderKingdoms(); showToast('A new Emberfall story begins.'); });
  document.querySelectorAll('[data-build]').forEach(btn => btn.addEventListener('click', () => buildCity(btn.dataset.build)));
  if (won) {
    const colors = ['#f6c742', '#f0776b', '#b4a2ee', '#c8e96b', '#8fe4d0'];
    const confetti = Array.from({ length: 22 }, (_, i) => `<i style="--x:${(i * 37) % 98}%;--d:${(i % 7) * .22}s;--r:${(i * 29) % 160 - 80}deg;--c:${colors[i % colors.length]}"></i>`).join('');
    const scene = document.querySelector('.kingdom-scene');
    if (scene) {
      scene.classList.add('finish-scene');
      scene.innerHTML = `<div class="finish-sky"><div class="confetti-rain">${confetti}</div><div class="firework firework-left"><b>✦</b></div><div class="firework firework-right"><b>✦</b></div><div class="balloon balloon-left"><b></b><small></small></div><div class="balloon balloon-right"><b></b><small></small></div><div class="finish-sparkle sparkle-one">✦</div><div class="finish-sparkle sparkle-two">✧</div></div><div class="castle-finale"><div class="castle-tower tower-left"><span class="castle-roof"></span><span class="castle-window"></span><span class="castle-flag">⚑</span></div><div class="castle-wing castle-wing-left"><span class="castle-window"></span><span class="castle-window"></span></div><div class="castle-center"><span class="castle-rose">✿</span><span class="castle-door"></span><span class="castle-gate"></span><span class="castle-banner">EMBERFALL</span></div><div class="castle-wing castle-wing-right"><span class="castle-window"></span><span class="castle-window"></span></div><div class="castle-tower tower-right"><span class="castle-roof"></span><span class="castle-window"></span><span class="castle-flag">⚑</span></div></div><div class="finish-copy"><small>30 / 30 COMPLETE</small><b>EMBERFALL IS YOURS!</b><span>✦ CONGRATULATIONS ✦</span></div>`;
    }
  }
}
function kingdomExplore() {
  const s = state.kingdoms; const roll = Math.random(); const level = Math.min(s.level, 30); const loot = 18 + level * 3;
  if (roll < .2) {
    s.hp = 100; s.gold = Math.max(0, Math.floor(s.gold * .95)); s.gems = Math.max(0, Math.floor(s.gems * .95)); s.wood = Math.max(0, Math.floor(s.wood * .95)); s.stone = Math.max(0, Math.floor(s.stone * .95)); s.exp = Math.max(0, Math.floor(s.exp * .95)); addLog(s.log, `<strong>DEFEATED.</strong> A 5% loss stings, but your story continues.`); showToast('Defeated — you lost 5% of materials, gems, and EXP.');
  } else {
    s.gold += loot; s.gems += Math.random() > .65 ? 2 : 0; s.wood += 4 + (level % 3); s.stone += 3 + (level % 2); s.exp += 10 + level * 2; s.hp = Math.max(42, s.hp - (8 + Math.floor(Math.random() * 15))); s.level += 1; s.talked = false; addLog(s.log, `<strong>VICTORY.</strong> ${enemyNames[(level - 1) % enemyNames.length]} cleared. +${loot} gold, +${10 + level * 2} EXP.`); showToast(level >= 30 ? 'Final level cleared — Emberfall is yours!' : `Level cleared! Welcome to ${levelNames[Math.min(level, 29)]}.`);
  }
  saveState(); renderKingdoms();
}
function kingdomTalk() { const s = state.kingdoms; if (!s.talked) { s.talked = true; s.gold += 12; s.exp += 4; addLog(s.log, '<strong>NEW ALLY.</strong> A conversation earned +12 gold and +4 EXP.'); showToast('New ally found — the city feels a little more alive.'); } else { s.gems += 1; addLog(s.log, '<strong>GOOD CHAT.</strong> A familiar face gave you a gem.'); showToast('Your ally slipped you a shiny gem.'); } saveState(); renderKingdoms(); }
function buildCity(type) { const s = state.kingdoms; const cost = { walls:{wood:12,stone:8}, homes:{wood:8,gold:30}, workshop:{stone:12,gold:45}, market:{wood:6,gold:60} }[type]; if (Object.entries(cost).some(([k,v]) => s[k] < v)) return showToast('Your city needs more materials for that.'); Object.entries(cost).forEach(([k,v]) => s[k] -= v); s.city[type] += 1; if (type === 'market') s.gold += 10; addLog(s.log, `<strong>CITY GROWS.</strong> ${type} upgraded to level ${s.city[type]}.`); saveState(); renderKingdoms(); showToast(`${type[0].toUpperCase() + type.slice(1)} upgraded.`); }

const shopItems = [{ id:'home', icon:'⌂', name:'Tiny home', desc:'A place to reset.', cost:360, joy:18 }, { id:'scooter', icon:'🛵', name:'Cherry scooter', desc:'Arrive with style.', cost:520, joy:24 }, { id:'studio', icon:'▦', name:'Dream studio', desc:'Make something loud.', cost:700, joy:34 }, { id:'stickers', icon:'✦', name:'Sticker pack', desc:'A totally valid expense.', cost:75, joy:5 }];
function renderDreamLife() {
  const s = state.dream, part = s.part || 1, progress = Math.min(100, Math.round((s.saved / s.goal) * 100)), ended = s.saved >= s.goal;
  $('game-shell').innerHTML = `<div class="play-panel"><div class="play-intro"><div><span class="pill pill-lime">YOUR MONEY, YOUR RULES</span><h2>${ended ? 'Dream life unlocked.' : 'Build your dream life.'}</h2></div><p>${ended ? 'You saved enough to turn the daydream into a front door. Want to start over and spend even wilder?' : 'Take shifts, make choices, and decide what deserves your money. Every little move changes the life you can afford.'}</p></div><div class="sim-layout"><div class="sim-dashboard"><p class="eyebrow">DAY ${s.day} / THE HUSTLE</p><h2>${ended ? 'You made it.' : 'One good day<br />at a time.'}</h2><div class="sim-scene"><span class="room-sun">☼</span><span class="room-cloud cloud-left"></span><span class="room-cloud cloud-right"></span><span class="room-lamp">⌁</span><span class="room-plant">♣</span><span class="room-couch">▰</span><span class="room-phone">▯</span><span class="scene-sticker">${s.bought.length ? 'LIFE<br>UP!' : 'START<br>HERE'}</span><small>YOUR FUTURE / LOADING...</small></div><div class="money-display"><strong>${money(s.cash)}</strong><span>AVAILABLE CASH</span></div><div class="progress-label"><span>DREAM FUND</span><span>${money(s.saved)} / ${money(s.goal)}</span></div><div class="progress"><i style="width:${progress}%"></i></div><div class="sim-actions"><button class="btn btn-coral" id="work-btn" type="button">${ended ? 'Start a new dream' : 'Work a shift'} <span>＋</span></button><button class="btn" id="save-btn" type="button">Move $100 to fund <span>↗</span></button></div><div class="sim-quote"><b>MINA / COACH</b><span>${ended ? '“I knew you could do it. The next dream is even better.”' : '“Money is just a tool. Use it to build a life that feels like yours.”'}</span></div></div><div class="sim-side"><div class="wallet-card"><div><small>DAY</small><b>${s.day}</b></div><div><small>JOY</small><b class="green">${s.joy}</b></div><div><small>BOUGHT</small><b>${s.bought.length}/15</b></div></div><div class="shop-card"><h3>Spend on your life.</h3><div class="shop-items">${shopItems.map(item => `<div class="shop-item"><span class="shop-icon">${item.icon}</span><span><h4>${item.name}</h4><p>${item.desc} +${item.joy} joy</p></span><button class="shop-buy" data-shop="${item.id}" ${s.cash < item.cost || s.bought.includes(item.id) ? 'disabled' : ''}>${s.bought.includes(item.id) ? 'OWNED' : money(item.cost)}</button></div>`).join('')}</div><div class="sim-feed">${s.feed.slice(0,3).map(x => `<div>${x}</div>`).join('')}</div></div></div></div></div>`;
  $('work-btn')?.addEventListener('click', dreamWork);
  $('save-btn')?.addEventListener('click', dreamSave);
  document.querySelectorAll('[data-shop]').forEach(btn => btn.addEventListener('click', () => buyDream(btn.dataset.shop)));
  if (ended) {
    const introTitle = document.querySelector('.play-intro h2');
    const introCopy = document.querySelector('.play-intro p');
    const dashboardTitle = document.querySelector('.sim-dashboard h2');
    const actions = document.querySelector('.sim-actions');
    if (introTitle) introTitle.textContent = part === 1 ? 'Part 1 complete.' : 'Both dreams complete.';
    if (dashboardTitle) dashboardTitle.innerHTML = part === 1 ? 'You made it.<br />Ready for more?' : 'You made it.<br />Twice.';
    if (introCopy) introCopy.textContent = part === 1 ? 'You hit the first dream target. Keep your cash, keep your joy, and unlock a bigger life with the next chapter.' : 'You saved through the second target too. That is a life well built — and a very good reason to celebrate.';
    if (actions) actions.innerHTML = part === 1 ? '<button class="btn btn-coral" id="part2-btn" type="button">Dream Life Part 2 <span>↗</span></button><div class="part-clear">NEW TARGET <b>+$1,000</b></div>' : '<button class="btn btn-yellow" id="replay-dream" type="button">Replay the dream ↺</button>';
    $('part2-btn')?.addEventListener('click', dreamPart2);
    $('replay-dream')?.addEventListener('click', () => { state.dream = clone(defaultState.dream); saveState(); renderDreamLife(); showToast('A fresh dream is ready.'); });
  }
}
function dreamWork() { const s = state.dream; if (s.saved >= s.goal) return; const payout = 95 + Math.floor(Math.random() * 55) + Math.floor(s.joy / 5); s.cash += payout; s.day += 1; if (Math.random() > .72) { s.cash += 30; addLog(s.feed, `Lucky break: a client tipped you $30.`); } else addLog(s.feed, `Day ${s.day}: shift complete. +${money(payout)} in the pocket.`); saveState(); renderDreamLife(); showToast(`Shift complete — you earned ${money(payout)}.`); }
function dreamPart2() { const s = state.dream; if ((s.part || 1) !== 1 || s.saved < s.goal) return; s.part = 2; s.goal += 1000; addLog(s.feed, '<strong>PART 2 UNLOCKED.</strong> The next dream costs $1,000 more.'); saveState(); renderDreamLife(); showToast('Dream Life Part 2 unlocked — new target: $3,500.'); }
function dreamSave() { const s = state.dream; if (s.cash < 100) return showToast('You need $100 available to move into the dream fund.'); s.cash -= 100; s.saved += 100; addLog(s.feed, `A smart move: $100 moved to the dream fund.`); saveState(); renderDreamLife(); showToast(s.saved >= s.goal ? 'That’s it — your dream life is unlocked!' : '$100 parked safely in the dream fund.'); }
function buyDream(id) { const s = state.dream, item = shopItems.find(x => x.id === id); if (!item || s.cash < item.cost || s.bought.includes(id)) return; s.cash -= item.cost; s.joy += item.joy; s.bought.push(id); addLog(s.feed, `${item.name} acquired. Joy went up +${item.joy}.`); saveState(); renderDreamLife(); showToast(`${item.name} added to your dream life.`); }

function renderMotoRush() {
  const s = state.moto, active = s.raceActive, finished = !active && s.ticks > 0, canUpgrade = s.trophies >= 25;
  const status = active ? `LAP ${Math.min(5, Math.floor(s.ticks / 2) + 1)} / 5` : finished ? (s.place <= 3 ? `PODIUM FINISH — ${s.place}${s.place === 1 ? 'ST' : s.place === 2 ? 'ND' : 'RD'}` : 'RACE OVER — TRY AGAIN') : 'RACE NIGHT IS LIVE';
  $('game-shell').innerHTML = `<div class="play-panel"><div class="play-intro"><div><span class="pill pill-lilac">DODGE. LEAN. BOOST.</span><h2>${active ? 'Stay on the line.' : 'Chase the podium.'}</h2></div><p>${finished ? 'The crowd has spoken. Tune your bike, then get back out there for a better place.' : 'Three hits in the mud and the race is over. Keep your speed up and make every move count.'}</p></div><div class="race-layout"><div class="race-track"><div class="track-sky"></div><div class="track-buildings"></div><div class="track-road"></div><div class="race-bike" style="left:${active ? 25 + Math.min(45, s.speed / 2) : 33}%;bottom:${active && s.strikes ? 83 : 95}px">🏍</div><div class="race-status"><span>${status}</span><b>● ${s.strikes}/3 STRIKES</b></div><div class="race-controls">${active ? `<button class="btn btn-yellow" id="dodge-btn" type="button">Dodge ↗</button><button class="btn btn-coral" id="boost-btn" type="button">Boost ⚡</button>` : `<button class="btn btn-coral" id="start-race" type="button">${finished ? 'Race again' : 'Start race'} <span>→</span></button>`}</div></div><div class="race-side"><div class="race-score"><div><small>TROPHIES</small><strong>${s.trophies}</strong></div><div><small>BEST PLACE</small><strong>${s.best ? s.best + '°' : '—'}</strong></div><div><small>BIKE LVL</small><strong>${s.bike}</strong></div></div><div class="upgrade-card"><h3>Garage upgrades</h3><button class="upgrade-btn" id="bike-upgrade" ${canUpgrade ? '' : 'disabled'}><span><b>Engine tune</b><small>More speed per boost</small></span><strong>25 ✦</strong></button><button class="upgrade-btn" id="shield-upgrade" ${s.trophies >= 50 ? '' : 'disabled'}><span><b>Mud shield</b><small>Ignore one strike</small></span><strong>50 ✦</strong></button></div><div class="race-log">${s.log.slice(0,5).map(line => `<div>${line}</div>`).join('')}</div></div></div></div>`;
  $('start-race')?.addEventListener('click', startRace); $('dodge-btn')?.addEventListener('click', () => raceMove('dodge')); $('boost-btn')?.addEventListener('click', () => raceMove('boost')); $('bike-upgrade')?.addEventListener('click', upgradeBike); $('shield-upgrade')?.addEventListener('click', upgradeShield);
}
function startRace() { const s = state.moto; s.raceActive = true; s.ticks = 0; s.strikes = 0; s.speed = 20 + s.bike * 8; s.place = 5; s.log = ['Race started — the city is moving fast.']; saveState(); renderMotoRush(); showToast('Throttle open. Pick your line.'); }
function raceMove(move) { const s = state.moto; if (!s.raceActive) return; s.ticks += 1; const hazard = Math.random() < .36; if (hazard && move !== 'dodge') { if (s.shield > 0) { s.shield -= 1; addLog(s.log, '<strong>SHIELD POP.</strong> Mud splash ignored.'); showToast('Your mud shield saved the run.'); } else { s.strikes += 1; s.speed = Math.max(5, s.speed - 18); addLog(s.log, `<strong>HIT.</strong> ${s.strikes}/3 strikes — you lost speed.`); showToast('Oof. Keep your line clean.'); } } else { const gain = move === 'boost' ? 24 + s.bike * 5 : 10; s.speed += gain; addLog(s.log, move === 'boost' ? '<strong>BOOST.</strong> Neon trail activated.' : '<strong>CLEAN MOVE.</strong> You threaded the gap.'); }
  s.place = Math.max(1, Math.min(5, 5 - Math.floor(s.speed / 55))); if (s.strikes >= 3 || s.ticks >= 10) finishRace(); else { saveState(); renderMotoRush(); }
}
function finishRace() { const s = state.moto; s.raceActive = false; if (s.strikes >= 3) { s.place = 5; addLog(s.log, '<strong>RACE OVER.</strong> Three strikes. The pit crew is waiting.'); showToast('Three strikes — you automatically lose this race.'); } else { s.place = Math.max(1, Math.min(3, s.place)); const prize = {1:100,2:50,3:25}[s.place]; s.trophies += prize; s.best = s.best ? Math.min(s.best, s.place) : s.place; addLog(s.log, `<strong>FINISH.</strong> ${s.place}${s.place === 1 ? 'st' : s.place === 2 ? 'nd' : 'rd'} place — +${prize} trophies.`); showToast(`Podium finish! You earned ${prize} trophies.`); } saveState(); renderMotoRush(); }
function upgradeBike() { const s = state.moto; if (s.trophies < 25) return; s.trophies -= 25; s.bike += 1; saveState(); renderMotoRush(); showToast('Engine tuned — your boost hits harder.'); }
function upgradeShield() { const s = state.moto; if (s.trophies < 50) return; s.trophies -= 50; s.shield += 1; saveState(); renderMotoRush(); showToast('Mud shield installed for the next race.'); }

// The race uses a small canvas loop so the bike, road, weather and hazards keep moving between actions.
let motoRuntime = { running: false, raf: 0, last: 0, progress: 0, lane: 1, targetLane: 1, obstacles: [], spawn: 0, canvas: null, ctx: null };
function motoPlace(s) { return Math.max(1, Math.min(5, 5 - Math.floor(s.speed / 48))); }
function motoStatus(s) { return s.raceActive ? `LAP ${Math.min(5, Math.floor(motoRuntime.progress * 5) + 1)} / 5` : s.ticks > 0 ? (s.place <= 3 ? `PODIUM FINISH — ${s.place}${s.place === 1 ? 'ST' : s.place === 2 ? 'ND' : 'RD'}` : 'RACE OVER — TRY AGAIN') : 'RACE NIGHT IS LIVE'; }
function updateRaceHUD() {
  const s = state.moto;
  const set = (id, value) => { const el = $(id); if (el) el.textContent = value; };
  set('race-status-copy', motoStatus(s)); set('race-strike-copy', `● ${s.strikes}/3 STRIKES`); set('race-trophy-copy', s.trophies); set('race-best-copy', s.best ? `${s.best}°` : '—'); set('race-bike-copy', s.bike); set('race-lap-copy', `LAP ${Math.min(5, Math.floor(motoRuntime.progress * 5) + 1)} / 5`);
  const log = $('race-log-copy'); if (log) log.innerHTML = s.log.slice(0, 5).map(line => `<div>${line}</div>`).join('');
}
function renderMotoRush() {
  const s = state.moto, active = s.raceActive, finished = !active && s.ticks > 0, canUpgrade = s.trophies >= 25;
  if (!active) stopMotoAnimation();
  $('game-shell').innerHTML = `<div class="play-panel"><div class="play-intro"><div><span class="pill pill-lilac">DODGE. LEAN. BOOST.</span><h2>${active ? 'Own the fast lane.' : 'Chase the podium.'}</h2></div><p>${finished ? 'Your tires are warm and the crowd is loud. Spend trophies on upgrades, then throw down another run.' : 'The road is packed with cones, crates, boost tokens and shiny coins. Move lanes, boost through gaps, and hold your line.'}</p></div><div class="race-layout"><div class="race-track race-track-bright"><canvas id="race-canvas" aria-label="Animated neon motorcycle race track"></canvas><div class="bike-overlay" id="bike-overlay" style="left:${[27,50,73][Math.max(0, Math.min(2, Math.round(motoRuntime.lane)))]}%">🏍</div><div class="track-overlay"><span class="track-route">SUNSET LOOP // SECTOR 07</span><span class="track-collection"><i></i> GRAB COINS <b>$</b></span></div><div class="track-key"><span><b class="key-mud"></b>MUD</span><span><b class="key-crate"></b>CRATE</span><span><b class="key-coin"></b>COIN</span></div><div class="race-status"><span id="race-status-copy">${motoStatus(s)}</span><b id="race-strike-copy">● ${s.strikes}/3 STRIKES</b></div><div class="race-controls">${active ? `<button class="btn btn-yellow" id="dodge-btn" type="button">Dodge lane ↔</button><button class="btn btn-coral" id="boost-btn" type="button">Boost ⚡</button>` : `<button class="btn btn-coral" id="start-race" type="button">${finished ? 'Race again' : 'Start race'} <span>→</span></button>`}</div></div><div class="race-side"><div class="race-score"><div><small>TROPHIES</small><strong id="race-trophy-copy">${s.trophies}</strong></div><div><small>BEST PLACE</small><strong id="race-best-copy">${s.best ? s.best + '°' : '—'}</strong></div><div><small>BIKE LVL</small><strong id="race-bike-copy">${s.bike}</strong></div></div><div class="upgrade-card"><h3>Garage upgrades</h3><button class="upgrade-btn" id="bike-upgrade" ${canUpgrade ? '' : 'disabled'}><span><b>Engine tune</b><small>More speed per boost</small></span><strong>25 ✦</strong></button><button class="upgrade-btn" id="shield-upgrade" ${s.trophies >= 50 ? '' : 'disabled'}><span><b>Mud shield</b><small>Ignore one strike</small></span><strong>50 ✦</strong></button><div class="garage-note">${s.raceActive ? 'Dodge lane swaps. Boosts stack.' : 'Win a podium to make the bike louder.'}</div></div><div class="race-log" id="race-log-copy">${s.log.slice(0,5).map(line => `<div>${line}</div>`).join('')}</div></div></div></div>`;
  $('start-race')?.addEventListener('click', startRace); $('dodge-btn')?.addEventListener('click', () => raceMove('dodge')); $('boost-btn')?.addEventListener('click', () => raceMove('boost')); $('bike-upgrade')?.addEventListener('click', upgradeBike); $('shield-upgrade')?.addEventListener('click', upgradeShield);
  const collection = document.querySelector('.track-collection'); if (collection) collection.innerHTML = '<i></i> GRAB COINS <b>$</b>';
  const keyCoin = document.querySelector('.key-token'); if (keyCoin) { keyCoin.className = 'key-coin'; keyCoin.parentElement.lastChild.textContent = 'COIN'; }
  const raceIntro = document.querySelector('.play-intro p'); if (raceIntro) raceIntro.textContent = finished ? 'Your tires are warm and the crowd is loud. Spend trophies on upgrades, then throw down another run.' : 'The road is packed with cones, crates, boost tokens and shiny coins. Move lanes, boost through gaps, and hold your line.';
  drawMotoFrame(true);
  if (active) startMotoAnimation();
}
function startRace() { const s = state.moto; s.raceActive = true; s.ticks = 0; s.strikes = 0; s.speed = 42 + s.bike * 9; s.place = 5; s.lane = 1; s.log = ['<strong>LIGHTS OUT.</strong> Find the clean line.']; motoRuntime.progress = 0; motoRuntime.lane = 1; motoRuntime.targetLane = 1; motoRuntime.obstacles = [{ lane:2, z:.2, kind:'crate', checked:false }, { lane:0, z:.38, kind:'coin', checked:false }, { lane:1, z:.58, kind:'boost', checked:false }]; motoRuntime.spawn = 0; saveState(); renderMotoRush(); showToast('Throttle open — the first mud comes later.'); }
function raceMove(move) {
  const s = state.moto; if (!s.raceActive) return;
  if (move === 'dodge') { motoRuntime.targetLane = (Math.round(motoRuntime.targetLane) + 1) % 3; s.lane = motoRuntime.targetLane; s.ticks += 1; addLog(s.log, '<strong>LANE SHIFT.</strong> You slipped into a cleaner line.'); showToast('Smooth lane change.'); }
  if (move === 'boost') { s.speed = Math.min(145, s.speed + 18 + s.bike * 4); s.ticks += 1; addLog(s.log, '<strong>BOOST.</strong> Neon trail activated.'); showToast('Boost engaged — keep it pinned.'); }
  motoRuntime.lane += (motoRuntime.targetLane - motoRuntime.lane) * .55;
  s.place = motoPlace(s); saveState(); drawMotoFrame(); updateRaceHUD();
}
function finishRace() {
  const s = state.moto; if (!s.raceActive) return; s.raceActive = false; stopMotoAnimation();
  if (s.strikes >= 3) { s.place = 5; addLog(s.log, '<strong>RACE OVER.</strong> Three strikes — the pit crew is waiting.'); showToast('Three strikes — automatic loss.'); }
  else { s.place = Math.max(1, Math.min(3, motoPlace(s))); const prize = {1:100,2:50,3:25}[s.place]; s.trophies += prize; s.best = s.best ? Math.min(s.best, s.place) : s.place; addLog(s.log, `<strong>FINISH.</strong> ${s.place}${s.place === 1 ? 'st' : s.place === 2 ? 'nd' : 'rd'} place — +${prize} trophies.`); showToast(`Podium finish! You earned ${prize} trophies.`); }
  saveState(); renderMotoRush();
}
function upgradeBike() { const s = state.moto; if (s.trophies < 25) return; s.trophies -= 25; s.bike += 1; saveState(); renderMotoRush(); showToast('Engine tuned — your boost hits harder.'); }
function upgradeShield() { const s = state.moto; if (s.trophies < 50) return; s.trophies -= 50; s.shield += 1; saveState(); renderMotoRush(); showToast('Mud shield installed for the next race.'); }
function startMotoAnimation() { if (motoRuntime.running) return; motoRuntime.running = true; motoRuntime.last = performance.now(); motoRuntime.raf = requestAnimationFrame(motoLoop); }
function stopMotoAnimation() { if (motoRuntime.raf) cancelAnimationFrame(motoRuntime.raf); motoRuntime.raf = 0; motoRuntime.running = false; }
function motoLoop(now) {
  if (!motoRuntime.running || !state.moto.raceActive) return;
  const dt = Math.min(.05, (now - motoRuntime.last) / 1000); motoRuntime.last = now; motoRuntime.progress += dt / 12; motoRuntime.lane += (motoRuntime.targetLane - motoRuntime.lane) * Math.min(1, dt * 8); motoRuntime.spawn += dt;
  if (motoRuntime.spawn > .75) { motoRuntime.spawn = 0; const kinds = motoRuntime.progress > .24 ? ['mud','crate','cone','coin','boost'] : ['crate','cone','coin','boost']; motoRuntime.obstacles.push({ lane: Math.floor(Math.random() * 3), z: 0, kind: kinds[Math.floor(Math.random() * kinds.length)], checked: false }); }
  motoRuntime.obstacles.forEach(obstacle => obstacle.z += dt * (.22 + state.moto.speed / 520));
  motoRuntime.obstacles = motoRuntime.obstacles.filter(obstacle => { if (obstacle.z > .83 && !obstacle.checked) handleMotoObstacle(obstacle); return obstacle.z < 1.08; });
  state.moto.place = motoPlace(state.moto); drawMotoFrame(); updateRaceHUD();
  if (motoRuntime.progress >= 1) finishRace(); else if (motoRuntime.running) motoRuntime.raf = requestAnimationFrame(motoLoop);
}
function handleMotoObstacle(obstacle) {
  obstacle.checked = true; const s = state.moto;
  const sameLane = Math.abs(Math.round(motoRuntime.lane) - obstacle.lane) < .5;
  if (obstacle.kind === 'coin') { if (sameLane) { s.trophies += 5; addLog(s.log, '<strong>COIN COLLECTED.</strong> +5 bonus trophies.'); showToast('+5 bonus trophies!'); } else addLog(s.log, '<strong>COIN MISSED.</strong> Switch lanes to collect it.'); return; }
  if (obstacle.kind === 'boost') { s.speed = Math.min(145, s.speed + 10); addLog(s.log, '<strong>BOOST TOKEN.</strong> Speed recharged.'); showToast('Speed token collected!'); return; }
  if (Math.abs(Math.round(motoRuntime.lane) - obstacle.lane) < .5) {
    if (s.shield > 0) { s.shield -= 1; addLog(s.log, '<strong>SHIELD POP.</strong> Obstacle ignored.'); showToast('Mud shield saved the run.'); }
    else { s.strikes += 1; s.speed = Math.max(25, s.speed - 22); addLog(s.log, `<strong>HIT.</strong> ${s.strikes}/3 strikes — slowed down.`); showToast(`${obstacle.kind === 'mud' ? 'Mud splash' : 'Obstacle hit'}!`); if (s.strikes >= 3) finishRace(); }
  } else addLog(s.log, '<strong>CLEAN PASS.</strong> You left the hazard in the dust.');
}
function drawMotoFrame(still = false) {
  const canvas = $('race-canvas'); if (!canvas) return; const rect = canvas.getBoundingClientRect(); const W = Math.max(320, rect.width || 700), H = Math.max(360, rect.height || 430), ratio = window.devicePixelRatio || 1;
  if (canvas.width !== Math.floor(W * ratio) || canvas.height !== Math.floor(H * ratio)) { canvas.width = Math.floor(W * ratio); canvas.height = Math.floor(H * ratio); }
  const ctx = canvas.getContext('2d'); ctx.setTransform(ratio, 0, 0, ratio, 0, 0); const horizon = H * .43, roadTop = horizon + 8, roadBottom = H + 10;
  const sky = ctx.createLinearGradient(0, 0, 0, horizon); sky.addColorStop(0, '#ffc6a5'); sky.addColorStop(.55, '#ff9d9a'); sky.addColorStop(1, '#ffdf9d'); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#fff0a8'; ctx.beginPath(); ctx.arc(W * .78, H * .2, 38, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.78)'; [[.13,.17,50],[.31,.29,34],[.57,.12,43]].forEach(([x,y,size]) => { ctx.beginPath(); ctx.arc(W*x, H*y, size*.22, 0, Math.PI*2); ctx.arc(W*x+size*.24, H*y-size*.09, size*.28, 0, Math.PI*2); ctx.arc(W*x+size*.5, H*y, size*.2, 0, Math.PI*2); ctx.fill(); });
  ctx.fillStyle = '#ef7190'; for (let i=0;i<13;i++) { const x = i * W/12 - 18; const h = 35 + ((i*29)%70); ctx.fillRect(x, horizon-h, 28 + (i%3)*8, h); ctx.fillStyle = i%2 ? '#c45eaa' : '#ef7190'; }
  ctx.fillStyle = '#5c5e9f'; ctx.beginPath(); ctx.moveTo(0, roadTop); ctx.lineTo(W*.13, horizon-44); ctx.lineTo(W*.28, horizon); ctx.lineTo(W*.48, horizon-58); ctx.lineTo(W*.7, horizon); ctx.lineTo(W*.86, horizon-38); ctx.lineTo(W, roadTop); ctx.lineTo(W, H); ctx.lineTo(0,H); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#4b4e77'; ctx.beginPath(); ctx.moveTo(W*.39, roadTop); ctx.lineTo(W*.61, roadTop); ctx.lineTo(W*.96, roadBottom); ctx.lineTo(W*.04, roadBottom); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#ffe08a'; ctx.lineWidth = 3; ctx.setLineDash([32,30]); for (let lane=1; lane<3; lane++) { const topX = W*.39 + lane * W*.11; const bottomX = W*.04 + lane * W*.46; ctx.beginPath(); ctx.moveTo(topX, roadTop); ctx.lineTo(bottomX, roadBottom); ctx.stroke(); } ctx.setLineDash([]);
  const laneXs = [W*.27,W*.5,W*.73]; motoRuntime.obstacles.forEach(obstacle => drawMotoObstacle(ctx, obstacle, laneXs, roadTop, roadBottom, W, H));
  updateBikeOverlay();
  if (still && !state.moto.raceActive) { ctx.fillStyle = 'rgba(20,24,55,.2)'; ctx.fillRect(0,0,W,H); }
}
function updateBikeOverlay() { const bike = $('bike-overlay'); if (bike) bike.style.left = `${[27,50,73][Math.max(0, Math.min(2, Math.round(motoRuntime.lane)))]}%`; }
function drawMotoObstacle(ctx, obstacle, laneXs, roadTop, roadBottom, W, H) { const z = obstacle.z, x = laneXs[obstacle.lane] + (obstacle.lane - 1) * z * W*.08, y = roadTop + z * (roadBottom - roadTop) * .96, size = 13 + z * 34; ctx.save(); ctx.translate(x,y); ctx.scale(.55 + z*.7, .55 + z*.7); if (obstacle.kind === 'mud') { ctx.fillStyle='#6b5a8b'; ctx.beginPath();ctx.ellipse(0,5,34,12,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#a98ac4';ctx.beginPath();ctx.arc(-12,0,7,0,Math.PI*2);ctx.arc(7,-3,9,0,Math.PI*2);ctx.fill(); } else if (obstacle.kind === 'crate') { ctx.fillStyle='#d66f58';ctx.fillRect(-18,-18,36,36);ctx.strokeStyle='#ffe08a';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-14,-14);ctx.lineTo(14,14);ctx.moveTo(14,-14);ctx.lineTo(-14,14);ctx.stroke(); } else if (obstacle.kind === 'cone') { ctx.fillStyle='#ff835f';ctx.beginPath();ctx.moveTo(0,-25);ctx.lineTo(22,20);ctx.lineTo(-22,20);ctx.closePath();ctx.fill();ctx.fillStyle='#fff1ad';ctx.fillRect(-14,0,28,6); } else if (obstacle.kind === 'coin') { ctx.fillStyle='#ffe377';ctx.beginPath();ctx.arc(0,0,19,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#c98f4c';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#6c5ba8';ctx.font='bold 18px monospace';ctx.textAlign='center';ctx.fillText('$',0,7); } else { ctx.fillStyle='#8ff0d2';ctx.beginPath();ctx.arc(0,0,22,0,Math.PI*2);ctx.fill();ctx.fillStyle='#315c81';ctx.font='bold 19px monospace';ctx.textAlign='center';ctx.fillText('⚡',0,7); } ctx.restore(); }
function drawMotoBike(ctx, x, y, scale, active) { ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale); ctx.fillStyle = 'rgba(19,28,63,.32)'; ctx.beginPath();ctx.ellipse(0,31,44,10,0,0,Math.PI*2);ctx.fill(); ctx.fillStyle='#1d2955';ctx.beginPath();ctx.arc(-18,19,12,0,Math.PI*2);ctx.arc(23,19,12,0,Math.PI*2);ctx.fill(); ctx.strokeStyle='#f05e79';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(-18,19);ctx.lineTo(0,-8);ctx.lineTo(23,19);ctx.moveTo(0,-8);ctx.lineTo(-18,19);ctx.stroke(); ctx.fillStyle='#ffd36d';ctx.beginPath();ctx.ellipse(2,-25,20,27,0,0,Math.PI*2);ctx.fill(); ctx.fillStyle='#7e70dd';ctx.fillRect(-15,-43,31,15); ctx.fillStyle='#efffff';ctx.fillRect(-8,-39,17,6); if (active) { ctx.strokeStyle='#ffe08a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-39,0);ctx.lineTo(-70,0);ctx.moveTo(-43,10);ctx.lineTo(-64,10);ctx.stroke(); } ctx.restore(); }

document.addEventListener('click', e => { if (e.target.closest('[data-reset-all]')) { localStorage.removeItem(saveKey); state = clone(defaultState); route(); } });
$('reset-game').addEventListener('click', () => { if (!currentGame) return; const map = { kingdoms:'kingdoms', 'dream-life':'dream', 'moto-rush':'moto' }; state[map[currentGame]] = clone(defaultState[map[currentGame]]); saveState(); renderGame(currentGame); showToast('Progress reset. Fresh start.'); });
$('sound-toggle').addEventListener('click', e => { const btn = e.currentTarget; btn.classList.toggle('muted'); btn.querySelector('span').textContent = btn.classList.contains('muted') ? 'Sound off' : 'Sound on'; showToast(btn.classList.contains('muted') ? 'Sound off.' : 'Sound on.'); });
window.addEventListener('hashchange', route); route();
