//FrontMatter
/* 
- wubbernaut (user)
- screepWorld
- role.builder.js
- v0.0.2
- 2026.07.26
*/

// LOGIC and FLOW
/* Check how much energy the creep is carrying
    If it is not carrying
        - First check for ruins.
        - If ruins are found, extract energy
        - If ruins are not found, find nearest normal energy source
        - Extract energy
    If it IS carrying energy
        - Priority 1 is refilling spawns and extensions
        - Priority 2 is building construction sites
        - Priority 3 is upgrading the RC
*/

// Create variable object
// The variable holds all functions and data for the harvester role

var roleBuilder = {

  run: function(creep) {

    // The conditionals below ensure that the creep:
    // - FILLS entirely before working
    // - DRAINS entirely before gathering
    // Switch from working to gathering when empty
    if (
      creep.memory.working &&
      creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0
    ) {
      creep.memory.working = false;
    }

    // Switch from gathering to working when full.
    if (
      !creep.memory.working &&
      creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0
    ) {
      creep.memory.working = true;
    }

    // GATHERING
    if (!creep.memory.working) {

      var ruin = creep.pos.findClosestByPath(FIND_RUINS, {
        filter: function(ruin) {
          return (
            ruin.store.getUsedCapacity(RESOURCE_ENERGY) > 0
          );
        }
      });

      if (ruin) {
        if (
          creep.withdraw(ruin, RESOURCE_ENERGY) ===
          ERR_NOT_IN_RANGE
        ) {
          creep.moveTo(ruin);
        }

        return;
      }

      var source = creep.pos.findClosestByPath(FIND_SOURCES);

      if (source) {
        if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
          creep.moveTo(source);
        }
      }

      return;
    }

    // WORKING PRIORITY 1:
    // Refill Spawns and Extensions.
    var energyStructure = creep.pos.findClosestByPath(
      FIND_MY_STRUCTURES,
      {
        filter: function(structure) {
          return (
            (
              structure.structureType === STRUCTURE_SPAWN ||
              structure.structureType === STRUCTURE_EXTENSION
            ) &&
            structure.store.getFreeCapacity(
              RESOURCE_ENERGY
            ) > 0
          );
        }
      }
    );

    if (energyStructure) {
      if (
        creep.transfer(
          energyStructure,
          RESOURCE_ENERGY
        ) === ERR_NOT_IN_RANGE
      ) {
        creep.moveTo(energyStructure);
      }

      return;
    }

    // WORKING PRIORITY 2:
    // Build construction sites.
    var site = creep.pos.findClosestByPath(
      FIND_CONSTRUCTION_SITES
    );

    if (site) {
      if (creep.build(site) === ERR_NOT_IN_RANGE) {
        creep.moveTo(site);
      }

      return;
    }

    // WORKING PRIORITY 3:
    // Repair damaged walls.
    var wall = creep.pos.findClosestByPath(
      FIND_STRUCTURES,
      {
        filter: function(structure) {
          return (
            structure.structureType === STRUCTURE_WALL &&
            structure.hits < structure.hitsMax
          );
        }
      }
    );

    if (wall) {
      if (creep.repair(wall) === ERR_NOT_IN_RANGE) {
        creep.moveTo(wall);
      }

      return;
    }

    // WORKING PRIORITY 4:
    // Upgrade when nothing else needs doing.
    if (
      creep.upgradeController(creep.room.controller) ===
      ERR_NOT_IN_RANGE
    ) {
      creep.moveTo(creep.room.controller);
    }
  }
};

module.exports = roleBuilder;