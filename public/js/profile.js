const editButton = document.getElementById('editButton');
const editForm = document.getElementById('editForm');

editButton.addEventListener('click', () => {
    if (editForm.style.display === 'none') {
        editForm.style.display = 'block';
        editButton.textContent = 'Cancel';
    } else {
        editForm.style.display = 'none';
        editButton.textContent = 'Edit Profile';
    }
});

function updateProfile() {
    fetch('/updateProfile', {
        method: 'POST',
        body: JSON.stringify({
            username: document.getElementById('username').value,
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            gender: document.getElementById('gender').value,
            age: document.getElementById('age').value,
            oldPassword: document.getElementById('oldPassword').value,
            newPassword: document.getElementById('newPassword').value,
            updatedAt: new Date().toISOString()
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => response.json()).then(data => {
        if (data.success) {
            alert('Profile updated successfully');
        } else {
            alert('Failed to update profile');
        }
    }).catch(error => {
        console.error('Error:', error);
    });
}