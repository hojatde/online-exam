function sendInfo(e) {
    var formElement = Object.assign(e.parentElement);   
    const prog = document.getElementById('prog');   
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    const valueClassId = document.getElementById('classId').value;
    xhr.open("POST", "/class/" + valueClassId + "/exam/answer", true);
    const progressBar = document.getElementById('progressBar');
    progressBar.style.display = 'block';
    xhr.upload.onprogress = function(event) {
        if (event.lengthComputable) {
          var percentage = (event.loaded / event.total) * 100;
          prog.value = percentage;
        }
    };

    xhr.onerror = function(err) {
        console.log('Error');
        console.log(err);
        alert('خطایی رخ داده است لطفا اتصال اینترنت خود را برسی کنید و مجددا تلاش کنید.');
    };

    xhr.onload = function () {
        console.log(this.statusText)
        if (this.statusText === 'OK') {
            progressBar.style.display = 'none';
            prog.value = 0;
            const status = this.response.status;
            if (status === 'error') {
                showAlert(this.response.message, 2);
            }else if (status === 'ok') {
                showAlert(this.response.message, 1);
            }
            setTimeout(() => {
                window.location.href = '/student/sucssefully'
            },1000)
        }
    }
    const form = new FormData(formElement);
    xhr.send(form);
    
    
}