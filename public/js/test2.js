async function test2() {
    const form = document.getElementById("form");
    var newForm = new FormData();
    newForm = form;
    let response = await fetch('teacher/test2', {
        method: 'POST',
        body:newForm
    })
    
    const reader = response.body.getReader();

    const conteentLength = +response.headers.get('Content-Length');

    let reciverLength = 0;
    let chuncks = [];
    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            console.log('completly');
            return;
        }
        chuncks.push(value);
        reciverLength += value.length;
        console.log('progress : ' + reciverLength);
    }
    
}