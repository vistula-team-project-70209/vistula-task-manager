const SUPABASE_URL = "https://awddmtmawdmlahxvczey.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_d0MJpDaztgaVc3xP2vVC1g_V0n_azV4";

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

const taskForm = document.getElementById("task-form");
const titleInput = document.getElementById("task-title");
const descriptionInput = document.getElementById("task-description");
const taskList = document.getElementById("task-list");
const statusMessage = document.getElementById("status-message");

function showStatus(message) {
  statusMessage.textContent = message;
}

async function loadTasks() {
  showStatus("Loading tasks...");

  const { data, error } = await db
    .from("tasks")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    showStatus("Error loading tasks: " + error.message);
    return;
  }

  taskList.replaceChildren();

  if (data.length === 0) {
    showStatus("No tasks yet. Add your first task!");
    return;
  }

  showStatus("");

  data.forEach((task) => {
    const taskElement = document.createElement("div");
    taskElement.className = "task task-item";
    taskElement.dataset.id = task.id;

    if (task.completed) {
      taskElement.classList.add("completed");
    }

    const title = document.createElement("h3");
    title.className = "task-title";
    title.textContent = task.title;

    const description = document.createElement("p");
    description.className = "task-description";
    description.textContent = task.description || "";

    const status = document.createElement("p");
    status.className = "task-status";
    status.textContent = task.completed ? "Completed" : "Pending";

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const completeButton = document.createElement("button");
    completeButton.className = "complete-btn toggle-task";
    completeButton.textContent = task.completed
      ? "Mark Incomplete"
      : "Complete";

    completeButton.addEventListener("click", () => {
      updateTask(task.id, { completed: !task.completed });
    });

    const editButton = document.createElement("button");
    editButton.className = "edit-btn edit-task";
    editButton.textContent = "Edit";

    editButton.addEventListener("click", () => {
      editTask(task);
    });

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn delete-task";
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", () => {
      deleteTask(task.id);
    });

    actions.append(completeButton, editButton, deleteButton);
    taskElement.append(title, description, status, actions);
    taskList.appendChild(taskElement);
  });
}

taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();

  if (!title) {
    showStatus("Please enter a task title.");
    return;
  }

  const { error } = await db.from("tasks").insert([
    {
      title: title,
      description: description || null,
      completed: false
    }
  ]);

  if (error) {
    showStatus("Error adding task: " + error.message);
    return;
  }

  taskForm.reset();
  await loadTasks();
});

async function updateTask(id, changes) {
  const { error } = await db
    .from("tasks")
    .update(changes)
    .eq("id", id);

  if (error) {
    showStatus("Error updating task: " + error.message);
    return;
  }

  await loadTasks();
}

async function editTask(task) {
  const newTitle = prompt("Edit task title:", task.title);

  if (newTitle === null) return;

  if (!newTitle.trim()) {
    showStatus("Task title cannot be empty.");
    return;
  }

  const newDescription = prompt(
    "Edit description:",
    task.description || ""
  );

  if (newDescription === null) return;

  await updateTask(task.id, {
    title: newTitle.trim(),
    description: newDescription.trim() || null
  });
}

async function deleteTask(id) {
  if (!confirm("Are you sure you want to delete this task?")) {
    return;
  }

  const { error } = await db
    .from("tasks")
    .delete()
    .eq("id", id);

  if (error) {
    showStatus("Error deleting task: " + error.message);
    return;
  }

  await loadTasks();
}

if (
  SUPABASE_URL === "https://awddmtmawdmlahxvczey.supabase.co" ||
  SUPABASE_ANON_KEY === "sb_publishable_d0MJpDaztgaVc3xP2vVC1g_V0n_azV4"
) {
  showStatus("Supabase configuration is required.");
} else {
  loadTasks();
}
