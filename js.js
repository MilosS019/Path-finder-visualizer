//Visualisation variables
let current_mode = "startPoint"
let active_button = document.getElementsByClassName("buttons")[0];
let start_element = null;
let end_element = null;
let creating_walls = false;
let col_num = 40;
let row_num = 15;
let speed = 10
let active_alogorithm = "Dijkstra"
let walls_stack = []
let walls_placed_counter = [0,[]]
let first_generation = true

//Path finding variables
let possible_moves = [];
let node_visited = []
let fields = [];
let walls_objects = [];
let is_wall = [];
let move_history = []
let distances = []
let info_box_is_displayed = false;

function change_grid_dimensions(){
    console.log("jej")
    try{
        let new_col_num = parseInt(document.getElementById("col_num").value)
        let new_row_num = parseInt(document.getElementById("row_num").value)
        let old_col_num = col_num
        let old_row_num = row_num
        col_num = new_col_num
        row_num = new_row_num
        GenerateSquares(old_col_num, old_row_num)
    }catch{
        alert("Please enter valid numbers")
    }
}

function set_undo(){
    document.addEventListener('keydown', function(event) {
        if (event.ctrlKey && event.key === 'z') {
          remove_previously_placed_walls()
        }
      });
}

function remove_previously_placed_walls(){
    if(walls_stack.length == 0)
        return
    let stack_obj = walls_stack.pop()
    let num_of_placed_walls = stack_obj[0] 
    let wall_indexes = stack_obj[1]
    for(let i = 0; i < num_of_placed_walls; i++){
        let wall = walls_objects.pop()
        wall.classList.remove("wall");
    }
    for(let index of wall_indexes){
        is_wall[index] = false
    }
}

async function ResetVariables(old_col_num = col_num, old_row_num = row_num){
    // walls_positions = []
    move_history = []
    possible_moves = []
    // ClearWalls()
    let local_col_num = col_num
    let local_row_num = row_num
    if(local_col_num != old_col_num)
        local_col_num = old_col_num
    if(local_row_num != old_row_num)
        local_row_num = old_row_num
    for(i = 0; i < local_col_num * local_row_num; i++){
        if(fields[i].classList.contains("searchedFieldColor")){
            fields[i].classList.remove("searchedFieldColor");
        }else if(fields[i].classList.contains("green")) {
            fields[i].classList.remove("green");
        }
        distances[i] = 999
        node_visited[i] = false
        fields[i].innerHTML = "";
    }
}

function CreateWallArray(){
    for(i = 0; i < row_num * col_num; i++){
        is_wall.push(false);
    }
}

function SetButtonEventListeners(){
    startFieldButton = document.getElementById("startFieldButton");
    endFieldButton = document.getElementById("endFieldButton");
    startButton = document.getElementById("startButton");
    wallButton = document.getElementById("wallButton");

    active_button = startFieldButton
    active_button.classList.add("active");

    ChangeButtons(active_button, "startPoint", "green")
    ChangeButtons(endFieldButton, "endPoint", "purple")
    ChangeButtons(wallButton, "wall", "blue")
}

function ChangeButtons(button, modeToBeSet, colorToSet){
    button.addEventListener("click", function(){ 
        if(current_mode == "startPoint"){
            active_button.classList.remove("green");
        }
        else if(current_mode == "endPoint"){
            active_button.classList.remove("purple");
        }
        else if(current_mode == "wall"){
            active_button.classList.remove("blue");
        }
        active_button = button;
        active_button.classList.add(colorToSet);
        current_mode = modeToBeSet
    })
}

function SetElementAtributes(index, element){
    let height = window.innerHeight * 0.65;
    let fieldHeight = height / row_num;
    let percentage = 100/col_num + "%"
    let pixels = "2px"
    
    element.id = index;
    element.style.lineHeight = fieldHeight + "px"
    element.classList.add("gridField");
    element.style.setProperty("width","calc(" + percentage + " - " + pixels + ")");
    element.style.height = 100/row_num + "%";
    element.style.border = "1px solid black";
    element.style.float = "left";
    element.style.margin = "0";
    element.style.cursor = "pointer";   
}

