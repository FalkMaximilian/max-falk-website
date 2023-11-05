const base_url = "http://127.0.0.1:8000/todo/api/";

const deleteModal = document.getElementById("deleteModal");

if (deleteModal) {
    deleteModal.addEventListener("show.bs.modal", (event) => {
        const button = event.relatedTarget;
        const taskid = button.getAttribute("data-bs-taskid");
        const tasktitle =
            button.previousElementSibling.querySelector(".tasktitle").innerHTML;

        const modalTitle = deleteModal.querySelector("#delete-modal-message");
        const confirmButton = deleteModal.querySelector(".btn-danger");

        modalTitle.textContent = `Are you sure you want to delete '${tasktitle}' ?`;
        confirmButton.href = `delete-task/${taskid}/`;
    });
}

var active_list = -1;

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

var csrf_token = getCookie('csrftoken');

function buildList() {
    const lists_wrapper = document.getElementById("lists-wrapper");

    const lists_url = base_url + "list-list/";

    fetch(lists_url)
        .then((resp) => resp.json())
        .then(function (data) {
            console.log("Data: ", data);

            var list_list = data;
            for (var i in list_list) {
                var item = `
                <div class="nav-item hstack rounded my-1 bg-body-tertiary w-100">
                    <button class="nav-link text-break fs-5 me-2 text-light select-list-item" style="overflow-wrap: break-word;" list-id="${list_list[i].id}">${list_list[i].title}</button>
                    <button type="button" class="btn p-0 text-body-tertiary icon-link ms-auto me-2 fs-3"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                        </svg>
                    </button>
                </div>
            `;

                if (active_list === -1) {
                    item = `
                    <div class="nav-item hstack rounded my-1 bg-primary w-100 active-list-item">
                        <button class="nav-link text-break fs-5 me-2 text-light select-list-item" style="overflow-wrap: break-word;" list-id="${list_list[i].id}">${list_list[i].title}</button>
                        <button type="button" class="btn p-0 text-body-tertiary icon-link ms-auto me-2 fs-3"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
                                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                            </svg>
                        </button>
                    </div>
                `;
                    active_list = list_list[i].id;
                    loadTasks(active_list);
                }

                lists_wrapper.innerHTML += item;
            }


        });
}

let checked_svg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-circle-fill" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/></svg>';
let unchecked_svg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-circle" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/></svg>';

function loadTasks(listid) {
    const tasks_wrapper = document.getElementById("tasks");

    let tasks_url = base_url + "task-list/" + String(listid) + "/";

    fetch(tasks_url)
        .then((resp) => resp.json())
        .then(function (data) {
            console.log("Task Data: ", data);

            var task_list = data;
            for (var i in task_list) {
                let task_elem = document.createElement("div");
                task_elem.classList.add(
                    "hstack",
                    "task-container",
                    "rounded",
                    "bg-body-tertiary",
                    "ps-3",
                    "p-2",
                    "my-2"
                );

                // Checkmark
                let checked = document.createElement("div");
                checked.classList.add("icon-link", "fs-4", "status-checkmark");
                checked.setAttribute('task-id', String(task_list[i].id));
                task_elem.appendChild(checked);

                // Container for title and description
                let task_content = document.createElement("div");
                task_content.classList.add("ps-3", "pe-4");
                task_elem.appendChild(task_content);

                // Title
                let task_title = document.createElement("h1");
                task_title.classList.add("m-0", "pb-2", "fs-5");
                task_title.innerHTML = task_list[i].title;
                task_content.appendChild(task_title);

                // Description
                let task_desc = document.createElement("p");
                task_desc.classList.add("m-0");
                task_desc.innerHTML = task_list[i].description;
                task_content.appendChild(task_desc);

                // Delete button
                let task_del_button = document.createElement("button");
                task_del_button.classList.add(
                    "btn",
                    "p-0",
                    "icon-link",
                    "ms-auto",
                    "text-body-tertiary",
                    "fs-3",
                    "task-del-btn",
                );
                task_del_button.setAttribute("type", "button");
                task_del_button.innerHTML =
                    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>';
                task_elem.appendChild(task_del_button);

                // Change style depending on status
                if (task_list[i].status) {
                    checked.classList.add("text-success");
                    checked.innerHTML = checked_svg;
                    checked.setAttribute('status', 'true');
                    task_elem.classList.add('text-decoration-line-through');
                } else {
                    checked.innerHTML = unchecked_svg;
                    checked.setAttribute('status', 'false');
                }

                tasks_wrapper.appendChild(task_elem);
            }
        });
}

buildList();


function toggleTaskStatus(checkmark_div, taskid) {

    let toggle_status_url = base_url + 'task-update/' + String(taskid) + '/';

    if (checkmark_div.getAttribute('status') == 'true') {
        checkmark_div.setAttribute('status', 'false');
        checkmark_div.parentElement.classList.remove('text-decoration-line-through')
        checkmark_div.innerHTML = unchecked_svg;
        checkmark_div.classList.remove('text-success');
    } else {
        checkmark_div.setAttribute('status', 'true');
        checkmark_div.parentElement.classList.add('text-decoration-line-through');
        checkmark_div.innerHTML = checked_svg;
        checkmark_div.classList.add('text-success');
    }


}


const tasks_wrapper = document.getElementById('tasks');
tasks_wrapper.addEventListener('click', (event) => {
    let clicked = event.target;

    var closest;

    //console.log(clicked);
    if (closest = clicked.closest('.task-del-btn')) {
        //console.log("CLOSEST DELETE!");
    } else if (closest = clicked.closest('.status-checkmark')) {
        toggleTaskStatus(closest, closest.getAttribute('task-id'));
    }
});

const lists = document.getElementById("lists-wrapper");
lists.addEventListener("click", (event) => {
    var clicked = event.target;

    if (clicked.classList.contains("select-list-item")) {
        let new_active_list = Number(clicked.getAttribute("list-id"));
        if (new_active_list != active_list) {
            while (tasks_wrapper.firstChild) {
                tasks_wrapper.removeChild(tasks_wrapper.lastChild);
            }

            let current_active = document.querySelector(".active-list-item");
            current_active.classList.remove("active-list-item");
            current_active.classList.remove("bg-primary");
            current_active.classList.add("bg-body-tertiary");

            clicked.parentElement.classList.add("active-list-item");
            clicked.parentElement.classList.remove("bg-body-tertiary");
            clicked.parentElement.classList.add("bg-primary");

            active_list = new_active_list;
            loadTasks(active_list);
        }
    }
});