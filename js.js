let start_element = null;
let end_element = null;
let current_mode = "startPoint"
let active_button = document.getElementsByClassName("buttons")[0];
let creating_walls = false;
let possible_moves = [];
let visited_nodes = []
let fields = [];
let walls_objects = [];
let walls_positions = [];
let move_history = []
let col_num = 40;
let row_num = 15;
let speed = 10
let info_box_is_displayed = false;
let active_alogorithm = "Dijkstra"

function ResetVariables(){
    playedMoves = []
    for(i = 0; i < row_num * col_num; i++){
        if(fields[i].classList.contains("searchedFieldColor")){
            fields[i].classList.remove("searchedFieldColor");
        }else if(fields[i].classList.contains("green")) {
            fields[i].classList.remove("green");
        }
        fields[i].innerHTML = "";
    }
}

function CreateWallArray(){
    for(i = 0; i < row_num * col_num; i++){
        walls_positions.push(false);
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
                walls_positions[i] = true;
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
    })
}

function ElementMouseOverEvent(i, element){
    
    element.addEventListener("mouseover", function(){
        if(current_mode == "wall" && creating_walls == true){
            if(!event.target.classList.contains("startField") && !event.target.classList.contains("endField")){
                event.target.classList.add("wall")
                walls_objects.push(event.target);
                walls_positions[i] = true;
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
                walls_positions[i] = false;
            }
        } 
        return false;
    }, false)
}

function GenerateSquares(){
    CreateWallArray();
    let grid = document.getElementById("grid");
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
        visited_nodes.push(false)
        move_history.push(-1)
        
        SetButtonEventListeners();
    }
} 

function ClearWalls(){
    walls_objects.forEach(element => {
        element.classList.remove("wall");
    });
    walls_objects = []
    walls_positions = []
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
    visited_nodes[index] = true
    move_history[prev_index] = index
}

async function show_path(){
    let next_element_index = move_history[parseInt(start_element.id)]
    while(next_element_index != parseInt(end_element.id)){
        fields[next_element_index].classList.add("green")
        fields[next_element_index].classList.remove("searchedFieldColor")
        next_element_index = move_history[parseInt(fields[next_element_index].id)]
        await sleep(10)
    } 
}


//This is where pathfinding logic starts
//-------------------------------------------------------------------------------

async function dfs(){
    let prev_element_index = parseInt(start_element.id)
    visited_nodes[prev_element_index] = true
    find_possible_moves(prev_element_index)

    while(possible_moves.length != 0){
        let next_move_index = possible_moves.pop()
        await visit(next_move_index, prev_element_index)
        if(next_move_index == parseInt(end_element.id)){
            show_path()
            return
        }
        find_possible_moves(next_move_index)
        prev_element_index = next_move_index
        await sleep(5)
    }
}

//This function finds all the nodes where our algorythm can go from the current node
function find_possible_moves(index){
    add_top_element(index) 
    add_right_element(index) 
    add_bottom_element(index) 
    add_left_element(index) 
}

function add_top_element(index){
    let new_index = index - col_num 
    if(new_index >= 0)
        if(!visited_nodes[new_index])
            possible_moves.push(new_index) 
}

function add_right_element(index){
    let new_index = index +  1
    if(new_index % col_num != 0)
        if(!visited_nodes[new_index])
            possible_moves.push(new_index) 
}

function add_bottom_element(index){
    let new_index = index + col_num
    if(new_index <= (row_num * col_num) - 1)
        if(!visited_nodes[new_index])
            possible_moves.push(new_index) 
}

function add_left_element(index){
    let new_index = index - 1
    if(index % col_num != 0)
        if(!visited_nodes[new_index])
            possible_moves.push(new_index) 
}


//Start the pathfinding
//--------------------------------------------------------------------------
function start(){
    dfs()
}