function ElementMouseDownEvent(i, element){
    element.addEventListener("mousedown", function(event){
        if (current_mode == "wall"){
            creating_walls = true;
            if(!event.target.classList.contains("startField") && !event.target.classList.contains("endField")){
                event.target.classList.add("wall")
                walls_objects.push(event.target);
                is_wall[i] = true;
                walls_placed_counter[0] += 1
                walls_placed_counter[1].push(i)
            }   
        }
    })
}

function ElementClickEvent(element){
    element.addEventListener("click", function(event) {
        if (current_mode == "startPoint"){
            if(start_element != null){
                start_element.classList.remove("startField");
            }        
            event.target.classList.add("startField");
            start_element = event.target;
        }  else if(current_mode == "endPoint"){
            if(end_element != null){
                end_element.classList.remove("endField");
            }        
            event.target.classList.add("endField");
            end_element = event.target;
        }
    })
}

function ElementMouseUpEvent(element){
    element.addEventListener("mouseup", function(){
        creating_walls = false;
        walls_stack.push(walls_placed_counter)
        walls_placed_counter = [0,[]]
        console.log("wtf")
    })
}

function ElementMouseOverEvent(i, element){
    
    element.addEventListener("mouseover", function(){
        if(current_mode == "wall" && creating_walls == true){
            if(!event.target.classList.contains("startField") && !event.target.classList.contains("endField")){
                event.target.classList.add("wall")
                walls_objects.push(event.target);
                is_wall[i] = true;
                walls_placed_counter[0] += 1
                walls_placed_counter[1].push(i)
            }
        }
    })
}

function ElementContextMenuEvent(i, element){
    element.addEventListener("contextmenu", function(){
        event.preventDefault();
        if(current_mode == "wall"){
            if(!event.target.classList.contains("startField") && !event.target.classList.contains("endField")){
                event.target.classList.remove("wall");
                is_wall[i] = false;
            }
        } 
        return false;
    }, false)
}

async function reset_display_variables(){
    is_wall = []
    fields = []
}

async function GenerateSquares(old_col_num = col_num, old_row_num = row_num){
    if(!first_generation){
        await ResetVariables(old_col_num, old_row_num);
        await reset_display_variables()
    }
    CreateWallArray();
    set_undo()
    let grid = document.getElementById("grid");
    grid.innerHTML = ""

    for(let i = 0; i < col_num * row_num; i++){
        let element = document.createElement("div")
        SetElementAtributes(i, element)

        ElementMouseDownEvent(i, element)
        ElementMouseUpEvent(element)
        ElementClickEvent(element)
        ElementMouseOverEvent(i, element)
        ElementContextMenuEvent(i, element)

        grid.appendChild(element);
        fields.push(element);
        node_visited.push(false)
        move_history.push(-1)
        distances.push(999)
        SetButtonEventListeners();
    }
    first_generation = false
} 

function ClearWalls(){
    walls_objects.forEach(element => {
        element.classList.remove("wall");
    });
    walls_objects = []
    is_wall = []
}

function SetVariables(){
    for(let i = 0; i < row_num * col_num; i++){
        parents.push(null);
    }
}

function sleep(milliseconds) {  
    return new Promise(resolve => setTimeout(resolve, milliseconds));  
 }  

function DisplayInfoBoxTriangle(){
    if(onCooldown){
        return;
    }
    onCooldown = true;
    setTimeout(RemoveCooldown, 600)
    if(!info_box_is_displayed){
        let firstTriangle = document.querySelector(".firstTriangle");
        let secondTriangle = document.querySelector(".secondTriangle");
        firstTriangle.style.borderBottom = "25px white solid";
        secondTriangle.style.borderBottom = "25px #2ABE9A solid"
        setTimeout(DisplayInfoBox,50);
    }else{
        DisplayInfoBox()
    }
}

//Show infoBox
function DisplayInfoBox(){
    let infoBox = document.querySelector(".infoBox");
    if(!info_box_is_displayed){
        infoBox.style.tranisition = "ease-out 0.7s";
        infoBox.style.height = "400px";
        infoBox.style.border = "3px #2ABE9A solid";
        info_box_is_displayed = true
    }else{
        infoBox.style.tranisition = "ease-in 0.7s";
        infoBox.style.height = "0px";
        infoBox.style.border = "0px #2ABE9A solid";
        setTimeout(RemoveInfoBoxTriangles, 650);
    }
}

