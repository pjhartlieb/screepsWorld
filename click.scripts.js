// create creep
Game.spawns['Spawn1'].spawnCreep( [WORK, CARRY, MOVE], 'Harvester1' );

// build road from spawn to RC
var s = Object.values(Game.spawns)[0]; s.pos.findPathTo(s.room.controller).forEach(step => s.room.createConstructionSite(step.x, step.y, STRUCTURE_ROAD));

// display creeps by role
for (const [role, count] of Object.entries(_.countBy(Game.creeps, c => c.memory.role))) console.log(role + ": " + count);

// display working versus gathering creeps
Object.values(Game.creeps).forEach(c =>
    console.log(
        `${c.name.padEnd(12)} ${c.memory.role.padEnd(10)} ${c.memory.working ? "Working" : "Gathering"}  ${c.store[RESOURCE_ENERGY]}/${c.store.getCapacity()}`
    )
);

// build road from power source to RC
var r = Object.values(Game.rooms)[0]; r.find(FIND_SOURCES)[0].pos.findPathTo(r.controller).forEach(step => r.createConstructionSite(step.x, step.y, STRUCTURE_ROAD));

// delete a construction site at (x,y)
Object.values(Game.constructionSites).find(s => s.pos.x === X && s.pos.y === Y)?.remove();

// build road from spawn to mineral site
var s=Object.values(Game.spawns)[0],m=s.room.find(FIND_MINERALS)[0];s.pos.findPathTo(m).forEach(p=>s.room.createConstructionSite(p.x,p.y,STRUCTURE_ROAD))

// show energy sources
Game.rooms["E43S22"].find(FIND_SOURCES).map(s => `(${s.pos.x},${s.pos.y}) Energy:${s.energy}/${s.energyCapacity}`)

// view shard
Game.shard.name