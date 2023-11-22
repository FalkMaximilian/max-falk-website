// Debug
const DEBUG = true;

// Base URL for todo list REST API
const apiBaseURL = "api/";

// Commonly needed elements
const listsWrapperElement = document.getElementById("lists-wrapper");

// Modals
const createListModal = document.getElementById("createListModal");
const deleteListModal = document.getElementById("deleteListModal");


// Index of the currently selected list
var selectedList = -1;
var listToDelete = -1;

// Data about the lists
var lists = [];

// SVGs 
let crossSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>';



/* Helper functions */


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
var csrfToken = getCookie('csrftoken');

// Get index of element within it's parent
function getElementIndex(elem) {
    var index = 0;
    while(elem = elem.previousElementSibling) { ++index }
    return index;
}






/* LISTS */

// Removes everything in the lists wrapper
function emptyListsWrapper() {
    while (listsWrapperElement.firstChild) {
        listsWrapperElement.removeChild(listsWrapperElement.lastChild);
    }
}

// Select a list by index
function selectList(i) {

    // Check if index is valid and if index is not selected already
    if (i < 0 || i >= lists.length) {
        DEBUG && console.log("Method selectList(): Invalid Index (" + String(i) + ")!");
        return;
    } 

    // Change classes on the old selected list
    let oldSelectedList = document.querySelector(".selected-list");
    if (oldSelectedList) {
        oldSelectedList.classList.remove("selected-list");
        oldSelectedList.classList.remove("bg-primary");
        oldSelectedList.classList.add("bg-body-tertiary");
    }

    // Change classed for the newly selected list
    let newSelectedList = listsWrapperElement.children[i];
    newSelectedList.classList.add("selected-list");
    newSelectedList.classList.remove("bg-body-tertiary");
    newSelectedList.classList.add("bg-primary");

    selectedList = i;
}

// Decide what to do when a list element has been clicked
const listElementListener = (event) => {
    let clicked = event.target;
    if (clicked.closest(".list-del-btn")) {
        DEBUG && console.log("ListElementListener: Delete button was clicked!");
        return;
    }

    // Get index of list withing listsWrapperElement
    let index = getElementIndex(event.currentTarget);
    DEBUG && console.log("ListElementListener: List index ", index);
    selectList(index);
}

// Create a new list element
function createNewListElement(id, title) {

    // List container
    let listElement = document.createElement("div");
    listElement.classList.add("nav-item", "hstack", "rounded", "my-1", "w-100", "list-elem", "bg-body-tertiary");
    listElement.setAttribute("list-id", String(id));
    listElement.setAttribute("data-bs-dismiss", "offcanvas");
    listElement.setAttribute("data-bs-target", "#offcanvasResponsive");

    // List label
    let listLabel = document.createElement("span");
    // NOTE: select-list-item wird scheinbar nur genutzt um im delete modal an den Namen der Liste zu kommen
    listLabel.classList.add("nav-link", "text-break", "fs-5", "me-2", "text-light", "select-list-item");
    listLabel.innerHTML = String(title);
    listElement.appendChild(listLabel);

    // List delete button
    let listDeleteButton = document.createElement("button");
    listDeleteButton.classList.add("btn", "p-0", "text-body-tertiary", "icon-link", "ms-auto", "me-2", "fs-3", "list-del-btn");
    listDeleteButton.type = "button";
    listDeleteButton.innerHTML = crossSVG;
    listDeleteButton.setAttribute("data-bs-toggle", "modal");
    listDeleteButton.setAttribute("data-bs-target", "#deleteListModal");
    listElement.appendChild(listDeleteButton);

    // Handle click on list
    listElement.addEventListener("click", listElementListener);

    return listElement;
}

// Prepend a list - Takes JSON as input
function prependList(newList) {
    lists.unshift(newList); // Prepend
    let listElement = createNewListElement(newList.id, newList.title);
    listsWrapperElement.prepend(listElement);
    selectedList += 1;
}

// Append a list - Takes JSON as input
function appendList(newList) {
    lists.push(newList); // Append
    let listElement = createNewListElement(newList.id, newList.title);
    listsWrapperElement.appendChild(listElement);
}

// Remove list from memory and DOM
function deleteList(index) {

    lists.splice(index, 1); // Remove 1 item starting from index
    listsWrapperElement.children[index].remove();


    DEBUG && console.log("Lists after deletion: ", lists.length);
    DEBUG && console.log("Lists after deletion: ", lists);

    if (lists.length < 1) {
        // TODO: Show 'no lists text'
        DEBUG && console.log("No more lists!");
        return;
    }

    // Selected List Index decreases by one if
    // list before it is deleted
    if (index < selectedList) {
        selectedList -= 1;
    } else if (index == selectedList) {
        selectList(0);
    }

}



// Get all lists
async function getLists() {

    // Use await to serialize
    let response = await fetch(apiBaseURL + "list-list/");

    if (!response.ok) {
        // INCOMPLETE: Notify user that lists could not be fetched.
        DEBUG && console.log("NOT OK - GET LISTS: ", response);
        return;
    }

    const responseData = await response.json();

    DEBUG && console.log("Method getLists() received JSON: ", responseData);

    emptyListsWrapper();
    lists = responseData;
    lists.forEach(appendList);
    selectList(0);
}








/* Modals */

if (createListModal) {
    createListModal.addEventListener("click", async event => {
        let clicked = event.target;
        if (clicked.id == "createListModalSubmitBtn") {
            let listTitleInput = document.getElementById("createListTitleInput");
            let newListTitle = String(listTitleInput.value);

            DEBUG && console.log("NewListModal title input value: ", newListTitle);

            let response = await fetch((apiBaseURL + "list-create/"), {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                    "X-CSRFToken": csrfToken,
                },
                body: JSON.stringify({ "title": newListTitle }),
            });

            if (!response.ok) {
                // INCOMPLETE: If response was not valid notify user with 'Toast'
                DEBUG && console.log("NOT OK - CREATE: ", response);
                return;
            }

            let responseData = await response.json();

            prependList(responseData);
            selectList(0);
        }
    });
}


if (deleteListModal) {

    let deleteListModalSubmitBtn = document.getElementById("deleteListModalSubmitBtn");

    // Show correct data on modal
    deleteListModal.addEventListener("show.bs.modal", event => {
        let listIndex = getElementIndex(event.relatedTarget.parentElement);
        let modalMessage = deleteListModal.querySelector("#delete-list-modal-message");
        
        deleteListModalSubmitBtn.setAttribute("list-index", String(listIndex));
        modalMessage.textContent = `'${lists[listIndex].title}' will be deleted.`;
    })

    // Delete button event listener
    deleteListModalSubmitBtn.addEventListener("click", async event => {
        let listIndex = event.currentTarget.getAttribute("list-index");
        let url = apiBaseURL + "list-delete/" + String(lists[listIndex].id) + "/";

        let response = await fetch(url, {
            method: "DELETE",
            headers: {
                "Content-type": "application/json",
                "X-CSRFToken": csrfToken,
            }
        });

        if (!response.ok) {
            // INCOMPLETE: Notifty user that list could not be deleted!
            DEBUG && console.log("NOT OK - DELETE: ", response);
            return;
        }
        
        // NOTE: This only deletes the list from memory and DOM. Does not select new list!
        deleteList(listIndex);
    })
}

getLists();