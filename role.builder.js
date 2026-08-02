//FrontMatter
/* 
- wubbernaut (user)
- screepWorld
- role.builder.js
- v0.0.3
- 2026.08.02
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
        - Priority 2 is repairing damaged baseline infrastructure
        - Priority 3 is building construction sites
        - Priority 4 is repairing damaged walls
        - Priority 5 is upgrading the RC
*/

// Create variable object
// The variable holds all functions and data for the builder role

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
    // Repair damaged infrastructure recorded in the baseline work queue.

    // Check whether infrastructure memory exists
    // Check whether infrastructure memory exists for the creep's current room
    var infrastructureRoomMemory =
      Memory.infrastructure &&
      Memory.infrastructure.rooms &&
      Memory.infrastructure.rooms[creep.room.name];

    // Check whether the room has an infrastructure work queue
    if (
      infrastructureRoomMemory &&
      infrastructureRoomMemory.workQueue
    ) {

      // Find the first repair job in the work queue
      // find() returns the first matching job
      // If no repair job exists, it returns undefined
      var repairJob =
        infrastructureRoomMemory.workQueue.find(
          function(job) {

            // Return true when the job action is repair
            return job.action === 'repair';
          }
        );

      // Check whether a repair job was found
      if (repairJob) {

        // Retrieve the live structure object using the stored structure ID
        var repairTarget =
          Game.getObjectById(repairJob.structureId);

        // Check whether the structure still exists
        if (repairTarget) {

          // Check whether the structure is still below its repair target
          if (repairTarget.hits < repairJob.targetHits) {

            // Attempt to repair the damaged structure
            var repairResult =
              creep.repair(repairTarget);

            // If the structure is outside repair range, move toward it
            if (repairResult === ERR_NOT_IN_RANGE) {
              creep.moveTo(repairTarget);
            }

            // Stop processing lower-priority work this tick
            return;
          }
        }
      }
    }

    // WORKING PRIORITY 3:
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

    // WORKING PRIORITY 4:
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

    // WORKING PRIORITY 5:
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