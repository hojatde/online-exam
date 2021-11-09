

function upload(e) {
  const fromClassId = document.getElementById('formClassId').value;
  const formExamId = document.getElementById('formExamId').value;

  var formElement = Object.assign(e.parentElement);
  const inputClassId = document.createElement('input');
  inputClassId.setAttribute('type', 'hidden');
  inputClassId.setAttribute('name', 'classId');
  inputClassId.setAttribute('value', fromClassId)
  formElement.appendChild(inputClassId);

  const inputExamId = document.createElement('input');
  inputExamId.setAttribute('type', 'hidden');
  inputExamId.setAttribute('name', 'examId');
  inputExamId.setAttribute('value', formExamId)
  formElement.appendChild(inputExamId);

  var xhr = new XMLHttpRequest();
  xhr.responseType = 'json';
  const prog = document.getElementById('prog');

  if (e.value === 'newQuestion') {
    xhr.open("POST", "/teacher/class/" + fromClassId + "/exam/editExam?edit=false&delete=false&new=true", true);
    formElement = formElement.parentElement;
  } else if(e.value==='editQuestion'){
    xhr.open("POST", "/teacher/class/"+fromClassId+"/exam/editExam?edit=true&delete=false&new=false", true);
  } else if (e.value === 'deleteQuestion') {
    xhr.open("POST", "/teacher/class/"+fromClassId+"/exam/editExam?edit=false&delete=true&new=false", true);
  }
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
    const progressBar = document.getElementById('progressBar');
    prog.value = 0;
    progressBar.style.display = 'none';
    if (this.statusText === 'OK') {
      const showMessage = document.getElementById('showMessage');
      const status = this.response.status;
      console.log(this.response.message)
      if (status === 'error') {
        showAlert(this.response.message, 2);
      } else {
        showAlert(this.response.message, 1);
        if (status === 'deleteQuestion') {
          const center = document.getElementById('center');
          e.parentElement.parentElement.remove()
          const numbersQuestion = document.getElementsByClassName('numberOfQuestion');
          for (let i = 0; i < numbersQuestion.length; i++){
            numbersQuestion[i].textContent = i + 1;
          }
        } else if (status === 'newQuestion') {
          const newDiv = document.createElement('div');
          newDiv.setAttribute('class', 'question');
          newDiv.setAttribute('id', 'boxQuestion');
          const newLabel = document.createElement('h4');
          newLabel.setAttribute('class', 'numberOfQuestion');
          const question = document.createElement('form');
          question.setAttribute('method','POST')
          const inputQuestionId = document.createElement('input');
          inputQuestionId.setAttribute('type', 'hidden');
          inputQuestionId.setAttribute('name', 'questionId');
          inputQuestionId.setAttribute('value', this.response.questionId);
          question.appendChild(inputQuestionId);
  
          const text = document.createElement('textarea');
          text.cols = 43;
          text.rows = 3;
          text.innerText = this.response.questionText;
          question.appendChild(text);
    
          if (this.response.imgUrl) {
            const image = document.createElement('img');
            image.className = 'img';
            image.src = '/'+this.response.imgUrl;
            question.appendChild(image);
          }
  
          const editButton = document.createElement('button');
          editButton.setAttribute('type', 'button');
          editButton.setAttribute('value', 'editQuestion');
          editButton.setAttribute('onclick', 'upload(this)');
          editButton.setAttribute('id','edit')
          editButton.textContent = 'ویرایش';
          question.appendChild(editButton);
  
          const deleteButton = document.createElement('button');
          deleteButton.setAttribute('type', 'button');
          deleteButton.setAttribute('value', 'deleteQuestion');
          deleteButton.setAttribute('onclick', 'upload(this)');
          deleteButton.setAttribute('id','deleteButton')
          deleteButton.textContent = 'حذف';
          question.appendChild(deleteButton);
  
          const center = document.getElementById('center');
          newLabel.textContent = center.childElementCount - 2 + ' :';
          newDiv.appendChild(newLabel);
          newDiv.appendChild(question);
  
          const newBox = document.getElementById('newQuestion2');
          center.insertBefore(newDiv, newBox);
        } else if (status === 'editQuestion') {
          const newText = this.response.newText;
          const formBox = e.parentElement.children;
          for (let i = 0; i < formBox.length; i++){
            if (formBox[i].name === 'text') {
              formBox.textContent = this.response.newText;
              break;
            }
          }
        }
      }
    }
  };
  
    
  const form = new FormData(formElement);
  xhr.send(form);
}

function sendInfo() {
  
  const currentHref = window.location.href;
  var url = new URL(currentHref);
  var seacrh_params = url.searchParams;

  seacrh_params.append('id', '5');
  seacrh_params.set('exam','asdsa')
  url.search = seacrh_params.toString();
  console.log(url.searchParams)
  var newUrl = url.toString();
  console.log(newUrl)
  // var seacrhParams = new_url.searchParams();
  // console.log(seacrhParams);

}
//alert