//FrontMatter
/* 
- wubbernaut (user)
- screepWorld
- role.harvester.js
- v0.0.1
- 12026.07.26
*/

// LOGIC and FLOW
/* Check how much energy the creep is carrying
    If it is not carrying
        - First check for ruins.
        - If ruins are found, extract energy
        - If ruins are not found, find nearest normal energy source
        - Extract energy
    If it IS carrying energy
        - Find the nearest construction site and build
        - If no construction site are found, find and upgrade the RC
*/

// Create variable object
// The variable holds all functions and data for the harvester role

var roleHarvester = {

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
        // Find the nearest reachable construction site
        var site = creep.pos.findClosestByPath(
            FIND_CONSTRUCTION_SITES
        );

        // If a construction site was found, attempt to build it
        if (site) {

            // If the site is too far away, move toward it
            if (creep.build(site) === ERR_NOT_IN_RANGE) {
                creep.moveTo(site);
            }

            // This creep has been processed
            // Return to main so the next creep can be processed
            return;
        }

        // This code executes when the creep has energy
        // but there are no construction sites
        // Attempt to upgrade the room controller
        if (
            creep.upgradeController(creep.room.controller) ===
            ERR_NOT_IN_RANGE
        ) {
            creep.moveTo(creep.room.controller);
        }
    }
};

module.exports = roleHarvester;