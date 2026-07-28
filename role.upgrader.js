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

    // Add run property
    // The value of the run property is a function
    // The function accepts a creep object passed in from main
    run: function(creep) {

        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
            // Find the nearest reachable ruin that contains energy
            // FIND_RUINS may return ruins that are empty or contain other resources
            // The filter keeps only ruins containing energy
            var ruin = creep.pos.findClosestByPath(FIND_RUINS, {
                filter: function(ruin) {
                    return (
                        ruin.store.getUsedCapacity(RESOURCE_ENERGY) > 0
                    );
                }
            });

            // If an energy-containing ruin was found, withdraw energy from it
            if (ruin) {

                // Ruins contain stored energy, so use withdraw instead of harvest
                // If the ruin is too far away, move toward it
                if (
                    creep.withdraw(ruin, RESOURCE_ENERGY) ===
                    ERR_NOT_IN_RANGE
                ) {
                    creep.moveTo(ruin);
                }

                // This creep has been processed
                // Return to main so the next creep can be processed
                return;
            }

            // No usable ruin was found
            // Find the nearest normal energy source reachable by pathfinding
            var source = creep.pos.findClosestByPath(FIND_SOURCES);

            // Attempt to harvest from the source
            // If the source is too far away, move toward it
            if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }

            // This creep has been processed
            // Return to main so the next creep can be processed
            return;
        }

        // The creep is carrying energy
        // Upgrade the room controller
        if (
            creep.upgradeController(creep.room.controller) ===
            ERR_NOT_IN_RANGE
        ) {
            creep.moveTo(creep.room.controller);
        }
    }
};

module.exports = roleUpgrader;