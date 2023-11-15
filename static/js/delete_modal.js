// Base URL for REST API
const base_url = 'https://falkmaximilian.de/todo/api/';

// Commonly needed elements
const lists_wrapper = document.getElementById('lists-wrapper');
const tasks_wrapper = document.getElementById('tasks');
const new_task_modal = document.getElementById('newTaskModal');
const new_list_modal = document.getElementById('newListModal');
const deleteModal = document.getElementById('deleteModal');
const listTitleHeading = document.getElementById('listTitleHeading');

// ID of the currently selected list
var active_list = -1;

// Keep JSON of lists and tasks
var lists = [];
var tasks = [];

// SVGs needed for UI.
let checked_svg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-circle-fill" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/></svg>';
let unchecked_svg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-circle" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/></svg>';
let cross_svg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>';


// Get a cookie by name and return null if not found
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

// CSRF token needed for Django post requests
var csrf_token = getCookie('csrftoken');


if (deleteModal) {
    deleteModal.addEventListener("show.bs.modal", (event) => {
        const button = event.relatedTarget;
        var closest;

        let modalTitle = deleteModal.querySelector('.modal-title');
        let modalMessage = deleteModal.querySelector('#delete-modal-message');
        let modalSubmitBtn = document.getElementById('deleteModalSubmitBtn');

        // Depending on what invoked the deletion modal
        if (closest = button.closest('.task-container')) {
            let task_id = Number(closest.getAttribute('task-id'));
            let task_title = closest.querySelector('.task-title').innerHTML;
            modalTitle.textContent = `Delete Task`;
            modalSubmitBtn.setAttribute('task-id', String(task_id));
            modalMessage.textContent = `Are you sure you want to delete the task '${task_title}'?`;
        } else if (closest = button.closest('.list-elem')) {
            let list_id = Number(closest.getAttribute('list-id'));
            let list_name = closest.querySelector('.select-list-item').innerHTML;
            modalTitle.textContent = `Delete List`;
            modalSubmitBtn.setAttribute('list-id', String(list_id));
            modalMessage.textContent = `Are you sure you want to delete the list '${list_name}'?`;
        }
    });

    deleteModal.addEventListener('click', (event) => {
        let clicked = event.target;
        if (clicked.id == 'deleteModalSubmitBtn') {
            var id = clicked.getAttribute('task-id');
            if (id) {
                fetch((base_url + 'task-delete/' + String(id) + '/'), {
                    method: 'DELETE',
                    headers: {
                        'Content-type': 'application/json',
                        'X-CSRFToken': csrf_token,
                    }
                }).then(response => {
                    if (response.ok) {
                        // Successfully deleted task in back-end
                        console.log(`Successfully deleted task with id ${id} from backend.`);

                        deleteTask(id);

                        if (tasks.length == 0) {
                            loadTasks(active_list);
                        }
                    }
                })
                return;
            }

            id = Number(clicked.getAttribute('list-id'));
            if (id) {
                fetch((base_url + 'list-delete/' + String(id) + '/'), {
                    method: 'DELETE',
                    headers: {
                        'Content-type': 'application/json',
                        'X-CSRFToken': csrf_token,
                    }
                }).then(response => {
                    if (response.ok) {
                        // Successfully deleted list in back-end
                        console.log(`Successfully deleted list with id ${id} from backend.`);

                        // Remove list from DOM
                        deleteList(id);

                        if (lists.length == 0) {
                            active_list = -1;
                            createList('Default List');
                            return;
                        }
                        
                        if (id == active_list) {
                            let first = lists_wrapper.firstElementChild;
                            setActiveList(first, first.getAttribute('list-id'));
                            loadTasks(Number(first.getAttribute('list-id')));
                        }
                    }
                })
                return;
            }

            console.log('Neither task- nor list-id have been found in attributes.');
        }
    });
}

async function createList(listTitle) {
    fetch((base_url + 'list-create/'), {
        method: 'POST',
        headers: {
            'Content-type': 'application/json',
            'X-CSRFToken': csrf_token,
        },
        body: JSON.stringify({ 'title': listTitle })
    }).then((resp) => {
        resp.json().then(parsed_val => {
            // Add to DOM and to lists array
            if (resp.ok) {
                active_list = parsed_val.id;
                loadLists();
            }
        })
    })
}

async function createTask() {

}

function setActiveList(list_elem, new_id) {
    let current_active = document.querySelector(".active-list-item");

    if (current_active) {
        current_active.classList.remove("active-list-item");
        current_active.classList.remove("bg-primary");
        current_active.classList.add("bg-body-tertiary");
    }

    list_elem.classList.add("active-list-item");
    list_elem.classList.remove("bg-body-tertiary");
    list_elem.classList.add("bg-primary");

    active_list = Number(new_id);
    listTitleHeading.textContent = list_elem.firstElementChild.innerHTML;
}


