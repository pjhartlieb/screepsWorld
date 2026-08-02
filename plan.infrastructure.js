// LOGIC and FLOW
/* 
# Overview
This module will establish, maintain, and update a baseline file for infrastructure in the game.

# Establish Baseline
Examine infrastructure and create baseline file:
1. The player will have manually built and placed roads, extensions, walls, and ramparts.
2. The player will then decide that the infrastructure needs to be placed in maintentance mode.
3. The player will then call this module to establish the baseline.
4. To establkish the baseline, this module will:
    1. MAP: "learn/identify/map" ALL existing infrasteructure.
    2. CREATE BASELINE FILE: Coordinates and terrain/type/feature will be saved to a file.

# Verify Baseline
For each data point in the baseline file:
    - Check whether the infrastructure still exists at the saved coordinates.
    - Check whether the structure at those coordinates has the correct structure type.
    - If the expected structure exists and is above its repair target, mark it as OK.
    - If the expected structure exists but is below its repair target, mark it as DAMAGED.
    - If the expected structure does not exist, mark it as MISSING.
    - Save damaged and missing structures in a temporary work queue.
    - Do not rebuild or repair anything directly in this module.

# Maintain Baseline
For each data point in the baseline file:
        - Check to see if the infrastructure still exists.
        - If it DOES NOT exist, place a contruction site and mark it for repair/rebuild and marshall builder creeps. Rebuild EXACTLY what was there before
        - If it DOES exist BUT AND is below a specific HP, mark it for repair and marshall builder creeps.
        - If it DOES exist AND is above a specific HP, do nothing.

# Update Baseline
There needs to be a way for the user to remove/add data points to the baseline file. 
    - If the user "destroys" a structure, they should be able to remove it from the baseline file.
    - If the user "builds" a structure, they should be able to add it to the baseline file.
    - AFTER the baseline is initially established, the "update" baseline function needs to be called before the "maintain" baseline function.
*/

//FrontMatter
/*
- wubbernaut (user)
- screepWorld
- plan.infrastructure.js
- v0.0.4
- 2026.08.02
*/

/*
# Overview

This module establishes, verifies, updates, and maintains a baseline
of infrastructure for an owned room.

The baseline is stored in:

Memory.infrastructure.rooms[roomName].structures

Temporary infrastructure work is stored in:

Memory.infrastructure.rooms[roomName].workQueue
*/

