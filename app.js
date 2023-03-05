const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "todoApplication.db");
let database = null;

app.use(express.json());

const initializeDBAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3002, () => {
      console.log(`Database object received and server initialized`);
    });
  } catch (e) {
    console.log(`Database error ${e.message}`);
  }
};

initializeDBAndServer();

//API-1 getTodos

app.get("/todos/", async (request, response) => {
  const { status = "", priority = "", search_q = "" } = request.query;
  console.log(status, priority, search_q);

  const getTodosQuery = `SELECT * FROM todo WHERE todo LIKE "%${search_q}%" AND priority LIKE "%${priority}%" AND status LIKE "%${status}%"`;

  try {
    const arrayOfTodoObjects = await database.all(getTodosQuery);
    arrayOfTodoObjectsToBeDisplayed = [];
    arrayOfTodoObjects.forEach((eachIterable) => {
      let tempObject = {
        id: eachIterable["id"],
        todo: eachIterable["todo"],
        priority: eachIterable["priority"],
        status: eachIterable["status"],
      };
      console.log(tempObject);
      arrayOfTodoObjectsToBeDisplayed.push(tempObject);
    });
    response.send(arrayOfTodoObjectsToBeDisplayed);
  } catch (e) {
    console.log(`Database error ${e.message}`);
  }
});

//API-2 getTodo
app.get("/todos/:todoId/", async (request, response) => {
  let { todoId } = request.params;
  todoId = parseInt(todoId);
  console.log(request.params);
  const getTodoQuery = `SELECT * FROM todo WHERE id = ${todoId}`;

  try {
    const todoObject = await database.get(getTodoQuery);
    response.send(todoObject);
  } catch (e) {
    console.log(`Database Error ${e.message}`);
  }
});

//API-3 createTodo
app.post("/todos/", async (request, response) => {
  const todoObjectFromRequest = request.body;
  const { todo, priority, status } = todoObjectFromRequest;
  console.log(todo, priority, status);
  const createTodoQuery = `INSERT INTO todo(todo, priority, status) VALUES("${todo}", "${priority}", "${status}")`;

  try {
    await database.run(createTodoQuery);
    response.send("Todo Successfully Added");
  } catch (e) {
    console.log(`Database error ${e.message}`);
  }
});

//API-4 updateTodo
app.put("/todos/:todoId/", async (request, response) => {
  let { todoId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;

  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
  }
  const previousTodoQuery = `SELECT * FROM todo WHERE id = ${todoId}`;
  const previousTodo = await database.get(previousTodoQuery);
  let {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body;

  const updateTodoQuery = `UPDATE todo SET todo="${todo}", priority="${priority}", status="${status}" WHERE id=${todoId};`;

  await database.run(updateTodoQuery);
  response.send(`${updateColumn} Updated`);
});

//API-5 deleteTodo
app.delete("/todos/:todoId", async (request, response) => {
  let { todoId } = request.params;
  todoId = parseInt(todoId);

  const deleteTodoQuery = `DELETE FROM todo WHERE id = ${todoId}`;
  try {
    await database.run(deleteTodoQuery);
    response.send("Todo Deleted");
  } catch (e) {
    console.log(`Database Error ${e.message}`);
  }
});

module.exports = app;
