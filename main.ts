//  MINECRAFT MAZES v1.0
//  Copyright 2021, David Bailey / Crux
//  Looking for instructions or more info? Try here:                    
//  https://github.com/crux888/minecraft-mazes-makecode  
//  Do you want your mazes to look different?
//  If so, then try changing these values...
let maze_blocks = DIAMOND_BLOCK
let tower_blocks = STONE_BRICKS
let pyramid_blocks = CHISELED_SANDSTONE
let diamond_blocks = GOLD_BLOCK
let add_torches = true
let solve_maze = true
let wall_height = 2
//  Hmmm, I wouldn't recommend changing any of these values though...
//  They're global constants and variables used throughout the code
let maze_type = ""
let maze_rows = 0
let maze_columns = 0
let maze_layers = 0
let player_position : Position = null
let maze_position : Position = null
let entrance_position : Position = null
let exit_position : Position = null
let robot_position : Position = null
let robot_orientation = ""
let maze_solve_path : string[] = []
let blocks_used = 0
let torches_used = 0
let wall_blocks = 0
let time_start = 0
let current_layer = 0
let middle_layer = 0
let x_offset = 0
let z_offset = 0
let searched_steps = 0
let solution_steps = 0
let path_block = LIME_CARPET
let maximum_maze_rows_columns = 25
let maximum_maze_layers = 10
let minimum_maze_rows_columns = 3
let minimum_maze_layers = 3
// ##############
//  SIMPLE MAZE #
// ##############
player.onChat("maze", function on_on_chat(rows: number, columns: number) {
    //  Define global variables
    
    //  Set global variables for this type of maze
    maze_type = "maze"
    maze_rows = rows
    maze_columns = columns
    maze_layers = 1
    //  Run the main loop to build and solve the maze
    mainLoop()
})
// #############
//  TOWER MAZE #
// #############
player.onChat("tower", function on_on_chat2(rows: number, columns: number, layers: number) {
    //  Define global variables
    
    //  Set global variables for this type of maze
    maze_type = "tower"
    maze_rows = rows
    maze_columns = columns
    maze_layers = layers
    //  Run the main loop to build and solve the maze
    mainLoop()
})
// ###############
//  PYRAMID MAZE #
// ###############
player.onChat("pyramid", function on_on_chat3(layers: number) {
    //  Define global variables
    
    //  Set global variables for this type of maze
    maze_type = "pyramid"
    maze_layers = layers
    //  Run the main loop to build and solve the maze
    mainLoop()
})
// ###############
//  DIAMOND MAZE #
// ###############
player.onChat("diamond", function on_on_chat4(layers: number) {
    //  Define global variables
    
    //  Set global variables for this type of maze
    maze_type = "diamond"
    maze_layers = layers
    //  Run the main loop to build and solve the maze
    mainLoop()
})
// ############
//  MAIN LOOP #
// ############
function mainLoop() {
    //  Define global variables
    
    //  Initialise maze variables
    initialiseMazeVariables()
    //  Draw a foundation layer underneath the maze
    drawMazeFoundations()
    //  Build the maze layers
    current_layer = maze_layers
    for (let index = 0; index < maze_layers; index++) {
        if (maze_type == "pyramid") {
            //  Set maze_rows and maze_columns for a pyramid maze
            maze_rows = current_layer * 2 + 1
            maze_columns = maze_rows
        } else if (maze_type == "diamond") {
            //  Set maze_rows and maze_columns for a diamond maze
            if (current_layer >= middle_layer) {
                maze_rows = (maze_layers - current_layer + 1) * 2 + 1
            } else {
                maze_rows = (maze_layers - middle_layer + 1) * 2 + 1 - (middle_layer - current_layer) * 2
            }
            
            maze_columns = maze_rows
        }
        
        //  Draw the maze grid
        drawMazeGrid()
        //  Build the maze, dude
        buildMaze()
        //  Add a roof for tower, pyramid, or diamond mazes
        if (["tower", "pyramid", "diamond"].indexOf(maze_type) >= 0) {
            drawMazeRoof()
        }
        
        current_layer -= 1
    }
    //  Draw the maze doors
    drawMazeDoors()
    //  Show the maze information
    showMazeInfo()
    //  Solve the maze, babe
    if (solve_maze) {
        solveMaze()
    }
    
}

