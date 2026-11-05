
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
const submitButton = document.getElementById("task-submit");

let editingTaskId = null;

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

  if (!data || data.length === 0) {
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
    status.textContent = task.completed
      ? "Completed"
      : "Pending";

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const completeButton = document.createElement("button");
    completeButton.className = "complete-btn toggle-task";
    completeButton.textContent = task.completed
      ? "Mark Incomplete"
      : "Complete";

    completeButton.addEventListener("click", async () => {
      await updateTask(task.id, {
        completed: !task.completed
      });
    });

    const editButton = document.createElement("button");
    editButton.className = "edit-btn edit-task";
    editButton.textContent = "Edit";

    editButton.addEventListener("click", () => {
      editingTaskId = task.id;
      titleInput.value = task.title;
      descriptionInput.value = task.description || "";
      submitButton.textContent = "Save Changes";
      titleInput.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn delete-task";
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", async () => {
      await deleteTask(task.id);
    });

    actions.append(
      completeButton,
      editButton,
      deleteButton
    );

    taskElement.append(
      title,
      description,
      status,
      actions
    );

    taskList.appendChild(taskElement);
  });
}

taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();

  if (!title) {
    showStatus("Task title is required.");
    return;
  }

  submitButton.disabled = true;

  let result;

  if (editingTaskId !== null) {
    result = await db
      .from("tasks")
      .update({
        title: title,
        description: description || null
      })
      .eq("id", editingTaskId);
  } else {
    result = await db
      .from("tasks")
      .insert({
        title: title,
        description: description || null,
        completed: false
      });
  }

  submitButton.disabled = false;

  if (result.error) {
    showStatus("Error saving task: " + result.error.message);
    return;
  }

  editingTaskId = null;
  taskForm.reset();
  submitButton.textContent = "Add Task";

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

async function deleteTask(id) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this task?"
  );

  if (!confirmed) {
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

  if (editingTaskId === id) {
    editingTaskId = null;
    taskForm.reset();
    submitButton.textContent = "Add Task";
  }

  await loadTasks();
}

loadTasks();
