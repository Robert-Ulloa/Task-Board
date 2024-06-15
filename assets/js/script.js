// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Generate a unique task id
function generateTaskId() {
    return nextId++;
}

// Create a task card
function createTaskCard(task) {
    let taskCard = $(`
        <div class="task-card card p-2 mb-2" data-id="${task.id}">
            <h5>${task.title}</h5>
            <p>${task.description}</p>
            <p>Deadline: ${task.deadline}</p>
            <button class="btn btn-danger btn-sm delete-task">Delete</button>
        </div>
    `);

    let today = dayjs();
    let deadline = dayjs(task.deadline);
    if (today.isAfter(deadline, 'day')) {
        taskCard.addClass("overdue");
    } else if (deadline.diff(today, 'day') <= 2) {
        taskCard.addClass("nearing-deadline");
    }

    taskCard.data("task", task);
    return taskCard;

}

// Render the task list and make cards draggable
function renderTaskList() {
    $("#todo-cards, #in-progress-cards, #done-cards").empty();

    taskList.forEach(task => {
        const taskCard = createTaskCard(task);
        $(`#${task.status}-cards`).append(taskCard);
    });

    $(".task-card").draggable({
        revert: "invalid",
        helper: "clone"
    });

    $(".lane").droppable({
        accept: ".task-card",
        drop: handleDrop
    });

    $(document).on('click', '.delete-task', handleDeleteTask);
}

// Handle adding a new task
function handleAddTask(event) {
    event.preventDefault();

    const title = $("#taskTitle").val();
    const description = $("#taskDescription").val();
    const deadline = dayjs($("#taskDeadline").val()).format('YYYY-MM-DD');

    const newTask = {
        id: generateTaskId(),
        title: title,
        description: description,
        deadline: deadline,
        status: "todo"
    };

    taskList.push(newTask);
    localStorage.setItem("tasks", JSON.stringify(taskList));
    localStorage.setItem("nextId", nextId);

    renderTaskList();
    $("#formModal").modal("hide");
}

// Handle deleting a task
function handleDeleteTask(event) {
    const taskId = $(event.target).closest(".task-card").data("id");
    taskList = taskList.filter(task => task.id !== taskId);
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();
}

// Handle dropping a task into a new status lane
function handleDrop(event, ui) {
    const taskId = ui.helper.data("id");
    const newStatus = $(event.target).closest(".lane").attr("id").replace('-cards', '');

    taskList.forEach(task => {
        if (task.id === taskId) {
            task.status = newStatus;
        }
    });

    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();
}

// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    renderTaskList();

    $("#taskForm").submit(handleAddTask);

    $("#taskDeadline").datepicker({
        dateFormat: "yy-mm-dd"
    });
});