function initialiseMazeVariables() {
    //  Define global variables
    
    
    
    //  Check if the maze needs resizing
    checkMazeSize()
    //  Set additional variables for diamond mazes
    if (maze_type == "diamond") {
        maze_rows = 3
        maze_columns = 3
        middle_layer = Math.ceil(maze_layers / 2)
    }
    
    //  Display a status message
    if (maze_type == "maze") {
        player.say("Creating maze...")
    } else {
        player.say("Creating " + maze_type + " maze...")
    }
    
    //  Save the original position of the player in case they move while the maze is being built
    player_position = player.position()
    //  Set the corner position of the maze so that the player will be facing the entrance/exit
    if (maze_type == "pyramid") {
        maze_position = positions.add(player_position, pos(maze_layers * -2, 0, 3))
    } else {
        maze_position = positions.add(player_position, pos((Math.ceil(maze_columns / 2) - 1) * -2, 0, 3))
    }
    
    //  Check if the maze_blocks variable needs updating for tower, pyramid, or diamond mazes
    if (maze_type == "tower") {
        wall_blocks = tower_blocks
    } else if (maze_type == "pyramid") {
        wall_blocks = pyramid_blocks
    } else if (maze_type == "diamond") {
        wall_blocks = diamond_blocks
    } else {
        wall_blocks = maze_blocks
    }
    
    //  Reset maze counters and timer
    blocks_used = 0
    torches_used = 0
    time_start = gameplay.timeQuery(GAME_TIME)
}

function checkMazeSize() {
    //  Define global variables
    
    //  Set the message flag to false
    let show_resize_message = false
    //  Check maze_rows and maze_columns
    if (["maze", "tower"].indexOf(maze_type) >= 0) {
        if (maze_rows < minimum_maze_rows_columns) {
            maze_rows = minimum_maze_rows_columns
            show_resize_message = true
        } else if (maze_rows > maximum_maze_rows_columns) {
            maze_rows = maximum_maze_rows_columns
            show_resize_message = true
        }
        
        if (maze_columns < minimum_maze_rows_columns) {
            maze_columns = minimum_maze_rows_columns
            show_resize_message = true
        } else if (maze_columns > maximum_maze_rows_columns) {
            maze_columns = maximum_maze_rows_columns
            show_resize_message = true
        }
        
    }
    
    //  Check maze_layers
    if (["tower", "pyramid", "diamond"].indexOf(maze_type) >= 0) {
        if (maze_layers < minimum_maze_layers) {
            maze_layers = minimum_maze_layers
            show_resize_message = true
        } else if (maze_layers > maximum_maze_layers) {
            maze_layers = maximum_maze_layers
            show_resize_message = true
        }
        
    }
    
    //  Make sure that maze_layers is an odd number for diamond mazes
    if (maze_type == "diamond") {
        if (Math.round(maze_layers / 2) == maze_layers / 2) {
            maze_layers += 1
            show_resize_message = true
        }
        
    }
    
    //  Check wall_height
    if (wall_height < 2) {
        if (maze_type == "maze") {
            wall_height = 1
            add_torches = false
        } else {
            wall_height = 2
        }
        
    }
    
    //  Display a status message if the maze has been resized
    if (show_resize_message) {
        if (maze_type == "maze") {
            player.say("Resized maze (" + ("" + maze_rows) + " x " + ("" + maze_columns) + ")")
        } else if (maze_type == "tower") {
            player.say("Resized tower maze (" + ("" + maze_rows) + " x " + ("" + maze_columns) + " x " + ("" + maze_layers) + ")")
        } else if (["pyramid", "diamond"].indexOf(maze_type) >= 0) {
            player.say("Resized " + maze_type + " maze (" + ("" + maze_layers) + " layers)")
        }
        
    }
    
}

