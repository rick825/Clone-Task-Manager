// Reload the page if 'forceReload=true' is present in the URL
if (window.location.search.includes('forceReload=true')) {
  window.location.reload(true);
}

// Function to show/hide modals
function showAddModal(showModal, hideModal) {
  const addModal = document.querySelector(`.${showModal}`);
  const hideModalElement = document.querySelector(`.${hideModal}`);

  // Add 'modal-show' class to show the modal and remove it from the hidden modal
  addModal.classList.add("modal-show");
  hideModalElement.classList.remove("modal-show");
}

// Function to show the 'Add Task' modal
function showAddTaskModal() {
  showAddModal('add-task-modal', 'add-category-modal');
}

// Function to show the 'Add Category' modal
function showAddCategoryModal() {
  showAddModal('add-category-modal', 'add-task-modal');
}

// Function to show the 'Edit Task' modal
function showEditTaskModal(taskid,defaultValues) {
  console.log("Task ID-->", taskid);
  const editTaskForm = document.getElementById('edit-task-form');
  editTaskForm.action = `/api/editTask/${taskid}`;
  populateEditTaskForm(defaultValues);
  showAddModal('edit-task-modal', 'add-task-modal');
}

function populateEditTaskForm(defaultValues) {
  document.getElementById('editname').value = defaultValues.name || '';
  
  var defaultDate = new Date(defaultValues.date || '');  
  if (!isNaN(defaultDate.getTime())) {
    var timeZoneOffset = defaultDate.getTimezoneOffset();
    defaultDate.setMinutes(defaultDate.getMinutes() - timeZoneOffset);

    document.getElementById('editdate').valueAsDate = defaultDate;
  }

  document.getElementById('editcategory').value = defaultValues.category || '';

  document.getElementById('editname').placeholder = defaultValues.name || '';
  document.getElementById('editdate').placeholder = defaultValues.date || '';

  console.log("Default Values-->",defaultValues.name,defaultValues.date,defaultValues.category);
  console.log("values & Placeholder",document.getElementById('editdate').value," & ", document.getElementById('editdate').placeholder )
}


const closemodal = () => {
  console.log("Close Modal");
  document.querySelectorAll('.modal').forEach(model => model.classList.remove("modal-show"));
}


document.addEventListener('click', (event) => {
  const modalContent = document.querySelector('.modal-content');
  if (modalContent && !modalContent.contains(event.target)) {
    closemodal();
  }
});

const markCompleted = (taskId) =>{
  updateTaskCompletedStatus(taskId);
}

function updateTaskCompletedStatus(taskId) {

  const url = `/api/tasks/${taskId}/complete`;

 
  fetch(url, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      
      body: JSON.stringify({
          completed: true,
      }),
  })
  .then(response => response.json())
  .then(data => {
      console.log(`data->`,data);
  })
  .catch(error => {
      console.error('Error marking task as completed:', error);
  });
}