function addListToDom(i) {
    // Container for list item
    let list_elem = document.createElement('div');
    list_elem.classList.add('nav-item', 'hstack', 'rounded', 'my-1', 'w-100', 'list-elem');
    list_elem.setAttribute('list-id', String(lists[i].id));
    list_elem.setAttribute('data-bs-dismiss', 'offcanvas');
    list_elem.setAttribute('data-bs-target', '#offcanvasResponsive');

    // List label button
    let list_title_btn = document.createElement('button');
    list_title_btn.classList.add('nav-link', 'text-break', 'fs-5', 'me-2', 'text-light', 'select-list-item');
    list_title_btn.innerHTML = lists[i].title;
    list_elem.appendChild(list_title_btn);

    // List delete button
    let list_delete_btn = document.createElement('button');
    list_delete_btn.classList.add('btn', 'p-0', 'text-body-tertiary', 'icon-link', 'ms-auto', 'me-2', 'fs-3', 'list-del-btn');
    list_delete_btn.type = 'button';
    list_delete_btn.innerHTML = cross_svg;
    list_delete_btn.setAttribute('data-bs-toggle', 'modal');
    list_delete_btn.setAttribute('data-bs-target', '#deleteModal');
    list_elem.appendChild(list_delete_btn);

    if (active_list == lists[i].id) {
        list_elem.classList.add('bg-primary', 'active-list-item');
        loadTasks(active_list);
    } else if (active_list == -1) {
        list_elem.classList.add('bg-primary', 'active-list-item');
        active_list = lists[i].id;
        listTitleHeading.textContent = lists[i].title;
        loadTasks(active_list);
    } else {
        list_elem.classList.add('bg-body-tertiary');
    }

    lists_wrapper.appendChild(list_elem);
    return list_elem;
}

// Removes all list elements from the DOM
function emptyListDom() {
    while (lists_wrapper.firstChild) {
        lists_wrapper.removeChild(lists_wrapper.lastChild);
    }
}

// Removes all task elements from the DOM
function emptyTaskDom() {
    while (tasks_wrapper.firstChild) {
        tasks_wrapper.removeChild(tasks_wrapper.lastChild);
    }
}

if (new_list_modal) {

    new_list_modal.addEventListener('click', (event) => {
        let clicked = event.target;
        if (clicked.id == 'newListModalSubmitBtn') {
            let list_title_input = document.getElementById('newListTitleInput');
            let new_list_title = String(list_title_input.value);
            console.log(new_list_title);

            fetch((base_url + 'list-create/'), {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'X-CSRFToken': csrf_token,
                },
                body: JSON.stringify({ 'title': new_list_title })
            }).then((resp) => {
                resp.json().then(parsed_val => {
                    // Add to DOM and to lists array
                    if (resp.ok) {
                        active_list = parsed_val.id;
                        loadLists();
                    }
                })
            })
        }
    });
}

// Create a new task
if (new_task_modal) {
    new_task_modal.addEventListener('click', (event) => {
        let clicked = event.target;
        if (clicked.id == 'newTaskModalSubmitBtn') {
            let task_title_input = document.getElementById('floatingInputName');
            let new_task_title = String(task_title_input.value);
            let task_description_input = document.getElementById('floatingInputDesc');
            let new_task_description = String(task_description_input.value);

            fetch((base_url + 'task-create/'), {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'X-CSRFToken': csrf_token,
                },
                body: JSON.stringify({ 'list': active_list, 'title': new_task_title, 'description': new_task_description, 'status': false })
            }).then((resp) => {
                resp.json().then(parsed_val => {
                    console.log(resp);
                    if (resp.ok) {
                        loadLists();
                    }
                })
            })

        }
    });
}

// Loads the lists
function loadLists() {

    const lists_url = base_url + "list-list/";
    lists.length = 0;
    emptyListDom();

    fetch(lists_url)
        .then((resp) => resp.json())
        .then(function (data) {
            console.log("loadLists JSON Data: ", data);
            lists = data;
            for (var i in lists) {
                addListToDom(i);
            }
        });
}

// Removes all classes from the element given as input
function emptyClassListOf(item) {
    var class_list = item.classList;
    while (class_list.length > 0) {
        class_list.remove(class_list.item(0));
    }
}

