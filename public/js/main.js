function showAlert(massage,x) {
    const massageBox = document.getElementById('showMessage');
    showMessage.style.display = 'block';
    if (x === 1) {
        showMessage.firstElementChild.textContent = massage;
        showMessage.firstElementChild.style.display = 'block';
        setTimeout(() => {
            showMessage.firstElementChild.textContent = '';
            showMessage.style.display = 'none';
            showMessage.firstElementChild.style.display = 'none';
        }, 1000)
    } else if (x === 2) {
        showMessage.lastElementChild.textContent =massage;
        showMessage.lastElementChild.style.display = 'block';
        setTimeout(() => {
            showMessage.lastElementChild.textContent = '';
            showMessage.style.display = 'none';
            showMessage.lastElementChild.style.display = 'none';
        }, 1000)
    }
}