function drawMazeFoundations() {
    //  Define global variables
    
    //  Check if maze_rows and maze_columns need calculating for a pyramid or diamond maze_columns
    if (maze_type == "pyramid") {
        maze_rows = maze_layers * 2 + 1
        maze_columns = maze_layers * 2 + 1
    } else if (maze_type == "diamond") {
        maze_rows = 3
        maze_columns = 3
    }
    
    //  Draw a foundation layer underneath the maze
    blocks.fill(wall_blocks, positions.add(maze_position, pos(-1, -1, -1)), positions.add(maze_position, pos(maze_columns * 2 - 1, -1, maze_rows * 2 - 1)), FillOperation.Replace)
    //  Update the blocks_used variable based on the size of the foundation layer
    blocks_used += (maze_rows * 2 + 1) * (maze_columns * 2 + 1)
}

function drawMazeGrid() {
    let index: number;
    //  Define global variables
    
    //  Initialise local variables/constants
    let x_coordinate = maze_position.getValue(Axis.X) - 1
    let y_coordinate = maze_position.getValue(Axis.Y)
    let z_coordinate = maze_position.getValue(Axis.Z) - 1
    //  Clear space for the maze by filling the area with air
    blocks.fill(AIR, world(x_coordinate, y_coordinate, z_coordinate), world(x_coordinate + maze_columns * 2, y_coordinate + wall_height - 1, z_coordinate + maze_rows * 2), FillOperation.Replace)
    //  Draw the maze rows
    let line_length = maze_columns * 2
    for (index = 0; index < maze_rows + 1; index++) {
        blocks.fill(wall_blocks, world(x_coordinate, y_coordinate, z_coordinate), world(x_coordinate + line_length, y_coordinate + wall_height - 1, z_coordinate), FillOperation.Replace)
        z_coordinate += 2
    }
    //  Draw the maze columns
    line_length = maze_rows * 2
    z_coordinate = maze_position.getValue(Axis.Z) - 1
    for (index = 0; index < maze_columns + 1; index++) {
        blocks.fill(wall_blocks, world(x_coordinate, y_coordinate, z_coordinate), world(x_coordinate, y_coordinate + wall_height - 1, z_coordinate + line_length), FillOperation.Replace)
        x_coordinate += 2
    }
    //  Update the blocks_used variable based on the size of maze grid
    blocks_used += ((maze_rows + 1) * (maze_columns * 2 + 1) + maze_columns * (maze_rows + 1)) * wall_height
}

