const deleteModal = document.getElementById('deleteModal')

if (deleteModal) {
    deleteModal.addEventListener('show.bs.modal', event => {
        const button = event.relatedTarget
        const taskid = button.getAttribute('data-bs-taskid')
        const tasktitle = button.previousElementSibling.querySelector('.tasktitle').innerHTML

        const modalTitle = deleteModal.querySelector('#delete-modal-message')
        const confirmButton = deleteModal.querySelector('.btn-danger')

        modalTitle.textContent = `Are you sure you want to delete '${tasktitle}' ?`
        confirmButton.href = `delete-task/${taskid}/`
    })
}

const taskContainer = document.getElementById('tasks')

if (taskContainer) {
    taskContainer.addEventListener('click', function (e) {
        if (e.target.classList.contains('icon') ) {
            e.target.parentElement.classList.toggle('checked')
            return
        }

        if (e.target.parentElement.classList.contains('taskdescription')) {
            e.target.parentElement.parentElement.classList.toggle('checked')
            return
        }
    })
}

var active_list = null

BuildList()

let lists = document.getElementsByClassName('todolist-link')

for (let item of lists) {
    console.log(item)
}

function BuildList() {
    const lists_wrapper = document.getElementById('lists-wrapper')

    const lists_url = 'http://192.168.1.110:8000/todo/api/list-list/'

    fetch(lists_url)
    .then((resp) => resp.json())
    .then(function(data) {
        console.log('Data: ', data)

        var list_list = data
        for (var i in list_list) {
            
            var item = `
                <li class="nav-item hstack rounded my-1 bg-body-tertiary todolist-list-item">
                    <a class="nav-link text-break fs-5 me-2 todolist-link" style="overflow-wrap: break-word;">${list_list[i].title}</a>
                    <a class="text-body-tertiary icon-link ms-auto me-2 fs-3" href="#">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                        </svg>
                    </a>
                </li>
            `

            if (active_list === null) {
                item = `
                    <li class="nav-item hstack rounded my-1 bg-primary todolist-list-item">
                        <a class="nav-link text-break fs-5 me-2 todolist-link text-light" href="#" style="overflow-wrap: break-word;">${list_list[i].title}</a>
                        <a class="text-body-tertiary icon-link ms-auto me-2 fs-3" href="#">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
                                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                            </svg>
                        </a>
                    </li>
                `
                active_list = list_list[i].id
            }

            lists_wrapper.innerHTML += item
        }
    })
}