function upload() {
    var formData = new FormData();
    var file = document.getElementById('image').files[0];
    formData.append('image', file);
    var xhr = new XMLHttpRequest();
    const prog = document.getElementById('prog');

    // your url upload
    xhr.open('put', '/teacher/upload', true);

    xhr.upload.onprogress = function(e) {
      if (e.lengthComputable) {
        var percentage = (e.loaded / e.total) * 100;
        prog.value = percentage;
        console.log(percentage + "%");
      }
    };

    xhr.onerror = function(e) {
      console.log('Error');
      console.log(e);
    };
    xhr.onload = function() {
      console.log(this.statusText);
    };

    xhr.send(formData);
}
function newUpload() {
    var formData = new FormData();
    var file = document.getElementById('image').files[0];
    var text = document.getElementById('text').value;
    const classId = document.getElementById('classId').value;
    const examId = document.getElementById('examId').value;
    formData.append('image', file);
    formData.append('examId', examId);
    formData.append('text', text);

    console.log(formData)
    var xhr = new XMLHttpRequest();

    // your url upload
    xhr.open('put', '/teacher/upload', true);

    xhr.upload.onprogress = function(e) {
      if (e.lengthComputable) {
        var percentage = (e.loaded / e.total) * 100;
        console.log(percentage + "%");
      }
    };

    xhr.onerror = function(e) {
      console.log('Error');
      console.log(e);
    };
    xhr.onload = function() {
      console.log(this.statusText);
    };

    xhr.send(formData);
}