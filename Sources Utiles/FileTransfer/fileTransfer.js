document.querySelector('input[type=file]').onchange = function() {
    var file = this.files[0];
};

var reader = new window.FileReader();
reader.readAsDataURL(file);
reader.onload = onReadAsDataURL;

var chunkLength = 1000;

function onReadAsDataURL(event, text) {
    var data = {}; // data object to transmit over data channel

    if (event) text = event.target.result; // on first invocation

    if (text.length > chunkLength) {
        data.message = text.slice(0, chunkLength); // getting chunk using predefined chunk length
    } else {
        data.message = text;
        data.last = true;
    }

    dataChannel.send(data); // use JSON.stringify for chrome!

    var remainingDataURL = text.slice(data.message.length);
    if (remainingDataURL.length) setTimeout(function () {
        onReadAsDataURL(null, remainingDataURL); // continue transmitting
    }, 500)
}

var arrayToStoreChunks = [];
dataChannel.onmessage = function (event) {
    var data = JSON.parse(event.data);

    arrayToStoreChunks.push(data.message); // pushing chunks in array

    if (data.last) {
        saveToDisk(arrayToStoreChunks.join(''), 'fake fileName');
        arrayToStoreChunks = []; // resetting array
    }
};

document.querySelector('input[type=file]').onchange = function () {
    var file = this.files[0];
    dataChannel.send(file);
};

dataChannel.onmessage = function (event) {
    var blob = event.data; // Firefox allows us send blobs directly

    var reader = new window.FileReader();
    reader.readAsDataURL(blob);
    reader.onload = function (event) {
        var fileDataURL = event.target.result; // it is Data URL...can be saved to disk
        SaveToDisk(fileDataURL, 'fake fileName');
    };
};

function saveToDisk(fileUrl, fileName) {
    var save = document.createElement('a');
    save.href = fileUrl;
    save.target = '_blank';
    save.download = fileName || fileUrl;

    var event = document.createEvent('Event');
    event.initEvent('click', true, true);

    save.dispatchEvent(event);
    (window.URL || window.webkitURL).revokeObjectURL(save.href);
}