//Info box animations
function RemoveInfoBoxTriangles(){
    let firstTriangle = document.querySelector(".firstTriangle");
    let secondTriangle = document.querySelector(".secondTriangle");
    firstTriangle.style.borderBottom = "0px white solid";
    secondTriangle.style.borderBottom = "0px #2ABE9A solid"
    info_box_is_displayed = false
}

function RemoveCooldown(){
    onCooldown = false
}

//Changes algorithm being used
function ChangeActiveAlgorithm(algorithm){
    let activeAlgorithmObject = document.querySelector(".activeAlgorithm");
    activeAlgorithmObject.classList.remove("activeAlgorithm");
    event.currentTarget.classList.add("activeAlgorithm");
    active_alogorithm = algorithm
}

//Closes the Info box
function CloseInfoBox(){
    if(info_box_is_displayed && !onCooldown)
        DisplayInfoBox();
}


async function visit(index, prev_index){
    if(index != parseInt(end_element.id))
        fields[index].classList.add("searchedFieldColor")
    node_visited[index] = true
}

async function show_path(){
    let prev_element_index = move_history[parseInt(end_element.id)]
    while(prev_element_index != parseInt(start_element.id)){
        fields[prev_element_index].classList.add("green")
        fields[prev_element_index].classList.remove("searchedFieldColor")
        prev_element_index = move_history[parseInt(fields[prev_element_index].id)]
        await sleep(10)
    } 
}


//This is where pathfinding logic starts
//-------------------------------------------------------------------------------


//DFS
//-------------------------------------------------------------------------------
async function dfs(){
    let prev_element_index = parseInt(start_element.id)
    node_visited[prev_element_index] = true
    possible_moves = find_possible_moves(prev_element_index)
    setParentNode(possible_moves, prev_element_index)

    while(possible_moves.length != 0){
        let next_move_index = possible_moves.pop()
        if(node_visited[next_move_index])
            continue
        await visit(next_move_index, prev_element_index)
        if(await over(next_move_index))
            return
        let new_possible_moves = find_possible_moves(next_move_index)
        setParentNode(new_possible_moves, next_move_index)
        possible_moves = possible_moves.concat(new_possible_moves)
        prev_element_index = next_move_index
        await sleep(5)
    }
}


//BFS
//-------------------------------------------------------------------------------
async function bfs(){
    let prev_element_index = parseInt(start_element.id)
    node_visited[prev_element_index] = true
    possible_moves = find_possible_moves(prev_element_index, true)

    while(possible_moves.length != 0){
        // console.log(possible_moves)
        let next_move_index = possible_moves.shift()
        if(node_visited[next_move_index])
            continue
        await visit(next_move_index, prev_element_index)
        if(await over(next_move_index)) 
            return;
        let new_possible_moves = find_possible_moves(next_move_index, true)
        setParentNode(new_possible_moves, next_move_index)
        possible_moves = possible_moves.concat(new_possible_moves)
        prev_element_index = next_move_index
        await sleep(50)
    }
}

function setParentNode(new_possible_moves, previous_node_index){
    for(let node_index of new_possible_moves){
        if(!node_visited[node_index])
            move_history[node_index] = previous_node_index
    }
}

//Dijkstra and Astar functions
//--------------------------------------------------------------------------------
async function main_pathfinding_function(best_move_choosing_function){
    let prev_element_index = parseInt(start_element.id)
    node_visited[prev_element_index] = true
    distances[prev_element_index] = 0
    possible_moves = find_possible_moves(prev_element_index)
    update_new_possible_moves_distances(prev_element_index, possible_moves)
    while(possible_moves.length != 0){
        next_node_index = best_move_choosing_function()
        if(node_visited[next_node_index])
            continue
        await visit(next_node_index, prev_element_index)
        if(await over(next_node_index))
            return
        let new_possible_moves = find_possible_moves(next_node_index)
        update_new_possible_moves_distances(next_node_index, new_possible_moves)
        possible_moves = possible_moves.concat(new_possible_moves)
        prev_element_index = next_node_index
        await sleep(50)
    }
}