// Loads all tasks for a specific list. 
function loadTasks(listid) {
    const tasks_wrapper = document.getElementById("tasks");

    let tasks_url = base_url + "task-list/" + String(listid) + "/";

    tasks.length = 0;
    emptyTaskDom()

    fetch(tasks_url)
        .then((resp) => resp.json())
        .then(function (data) {
            console.log("Task Data: ", data);

            var task_list = data;

            if (task_list.length == 0) {

                emptyClassListOf(tasks_wrapper);
                tasks_wrapper.classList.add('d-flex', 'align-items-center', 'no-tasks');

                let container_div = document.createElement('div');
                container_div.classList.add('container');
                tasks_wrapper.appendChild(container_div);

                let title = document.createElement('h3');
                title.classList.add('text-center', 'text-body', 'mb-3');
                title.innerHTML = "No tasks in this list!";
                container_div.appendChild(title);

                return;
            }

            if (tasks_wrapper.classList.contains('no-tasks')) {
                emptyClassListOf(tasks_wrapper);
                tasks_wrapper.classList.add('container-fluid', 'p-0', 'px-3');
            }

            for (var i in task_list) {
                let task_elem = document.createElement("div");
                task_elem.classList.add(
                    "hstack",
                    "task-container",
                    "rounded",
                    "bg-body-tertiary",
                    "ps-3",
                    "p-2",
                    "mt-1",
                    "mb-2"
                );
                task_elem.setAttribute('task-id', String(task_list[i].id));

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
                task_title.classList.add("task-title", "m-0", "pb-2", "fs-5");
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
                task_del_button.setAttribute('data-bs-toggle', 'modal');
                task_del_button.setAttribute('data-bs-target', '#deleteModal')
                task_del_button.innerHTML =
                    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>';
                task_elem.appendChild(task_del_button);

                // Change style depending on status
                if (task_list[i].status) {
                    checked.classList.add("checked-green");
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

loadLists();

function toggleTaskStatusDOM(checkmark_div, taskid) {
    if (checkmark_div.getAttribute('status') == 'true') {
        checkmark_div.setAttribute('status', 'false');
        checkmark_div.parentElement.classList.remove('text-decoration-line-through')
        checkmark_div.innerHTML = unchecked_svg;
        checkmark_div.classList.remove('checked-green');
    } else {
        checkmark_div.setAttribute('status', 'true');
        checkmark_div.parentElement.classList.add('text-decoration-line-through');
        checkmark_div.innerHTML = checked_svg;
        checkmark_div.classList.add('checked-green');
    }
}

// Toggles the status for a tasks.
function toggleTaskStatus(checkmark_div, taskid) {

    fetch(base_url + 'task-toggle-status/' + String(taskid) + '/', {
        method: 'UPDATE',
        headers: {
            'Content-type': 'text/plain',
            'X-CSRFToken': csrf_token
        }
    }).then((response) => {
        if (response.ok) {
            toggleTaskStatusDOM(checkmark_div, taskid);
        }
    })


}

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

// Removes the list with the given id from the DOM and from global var lists
function deleteList(listid) {
    let listWrapperChildren = lists_wrapper.children;

    // TODO: This could be way easier if list index would be used on frontend instead of list-id
    for (let i = 0; i < listWrapperChildren.length; i++) {
        if (Number(listWrapperChildren[i].getAttribute('list-id')) == listid) {
            lists_wrapper.removeChild(listWrapperChildren[i]);
            break;
        }
    }

    for (var i in lists) {
        if (lists[i].id == listid) {
            lists.splice(i, 1);
            break;
        }
    }

    if (listWrapperChildren.length == 0) {
        loadLists();
    }
}

function deleteTask(taskid) {
    let taskWrapperChildren = tasks_wrapper.children;

    for (let i = 0; i < taskWrapperChildren.length; i++) {
        if (Number(taskWrapperChildren[i].getAttribute('task-id')) == taskid) {
            tasks_wrapper.removeChild(taskWrapperChildren[i]);
            break;
        }
    }

    for (var i in tasks) {
        if (tasks[i].id == taskid) {
            tasks.splice(i, 1);
            break;
        }
    }
}

// Decide what happens when a lists gets clicked
lists_wrapper.addEventListener("click", (event) => {
    var clicked = event.target;
    var closest_list_elem = clicked.closest('.list-elem');

    // If click was outside of an actual element
    if (!closest_list_elem) {
        console.log('clicked outside of list elem');
        return;
    }

    let selected_list_id = Number(closest_list_elem.getAttribute('list-id'));

    // Ignore if the del btn was pressed
    var closest_del_btn = clicked.closest('.list-del-btn');
    if (closest_del_btn) {
        return;
    }

    // The list that is active has been selected - do nothing
    if (selected_list_id == active_list) {
        console.log('Same list!');
        return;
    }

    // Remove all tasks from the dom as new ones will be loaded
    emptyTaskDom();

    // Set the new active list
    setActiveList(closest_list_elem, selected_list_id);

    // Load the tasks for that list
    loadTasks(active_list);
});