function buildMaze() {
    let x_offset: number;
    let z_offset: number;
    //  Define global variables
    
    //  Intialise local variables
    let unvisited_neighbours : string[] = []
    let current_cell_row = 0
    let current_cell_column = 0
    let current_cell_position_in_list = 0
    let connection_direction = ""
    let x_coordinate = 0
    let y_coordinate = 0
    let z_coordinate = 0
    //  Create a list of unvisited cells
    let cell_unvisited : number[] = []
    for (let index = 0; index < maze_rows * maze_columns; index++) {
        cell_unvisited.push(1)
    }
    //  Create the empty stack
    let stack_rows : number[] = []
    let stack_columns : number[] = []
    //  Add a random cell to the top of the stack
    stack_rows.push(randint(1, maze_rows) - 1)
    stack_columns.push(randint(1, maze_columns) - 1)
    //  Main loop that keeps running until there are no cells left in the stack
    while (stack_rows.length > 0) {
        //  Get the current cell from the top of the stack
        current_cell_row = stack_rows[stack_rows.length - 1]
        current_cell_column = stack_columns[stack_columns.length - 1]
        //  Calculate the x, y, and z coordinates of the current cell
        x_coordinate = maze_position.getValue(Axis.X) + (maze_columns - current_cell_column - 1) * 2
        y_coordinate = maze_position.getValue(Axis.Y) + 0
        z_coordinate = maze_position.getValue(Axis.Z) + (maze_rows - current_cell_row - 1) * 2
        //  Mark the current cell as "visited"
        cell_unvisited[current_cell_row * maze_columns + current_cell_column] = 0
        //  Get a list of unvisited neighbours for the current cell
        unvisited_neighbours = []
        current_cell_position_in_list = current_cell_row * maze_columns + current_cell_column
        if (current_cell_row != 0) {
            if (cell_unvisited[current_cell_position_in_list - maze_columns] == 1) {
                unvisited_neighbours.push("N")
            }
            
        }
        
        if (current_cell_row != maze_rows - 1) {
            if (cell_unvisited[current_cell_position_in_list + maze_columns] == 1) {
                unvisited_neighbours.push("S")
            }
            
        }
        
        if (current_cell_column != maze_columns - 1) {
            if (cell_unvisited[current_cell_position_in_list + 1] == 1) {
                unvisited_neighbours.push("E")
            }
            
        }
        
        if (current_cell_column != 0) {
            if (cell_unvisited[current_cell_position_in_list - 1] == 1) {
                unvisited_neighbours.push("W")
            }
            
        }
        
        //  Check if there are unvisited neighbours
        if (unvisited_neighbours.length == 0) {
            //  There are no unvisited neighbours, so remove the current cell from the top of the stack
            _py.py_array_pop(stack_rows)
            _py.py_array_pop(stack_columns)
        } else {
            //  There are unvisited neighbours, so choose one at random, and add it to the top of the stack
            x_offset = 0
            z_offset = 0
            connection_direction = unvisited_neighbours._pickRandom()
            if (connection_direction == "N") {
                z_offset = 1
                stack_rows.push(current_cell_row - 1)
                stack_columns.push(current_cell_column)
            } else if (connection_direction == "S") {
                z_offset = -1
                stack_rows.push(current_cell_row + 1)
                stack_columns.push(current_cell_column)
            } else if (connection_direction == "E") {
                x_offset = -1
                stack_rows.push(current_cell_row)
                stack_columns.push(current_cell_column + 1)
            } else if (connection_direction == "W") {
                x_offset = 1
                stack_rows.push(current_cell_row)
                stack_columns.push(current_cell_column - 1)
            } else {
                player.say("Error: Unknown connection_direction")
            }
            
            //  Carve a path between the current cell and the new, unvisited neighbour
            blocks.fill(AIR, world(x_coordinate + x_offset, y_coordinate + 0, z_coordinate + z_offset), world(x_coordinate + x_offset, y_coordinate + wall_height - 1, z_coordinate + z_offset), FillOperation.Replace)
            //  Update the blocks_used variable to account for the blocks that have been removed
            blocks_used = blocks_used - wall_height
            //  Add torches to the maze
            if (add_torches) {
                if (randint(1, 3) == 1) {
                    blocks.place(TORCH, world(x_coordinate + 0, y_coordinate + 1, z_coordinate + 0))
                    torches_used += 1
                }
                
            }
            
        }
        
    }
}

