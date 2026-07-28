\\ create creep
Game.spawns['Spawn1'].spawnCreep( [WORK, CARRY, MOVE], 'Harvester1' );

\\ build road from spawn to RC
var s = Object.values(Game.spawns)[0]; s.pos.findPathTo(s.room.controller).forEach(step => s.room.createConstructionSite(step.x, step.y, STRUCTURE_ROAD));
