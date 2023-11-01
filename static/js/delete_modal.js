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