function drawMazeRoof() {
    //  Define global variables
    
    
    //  Initialise local variables
    let x_offset = 0
    let z_offset = 0
    let roof_position1 : Position = null
    let roof_position2 : Position = null
    //  Draw a roof on the maze layer
    if (maze_type == "tower") {
        //  Set the roof coordinates for a tower maze
        roof_position1 = positions.add(maze_position, pos(-1, wall_height, -1))
        roof_position2 = positions.add(maze_position, pos(maze_columns * 2 - 1, wall_height * 2 - 1, maze_rows * 2 - 1))
        //  Set the entrance position for a tower maze
        if (current_layer == 1) {
            x_offset = (Math.ceil(maze_columns / 2) - 1) * 2
            z_offset = (Math.ceil(maze_rows / 2) - 1) * 2
        } else {
            x_offset = randint(0, maze_columns - 1) * 2
            z_offset = randint(0, maze_rows - 1) * 2
        }
        
        entrance_position = positions.add(maze_position, pos(x_offset, 0, z_offset))
        //  Move the tower maze up to the next layer
        maze_position = positions.add(maze_position, pos(0, wall_height * 2, 0))
    } else if (maze_type == "pyramid") {
        //  Set the roof coordinates for a pyramid maze (roof is smaller than current layer)
        roof_position1 = positions.add(maze_position, pos(0, wall_height, 0))
        roof_position2 = positions.add(maze_position, pos(maze_columns * 2 - 2, wall_height * 2 - 1, maze_rows * 2 - 2))
        //  Set the entrance offsets for a pyramid maze (roof is smaller than current layer)
        x_offset = randint(1, maze_columns - 2) * 2
        z_offset = randint(1, maze_rows - 2) * 2
        entrance_position = positions.add(maze_position, pos(x_offset, 0, z_offset))
        //  Move the pyramid maze up to the next layer (decreasing in size)
        maze_position = positions.add(maze_position, pos(2, wall_height * 2, 2))
    } else if (maze_type == "diamond") {
        if (current_layer > middle_layer) {
            //  Lower half of a diamond maze...
            //  Set the roof coordinates for a diamond maze (roof is larger than current layer)
            roof_position1 = positions.add(maze_position, pos(-2, wall_height, -2))
            roof_position2 = positions.add(maze_position, pos(maze_columns * 2 + 0, wall_height * 2 - 1, maze_rows * 2 + 0))
            //  Set the entrance offsets for a diamond maze (roof is larger than current layer)
            x_offset = randint(0, maze_columns - 1) * 2
            z_offset = randint(0, maze_rows - 1) * 2
            entrance_position = positions.add(maze_position, pos(x_offset, 0, z_offset))
            //  Move the diamond maze up to the next layer (increasing in size)
            maze_position = positions.add(maze_position, pos(-2, wall_height * 2, -2))
        } else {
            //  Upper half of a diamond maze...
            //  Set the roof coordinates for a diamond maze (roof is smaller than current layer)
            roof_position1 = positions.add(maze_position, pos(0, wall_height, 0))
            roof_position2 = positions.add(maze_position, pos(maze_columns * 2 - 2, wall_height * 2 - 1, maze_rows * 2 - 2))
            //  Set the entrance offsets for a diamond maze (roof is smaller than current layer)
            x_offset = randint(1, maze_columns - 2) * 2
            z_offset = randint(1, maze_rows - 2) * 2
            entrance_position = positions.add(maze_position, pos(x_offset, 0, z_offset))
            //  Move the diamond maze up to the next layer (decreasing in size)
            maze_position = positions.add(maze_position, pos(2, wall_height * 2, 2))
        }
        
    }
    
    //  Draw the floor
    blocks.fill(wall_blocks, roof_position1, roof_position2, FillOperation.Replace)
    blocks_used += (roof_position2.getValue(Axis.X) - roof_position1.getValue(Axis.X) + 1) * (roof_position2.getValue(Axis.Y) - roof_position1.getValue(Axis.Y) + 1) * (roof_position2.getValue(Axis.Z) - roof_position1.getValue(Axis.Z) + 1)
    //  Draw the entrance
    for (let index = 0; index < 3; index++) {
        blocks.fill(SEA_LANTERN, entrance_position, positions.add(entrance_position, pos(0, wall_height * 2 - 1, 0)), FillOperation.Replace)
        loops.pause(100)
        blocks.fill(AIR, entrance_position, positions.add(entrance_position, pos(0, wall_height * 2 - 1, 0)), FillOperation.Replace)
        loops.pause(100)
    }
    blocks_used -= wall_height
}

function drawMazeDoors() {
    //  Define global variables
    
    //  Set the exit_position and entrance_position variables
    if (maze_type == "maze") {
        exit_position = positions.add(player_position, pos(0, 0, maze_rows * 2 + 2))
        entrance_position = positions.add(player_position, pos(0, 0, 2))
    } else {
        exit_position = positions.add(player_position, pos(0, 0, 2))
    }
    
    //  Draw the exit/entrance
    for (let count = 0; count < 3; count++) {
        blocks.fill(SEA_LANTERN, exit_position, positions.add(exit_position, pos(0, wall_height - 1, 0)), FillOperation.Replace)
        if (maze_type == "maze") {
            blocks.fill(SEA_LANTERN, entrance_position, positions.add(entrance_position, pos(0, wall_height - 1, 0)), FillOperation.Replace)
        }
        
        loops.pause(100)
        blocks.fill(AIR, exit_position, positions.add(exit_position, pos(0, wall_height - 1, 0)), FillOperation.Replace)
        if (maze_type == "maze") {
            blocks.fill(AIR, entrance_position, positions.add(entrance_position, pos(0, wall_height - 1, 0)), FillOperation.Replace)
        }
        
        loops.pause(100)
    }
    //  Update the blocks_used variable to account for the blocks that have been removed
    blocks_used = blocks_used - wall_height
    if (maze_type == "maze") {
        blocks_used = blocks_used - wall_height
    }
    
}

