//FrontMatter
/* 
- wubbernaut (user)
- screepWorld
- role.upgrader.js
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
        - Upgrade the RC
*/

// Create variable object
// The variable holds all functions and data for the upgrader role

var roleUpgrader = {

  run: function(creep) {

    // Switch from upgrading to gathering when empty.
    if (
      creep.memory.working &&
      creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0
    ) {
      creep.memory.working = false;
    }

    // Switch from gathering to upgrading when full.
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

    // UPGRADING
    if (
      creep.upgradeController(creep.room.controller) ===
      ERR_NOT_IN_RANGE
    ) {
      creep.moveTo(creep.room.controller);
    }
  }
};

module.exports = roleUpgrader;