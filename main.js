//FrontMatter
/* 
- wubbernaut (user)
- screepWorld
- main.js
- v0.0.1
- 12026.07.26
*/

// Load modules
// Export role.harvester module and assign to variable
var roleHarvester = require('role.harvester');

// Export role.spawnManager module and assign to variable
var spawnManager = require('role.spawnManager');

// Runs once every game tick
module.exports.loop = function () {

    // Remove memory belonging to dead creeps
    // If a creep object does not exist in game, delete the memory
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }

    // Decide if new creeps need to be spawned
    // Call "run" attribute for the variable spawnManager
    spawnManager.run();

    // Run each living creep
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];

        switch (creep.memory.role) {
            
            // Call role.harvester for each harvester creep
            // Break out of switch when done
            case 'harvester':
                roleHarvester.run(creep);
                break;

            // Future roles
            // case 'builder':
            //     roleBuilder.run(creep);
            //     break;
            //
            // case 'upgrader':
            //     roleUpgrader.run(creep);
            //     break;
        }
    }
};