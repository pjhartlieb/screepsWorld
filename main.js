//FrontMatter
/* 
- wubbernaut (user)
- screepWorld
- main.js
- v0.0.1
- 12026.07.26
*/

// Load modules
// Export role.builder module and assign to variable
var roleBuilder = require('role.builder');

// Export role.upgrader module and assign to variable
var roleUpgrader = require('role.upgrader');

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
            
            // Call role.builder for each builder creep
            // Break out of switch when done
            case 'builder':
                roleBuilder.run(creep);
                break;
            
                // Call role.upgrader for each upgrader creep
            // Break out of switch when done
            case 'upgrader':
                roleUpgrader.run(creep);
                break;
            
                //
            // Future roles
            // case 'invader':
            //     roleInvader.run(creep);
            //     break;
        }
    }
};