function update_new_possible_moves_distances(previous_node_index, new_nodes_indexes){
    for(let new_node_index of new_nodes_indexes){
        if(distances[previous_node_index] + 1 < distances[new_node_index]){
            distances[new_node_index] = distances[previous_node_index] + 1
            move_history[new_node_index] = previous_node_index
        }
    }
}
//Dijkstra
//--------------------------------------------------------------------------------
async function dijkstra(){
    main_pathfinding_function(find_next_move_dijkstra)
}


function find_next_move_dijkstra(){
    let best_move_index = possible_moves[0]
    let counter = 0
    let best_move_local_index = 0
    for(let possible_move of possible_moves){
        if(distances[possible_move] < distances[best_move_index]){
            best_move_index = possible_move
            best_move_local_index = counter
        }
        counter += 1
    }
    possible_moves.splice(best_move_local_index, 1)
    return best_move_index
}


//A*
//----------------------------------------------------------------------------------
async function a_star(){
    main_pathfinding_function(find_next_move_a_star)
}

function find_next_move_a_star(){
    let best_move_index = possible_moves[0]
    let counter = 0
    let best_move_local_index = 0
    let end_x = parseInt(end_element.id) % col_num
    let end_y = Math.floor(parseInt(end_element.id) / col_num)
    for(let possible_move of possible_moves){
        
        let move_x = possible_move % col_num
        let move_y = Math.floor(possible_move / col_num)
        let best_move_x = best_move_index % col_num
        let best_move_y = Math.floor(best_move_index / col_num)

        let move_distance = Math.abs(end_x - move_x) + Math.abs(end_y - move_y)
        let best_move_distance = Math.abs(end_x - best_move_x) + Math.abs(end_y - best_move_y)

        if(distances[possible_move] + move_distance < distances[best_move_index] + best_move_distance){
            best_move_index = possible_move
            best_move_local_index = counter
        }
        else if(distances[possible_move] + move_distance == distances[best_move_index] + best_move_distance){
            if(move_distance < best_move_distance){
                best_move_index = possible_move
                best_move_local_index = counter            
            }
        }
        counter += 1
    }
    possible_moves.splice(best_move_local_index, 1)
    return best_move_index
}


//This function finds all the nodes where our algorythm can go from the current node
//This is used for all of the algorythms
//visit_on_add is there so that moves added to the possible moves list are imediately added to the move history as well
//as the visited nodes so we could track which nodes our bfs has already searched and from which node it searched
async function over(next_move_index){
    if(next_move_index == parseInt(end_element.id)){
        await show_path()
        return true
    }
    return false
}

function find_possible_moves(index){
    let new_possible_moves = []
    let top_index = add_top_element(index)
    if(top_index != null) new_possible_moves.push(top_index)
    let right_index = add_right_element(index)
    if(right_index != null) new_possible_moves.push(right_index)
    let bottom_index = add_bottom_element(index)
    if(bottom_index != null) new_possible_moves.push(bottom_index)
    let left_index = add_left_element(index)
    if(left_index != null) new_possible_moves.push(left_index)
    return new_possible_moves 
}

function add_top_element(index){
    let new_index = index - col_num 
    if(new_index >= 0)
        if(!node_visited[new_index] && !is_wall[new_index]){
            return new_index
        } 
}

function add_right_element(index){
    let new_index = index +  1
    if(new_index % col_num != 0)
        if(!node_visited[new_index] && !is_wall[new_index]){ 
            return new_index            
        } 
}

function add_bottom_element(index){
    let new_index = index + col_num
    if(new_index <= (row_num * col_num) - 1)
        if(!node_visited[new_index] && !is_wall[new_index]){
            return new_index
        }
}

function add_left_element(index){
    let new_index = index - 1
    if(index % col_num != 0)
        if(!node_visited[new_index] && !is_wall[new_index]){
            return new_index 
        }
}


//Start the pathfinding
//--------------------------------------------------------------------------
function start(){
    console.log(active_alogorithm)
    switch(active_alogorithm){
        case "Bfs":
            bfs();
            break;
        case "Dfs":
            dfs();
            break;
        case "Dijkstra":
            dijkstra();
            break;
        case "AStar":
            a_star()
            break;
        default:
            break
    }
}