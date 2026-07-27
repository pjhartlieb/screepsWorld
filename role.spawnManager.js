// Define queue
// List of dictionaries
// Each dictionary contains details for a specific role
const spawnQueue = [
    {
        role: 'harvester',
        minimum: 10,
        priority: 1,
        body: [WORK, CARRY, MOVE]
    }
];

// Count and return the number of active creeps
// Function accepts "role" as an argument
// Then retrieves, filter, and counts creeps for a specific role
function countCreeps(role) {
    return Object.values(Game.creeps).filter(
        creep => creep.memory.role === role
    ).length;
}

// 
function run() {
    // Highest-priority roles are checked first.
    // Spawn creeps if the minimum number do not exist
    
    // Sort the queue based on priority
    const sortedQueue = spawnQueue.sort(
        (a, b) => a.priority - b.priority
    );
    
    // Loop of all in-game spawns
    // If the spawn is already spawning a creep, leave it and go to the next spawn
    for (const spawn of Object.values(Game.spawns)) {
        if (spawn.spawning) {
            continue;
        }
        
        // Loop over each object in the sortedQueue (request)
        // For each object:
        // Extract the role from "request"
        // Count the number of creeps with that role in game (currentCount)
        for (const request of sortedQueue) {
            const currentCount = countCreeps(request.role);
        
        // If the currentCount is greater than the minimum required go to the next request in sortedQueue    
            if (currentCount >= request.minimum) {
                continue;
            }
        
        // Create a unique name for the creep to be spawned
            const name = `${request.role}-${Game.time}`;
        
        // Spawn creep using name and the body parts specified in request.body
        // Create memory for new creep. Assign 2 variables for role: and working:
            const result = spawn.spawnCreep(
                request.body,
                name,
                {
                    memory: {
                        role: request.role,
                        working: false
                    }
                }
            );
        
        // Check for result and print unexpected errors (~= ERR_NOT_ENOUGH_ENERGY)
            if (result === OK) {
                console.log(
                    `${spawn.name} is spawning ${name} ` +
                    `(${currentCount + 1}/${request.minimum})`
                );
            } else if (result !== ERR_NOT_ENOUGH_ENERGY) {
                console.log(
                    `${spawn.name} failed to spawn ${name}: ${result}`
                );
            }

            // A spawn can only start one creep per tick.
            // Exit the loop immediately
            break;
        }
    }
}

module.exports = {
    run
};