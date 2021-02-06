function deleteUser(id) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState === 4 && xhttp.status === 200) {
            window.location.reload();
        }
    };
    xhttp.open("POST", "/deleteUser", true);
    xhttp.setRequestHeader("userId", id);
    xhttp.send();
}

function goToEdit(id) {
    window.location.href = `/editUser?userid=${id}`;
}

function sortAsc() {
    window.location.href = "/sortAsc";
}

function sortDesc() {
    window.location.href = "/sortDesc";
}