function showMazeInfo() {
    let time_minutes: number;
    //  Define global variables
    
    //  Initialise local variables
    let time_seconds = Math.round((gameplay.timeQuery(GAME_TIME) - time_start) / 20)
    //  Display maze information
    if (maze_type == "maze") {
        player.say("Finished creating maze")
    } else {
        player.say("Finished creating " + maze_type + " maze")
    }
    
    if (time_seconds == 1) {
        player.say("...Time taken: " + ("" + time_seconds) + " second")
    } else if (time_seconds < 60) {
        player.say("...Time taken: " + ("" + time_seconds) + " seconds")
    } else {
        time_minutes = Math.round(time_seconds / 60)
        if (time_minutes == 1) {
            player.say("...Time taken: " + ("" + time_minutes) + " minute")
        } else {
            player.say("...Time taken: " + ("" + time_minutes) + " minutes")
        }
        
    }
    
    player.say("...Blocks used: " + ("" + blocks_used))
    if (add_torches) {
        player.say("...Torches used: " + ("" + torches_used))
    }
    
}

function solveMaze() {
    let time_minutes: number;
    //  Define global variables
    
    
    //  Initialise local variables
    robot_position = entrance_position
    robot_orientation = "N"
    let maze_solve_loop = true
    maze_solve_path = []
    searched_steps = 0
    solution_steps = 0
    let time_start = gameplay.timeQuery(GAME_TIME)
    //  Display status message
    if (maze_type == "maze") {
        player.say("Solving maze...")
    } else {
        player.say("Solving " + maze_type + " maze...")
    }
    
    //  Solve the maze, baby...
    while (maze_solve_loop) {
        //  Rule 1: If there's air underneath the (invisible) robot, move it down to the next layer
        if (blocks.testForBlock(AIR, positions.add(robot_position, pos(0, -1, 0)))) {
            robot_position = positions.add(robot_position, pos(0, -1, 0))
            maze_solve_path = []
        } else if (robotTestForAir("Left")) {
            //  Rule 2: If the (invisible) robot can turn left, then it must turn left
            robotTurn("Left")
            addToSolvePath("L")
            moveRobotForward()
        } else if (robotTestForAir("Forward")) {
            //  Rule 3: If the (invisible) robot can go straight/forward, then it must go straight/forward
            if (robotTestForAir("Right")) {
                addToSolvePath("S")
            }
            
            moveRobotForward()
        } else if (robotTestForAir("Right")) {
            //  Rule 4: If the (invisible) robot can turn right, then it must turn right
            robotTurn("Right")
            addToSolvePath("R")
            moveRobotForward()
        } else {
            //  Rule 5: If the (invisible) robot is in a dead end, then it must turn back
            blocks.place(path_block, robot_position)
            loops.pause(200)
            robotTurn("Back")
            addToSolvePath("B")
            moveRobotForward()
        }
        
        //  Rule 6: If the (invisible) robot is at the exit, then stop solving the maze
        if (robot_position.getValue(Axis.X) == exit_position.getValue(Axis.X)) {
            if (robot_position.getValue(Axis.Y) == exit_position.getValue(Axis.Y)) {
                if (robot_position.getValue(Axis.Z) == exit_position.getValue(Axis.Z)) {
                    maze_solve_loop = false
                    moveRobotForward()
                }
                
            }
            
        }
        
    }
    //  Display status messages
    if (maze_type == "maze") {
        player.say("Finished solving maze")
    } else {
        player.say("Finished solving " + maze_type + " maze")
    }
    
    let time_seconds = Math.round((gameplay.timeQuery(GAME_TIME) - time_start) / 20)
    if (time_seconds < 60) {
        player.say("...Time taken: " + ("" + time_seconds) + " seconds")
    } else {
        time_minutes = Math.round(time_seconds / 60)
        if (time_minutes == 1) {
            player.say("...Time taken: " + ("" + time_minutes) + " minute")
        } else {
            player.say("...Time taken: " + ("" + time_minutes) + " minutes")
        }
        
    }
    
    player.say("...Path searched: " + ("" + searched_steps) + " steps")
    player.say("...Path found: " + ("" + solution_steps) + " steps")
}