// Create variable
var planInfrastructure = {

  /*
   * Main entry point.
   *
   * For now, this initializes the required Memory objects.
   * It also verifies the baseline if the baseline has already been established.
   * We will add maintenance behavior later.
   */
  
  // Create run property
  // The value of the run property is a function that takes a roomName as an argument
  run: function(roomName) {

    // Call the initializeMemory function defined as the value for the initializeMemory property below.
    this.initializeMemory(roomName);

    // Check whether a baseline has already been established for this room
    if (Memory.infrastructure.rooms[roomName].established) {

      // Call the verifyBaseline function defined below
      // This compares the saved baseline against the current room
      this.verifyBaseline(roomName);
    }

    // Does not call establishBaseline automatically.
    // Baseline is only be established when the user decides the room is ready.
    // When ready make the call below in the console to create bassline: 
    // require('plan.infrastructure').establishBaseline('E53S19')
  },

  /*
   * Create the Memory structure used by this module.
   */

  // Create initializeMemory property
  // The value of the initializeMemory property is a function that takes a roomName as an argument  
  initializeMemory: function(roomName) {

    if (!Memory.infrastructure) {
    // Create an "infrastructure" property for the "Memory" object
      Memory.infrastructure = {};
    }

    if (!Memory.infrastructure.rooms) {
    // Create a "rooms" property for the "Memory.infrastructure" object
    // This initializes the rooms object as an empty dictionary
      Memory.infrastructure.rooms = {};
    }

    if (!Memory.infrastructure.rooms[roomName]) {
    // Create a room entry for the room in the rooms dictionary
    // roomName is the key for the room entry
      Memory.infrastructure.rooms[roomName] = {
        established: false,
        establishedAt: null,
        updatedAt: null,
        verifiedAt: null,
        structures: [],
        workQueue: []
      };

      console.log(
        'Infrastructure memory initialized for room ' +
        roomName
      );
    }

    // Check whether verifiedAt exists in older room memory
    // This allows memory created by an earlier version of the module to be upgraded
    if (
      Memory.infrastructure.rooms[roomName].verifiedAt ===
      undefined
    ) {

      // Add the verifiedAt property without replacing the existing baseline
      Memory.infrastructure.rooms[roomName].verifiedAt =
        null;
    }

    // Check whether workQueue exists in older room memory
    // This allows memory created by an earlier version of the module to be upgraded
    if (
      !Memory.infrastructure.rooms[roomName].workQueue
    ) {

      // Create an empty temporary work queue
      Memory.infrastructure.rooms[roomName].workQueue =
        [];
    }
  },

  /*
   * Examine the room and create the initial infrastructure baseline.
   */

  // Create establishBaseline property
  // The value of the establishBaseline property is a function that takes a roomName as an argument
  // This is called MANUALLY when the user is ready to establish the baseline
  establishBaseline: function(roomName) {

    // Call initializeMemory before accessing infrastructure memory
    // This ensures that all required Memory objects exist
    this.initializeMemory(roomName);

    // Get the room object from the built-in Game.rooms object
    // roomName is used as the key for the Game.rooms dictionary
    var room = Game.rooms[roomName];

    // Check whether the room object exists
    // A room may not exist in Game.rooms if the player does not currently have visibility
    if (!room) {

      // Print an error message to the Screeps console
      console.log(
        'Cannot establish infrastructure baseline. Room not visible: ' +
        roomName
      );

      // Stop this function
      // Do not continue because the room cannot be scanned
      return;
    }

    // Find all completed structures in the room
    // FIND_STRUCTURES includes both owned and unowned structures
    // This is an ARRAY with every structure in the room
    var allStructures = room.find(FIND_STRUCTURES);

    // For each structure in allStructures array, apply the filter() builtin
    // Keep only roads, extensions, walls, and ramparts
    var trackedStructures = allStructures.filter(function(structure) {

      // Return true if the current structure is one of the tracked structure types
      return (
        structure.structureType === STRUCTURE_ROAD ||
        structure.structureType === STRUCTURE_EXTENSION ||
        structure.structureType === STRUCTURE_WALL ||
        structure.structureType === STRUCTURE_RAMPART
      );
    });

    // Convert each structure object into a smaller baseline data object
    // For each structure in allStructures array, apply the map() builtin
    // map() creates a new array by processing each entry in trackedStructures
    var baselineStructures = trackedStructures.map(function(structure) {

      // Return a plain object containing the information needed for the baseline
      return {

        // Save the structure's X coordinate
        x: structure.pos.x,

        // Save the structure's Y coordinate
        y: structure.pos.y,

        // Save the structure type
        // Examples: road, extension, constructedWall, rampart
        structureType: structure.structureType,

        // Save the terrain value at the structure's coordinates
        // Screeps terrain values are numeric constants
        terrain: room.getTerrain().get(
          structure.pos.x,
          structure.pos.y
        )
      };
    });

    // Save the new baseline structure array into Memory
    Memory.infrastructure.rooms[roomName].structures =
      baselineStructures;

    // Clear any old temporary work queue entries
    // A newly established baseline represents the room's current state
    Memory.infrastructure.rooms[roomName].workQueue =
      [];

    // Mark the room baseline as established
    Memory.infrastructure.rooms[roomName].established =
      true;

    // Save the game tick when the baseline was established
    Memory.infrastructure.rooms[roomName].establishedAt =
      Game.time;

    // Save the game tick when the baseline was last updated
    // At initial creation, establishedAt and updatedAt are the same
    Memory.infrastructure.rooms[roomName].updatedAt =
      Game.time;

    // The baseline has not yet been verified after establishment
    Memory.infrastructure.rooms[roomName].verifiedAt =
      null;

    // Print a confirmation message to the Screeps console
    console.log(
      'Infrastructure baseline established for room ' +
      roomName +
      '. Structures recorded: ' +
      baselineStructures.length
    );
  },

  /*
   * Compare the saved baseline against the current room.
   *
   * This function identifies missing and damaged infrastructure.
   * It does not create construction sites or directly control builders yet.
   */

  // Create verifyBaseline property
  // The value of the verifyBaseline property is a function that takes a roomName as an argument
  verifyBaseline: function(roomName) {

    // Call initializeMemory before accessing infrastructure memory
    // This ensures that all required Memory objects exist
    this.initializeMemory(roomName);

    // Get the infrastructure memory entry for the current room
    // This makes later references shorter and easier to read
    var roomMemory =
      Memory.infrastructure.rooms[roomName];

    // Check whether a baseline has been established
    if (!roomMemory.established) {

      // Print an error message because there is no baseline to verify
      console.log(
        'Cannot verify infrastructure baseline. ' +
        'No baseline has been established for room ' +
        roomName
      );

      // Stop this function
      return;
    }

    // Get the room object from the built-in Game.rooms object
    var room = Game.rooms[roomName];

    // Check whether the room is currently visible
    if (!room) {

      // Print an error message to the Screeps console
      console.log(
        'Cannot verify infrastructure baseline. Room not visible: ' +
        roomName
      );

      // Stop this function
      return;
    }

    // Create a new empty work queue
    // This removes temporary results from the previous verification
    var newWorkQueue = [];

    // Create counters for the verification summary
    var okCount = 0;
    var damagedCount = 0;
    var missingCount = 0;

    // Loop through every structure record in the saved baseline
    roomMemory.structures.forEach(function(baselineStructure) {

      // Look at the exact X and Y coordinates saved in the baseline
      // LOOK_STRUCTURES returns an array because more than one structure
      // can exist on the same room position
      var structuresAtPosition = room.lookForAt(
        LOOK_STRUCTURES,
        baselineStructure.x,
        baselineStructure.y
      );

      // Search the structures at this position for the expected structure type
      // find() returns the matching structure object
      // If no match is found, find() returns undefined
      var matchingStructure =
        structuresAtPosition.find(function(structure) {

          // Return true when the live structure type matches the baseline type
          return (
            structure.structureType ===
            baselineStructure.structureType
          );
        });

      // Check whether the expected structure was found
      if (matchingStructure) {

        // Create a variable containing the HP level to which
        // the matching structure should be repaired
        var targetHits = matchingStructure.hitsMax;

        // Walls and ramparts have extremely large maximum HP values
        // Do not try to repair them all the way to their full hitsMax value
        if (
          matchingStructure.structureType === STRUCTURE_WALL ||
          matchingStructure.structureType === STRUCTURE_RAMPART
        ) {

          // Set the current wall and rampart repair target to 10,000 HP
          targetHits = 10000;
        }

        // Check whether the matching structure is below its repair target
        if (matchingStructure.hits < targetHits) {

          // Increase the number of damaged structures
          damagedCount++;

          // Add a temporary repair job to the new work queue
          newWorkQueue.push({

            // The type of infrastructure work that is needed
            action: 'repair',

            // The current status of this work item
            status: 'damaged',

            // Save the live structure ID
            // A builder can use this ID with Game.getObjectById()
            structureId: matchingStructure.id,

            // Save the expected structure type
            structureType:
              baselineStructure.structureType,

            // Save the expected X coordinate
            x: baselineStructure.x,

            // Save the expected Y coordinate
            y: baselineStructure.y,

            // Save the structure's current HP
            currentHits: matchingStructure.hits,

            // Save the HP level to which the structure should be repaired
            targetHits: targetHits,

            // Save the game tick when the damage was detected
            detectedAt: Game.time
          });

          // Print a damaged message to the Screeps console
          console.log(
            'DAMAGED: ' +
            baselineStructure.structureType +
            ' at (' +
            baselineStructure.x +
            ',' +
            baselineStructure.y +
            ') HP: ' +
            matchingStructure.hits +
            '/' +
            targetHits
          );

        } else {

          // Increase the number of structures that passed verification
          okCount++;

          // Print an OK message to the Screeps console
          console.log(
            'OK: ' +
            baselineStructure.structureType +
            ' at (' +
            baselineStructure.x +
            ',' +
            baselineStructure.y +
            ')'
          );
        }

      } else {

        // Increase the number of missing structures
        missingCount++;

        // Add a temporary rebuild job to the new work queue
        newWorkQueue.push({

          // The type of infrastructure work that is needed
          action: 'rebuild',

          // The current status of this work item
          status: 'missing',

          // Save the expected structure type
          structureType:
            baselineStructure.structureType,

          // Save the expected X coordinate
          x: baselineStructure.x,

          // Save the expected Y coordinate
          y: baselineStructure.y,

          // Save the game tick when the missing structure was detected
          detectedAt: Game.time
        });

        // Print a missing message to the Screeps console
        console.log(
          'MISSING: ' +
          baselineStructure.structureType +
          ' at (' +
          baselineStructure.x +
          ',' +
          baselineStructure.y +
          ')'
        );
      }
    });

    // Replace the previous temporary work queue with the new verification results
    roomMemory.workQueue =
      newWorkQueue;

    // Save the game tick when verification was completed
    roomMemory.verifiedAt =
      Game.time;

    // Print a verification summary to the Screeps console
    console.log(
      'Infrastructure verification completed for room ' +
      roomName +
      '. OK: ' +
      okCount +
      '. Damaged: ' +
      damagedCount +
      '. Missing: ' +
      missingCount +
      '.'
    );
  }
};

module.exports = planInfrastructure;