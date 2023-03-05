const express = require("express");
const expressAppInstance = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "todoApplication.db");
let databaseConnectionObject = null;

expressAppInstance.use(express.json());

const initializeDBAndServer = async() => {
  try {
    databaseConnectionObject = await open({
      filename: databasePath,
      driver: sqlite3.Database
    });

    expressAppInstance.listen(3002, () => {
      console.log(`Database object received and server initialized`);
    });
  } catch (e) {
    console.log(`Database error ${e.message}`);
  }
};

initializeDBAndServer();

//API-1 getTodos

expressAppInstance.get("/todos/", async(request, response)=>{
    
    const {status="", priority="", search_q=""} = request.query;
    console.log(status, priority, search_q)
    
    const getTodosQuery = `SELECT * FROM todo WHERE todo LIKE "%${search_q}%" AND priority LIKE "%${priority}%" AND status LIKE "%${status}%"`

    try{
        const arrayOfTodoObjects = await databaseConnectionObject.all(getTodosQuery);
        arrayOfTodoObjectsToBeDisplayed = []
        arrayOfTodoObjects.forEach((eachIterable)=>{
            let tempObject = {
                id:eachIterable["id"],
                todo:eachIterable["todo"],
                priority:eachIterable["priority"],
                status:eachIterable["status"]
            }
            console.log(tempObject)
            arrayOfTodoObjectsToBeDisplayed.push(tempObject)
        })
        response.send(arrayOfTodoObjectsToBeDisplayed);
    }catch(e){
        console.log(`Database error ${e.message}`)
    }
     
    
})

//API-2 getTodo
expressAppInstance.get("/todos/:todoId/", async(request, response)=>{
    let {todoId} = request.params;
    todoId = parseInt(todoId);
    console.log(request.params)
    const getTodoQuery = `SELECT * FROM todo WHERE id = ${todoId}`

    try{
        const todoObject = await databaseConnectionObject.get(getTodoQuery);
        response.send(todoObject)
    }catch(e){
        console.log(`Database Error ${e.message}`)
    }
})


//API-3 createTodo
expressAppInstance.post("/todos/", async(request, response) => {

    const todoObjectFromRequest = request.body;
    const { todo, priority, status } = todoObjectFromRequest;
    console.log(todo, priority, status);
    const createTodoQuery = `INSERT INTO todo(todo, priority, status) VALUES("${todo}", "${priority}", "${status}")`;

    try{
        await databaseConnectionObject.run(createTodoQuery);
        response.send("Todo Successfully Added");
    }catch(e){
        console.log(`Database error ${e.message}`);
    }
});

//API-4 updateTodo
expressAppInstance.put("/todos/:todoId", async(request, response)=>{
    let {todoId} = request.params;
    todoId = parseInt(todoId)

    const currentTodoObject = await databaseConnectionObject.get(`SELECT * FROM todo WHERE id=${todoId}`)
    const requestedTodoObject = request.body;    
    let {todo=currentTodoObject.todo, status=currentTodoObject.status, priority=currentTodoObject.priority} = requestedTodoObject;

    const updateTodoQuery = `UPDATE todo SET todo="${todo}", status="${status}", priority="${priority}" WHERE id=${todoId}`
    try{
        await databaseConnectionObject.run(updateTodoQuery);
    }catch(e){
        console.log(`Database Error ${e.message}`)
    }
    try{
        let requestedObjectsKeys = Object.keys(requestedTodoObject);
        let updatedObjectsString = "";
        if (requestedObjectsKeys.length > 1){
            requestedObjectsKeys = requestedObjectsKeys.map((eachIterable)=>{
                return eachIterable.charAt(0).toUpperCase()+eachIterable.slice(1)
            })
            updatedObjectsString = requestedObjectsKeys.join(", ")
        }else{
            updatedObjectsString = requestedObjectsKeys[0];
            updatedObjectsString = updatedObjectsString.charAt(0).toUpperCase()+updatedObjectsString.slice(1)
        }

        response.send(`${updatedObjectsString} Updated`);
       

    }catch(e){
        console.log(`JS Error ${e.message}`)
    }

})


//API-5 deleteTodo
expressAppInstance.delete("/todos/:todoId", async(request,response)=>{
    let {todoId} = request.params;
    todoId = parseInt(todoId);

    const deleteTodoQuery = `DELETE FROM todo WHERE id = ${todoId}`;
    try{
        await databaseConnectionObject.run(deleteTodoQuery);
        response.send("Todo Deleted")
    }catch(e){
        console.log(`Database Error ${e.message}`)
    }
    
    
})

module.exports = expressAppInstance;