function robotTestForAir(direction: string): boolean {
    //  Define global variables
    
    robotGetXZOffsets(direction)
    if (blocks.testForBlock(wall_blocks, positions.add(robot_position, pos(x_offset, 0, z_offset)))) {
        return false
    } else {
        return true
    }
    
}

function robotGetXZOffsets(direction: string) {
    //  Define global variables
    
    //  Reset x_offset and z_offset variables
    x_offset = 0
    z_offset = 0
    if (robot_orientation == "N") {
        if (direction == "Left") {
            x_offset = 1
        } else if (direction == "Right") {
            x_offset = -1
        } else {
            z_offset = 1
        }
        
    } else if (robot_orientation == "S") {
        if (direction == "Left") {
            x_offset = -1
        } else if (direction == "Right") {
            x_offset = 1
        } else {
            z_offset = -1
        }
        
    } else if (robot_orientation == "E") {
        if (direction == "Left") {
            z_offset = 1
        } else if (direction == "Right") {
            z_offset = -1
        } else {
            x_offset = -1
        }
        
    } else if (robot_orientation == "W") {
        if (direction == "Left") {
            z_offset = -1
        } else if (direction == "Right") {
            z_offset = 1
        } else {
            x_offset = 1
        }
        
    } else {
        player.say("Unknown robot orientation")
    }
    
}

function robotTurn(direction: string) {
    //  Define global variables
    
    if (robot_orientation == "N") {
        if (direction == "Left") {
            robot_orientation = "W"
        } else if (direction == "Right") {
            robot_orientation = "E"
        } else {
            robot_orientation = "S"
        }
        
    } else if (robot_orientation == "S") {
        if (direction == "Left") {
            robot_orientation = "E"
        } else if (direction == "Right") {
            robot_orientation = "W"
        } else {
            robot_orientation = "N"
        }
        
    } else if (robot_orientation == "E") {
        if (direction == "Left") {
            robot_orientation = "N"
        } else if (direction == "Right") {
            robot_orientation = "S"
        } else {
            robot_orientation = "W"
        }
        
    } else if (robot_orientation == "W") {
        if (direction == "Left") {
            robot_orientation = "S"
        } else if (direction == "Right") {
            robot_orientation = "N"
        } else {
            robot_orientation = "E"
        }
        
    } else {
        player.say("Unknown robot orientation")
    }
    
}

function addToSolvePath(text: string) {
    let last_three_steps: string;
    let index: number;
    //  Define global variables
    
    //  Add the last step to the solution path
    maze_solve_path.push(text)
    //  Check if the solution path can be shortened
    if (maze_solve_path.length >= 3) {
        last_three_steps = ""
        index = maze_solve_path.length - 3
        for (let counter = 0; counter < 3; counter++) {
            last_three_steps = last_three_steps + maze_solve_path[index]
            index += 1
        }
        if (last_three_steps == "LBR") {
            replaceLastThreeSteps("B")
        } else if (last_three_steps == "LBS") {
            replaceLastThreeSteps("R")
        } else if (last_three_steps == "RBL") {
            replaceLastThreeSteps("B")
        } else if (last_three_steps == "SBL") {
            replaceLastThreeSteps("R")
        } else if (last_three_steps == "SBS") {
            replaceLastThreeSteps("B")
        } else if (last_three_steps == "LBL") {
            replaceLastThreeSteps("S")
        }
        
    }
    
}

function replaceLastThreeSteps(text: string) {
    //  Define global variables
    
    //  Shorten the solution path by replacing the last three steps
    for (let index = 0; index < 3; index++) {
        _py.py_array_pop(maze_solve_path)
    }
    maze_solve_path.push(text)
}

function moveRobotForward() {
    //  Define global variables
    
    //  Move the (invisible) robot forward 1 step
    if (maze_solve_path.length > 1 && maze_solve_path[maze_solve_path.length - 1] == "B") {
        //  Retracing steps, so remove the path behind the (invisible) robot
        blocks.place(AIR, robot_position)
        solution_steps -= 1
    } else {
        //  Not retracing steps, so leave a path behind the (invisible) robot
        blocks.place(path_block, robot_position)
        solution_steps += 1
    }
    
    robotGetXZOffsets("Move Forward")
    robot_position = positions.add(robot_position, pos(x_offset, 0, z_offset))
    searched_steps += 1
}

