var REST_PREFIX = "rest/v1";
var FILE_UPLOAD_URL = "public/file-upload";

function createFileUploader(FileUploader, toaster, onSuccessItem) {
    var fileUploader = new FileUploader({
        url: FILE_UPLOAD_URL,
        headers: {
            'Async-Request': true
        },
        isHTML5: true,
        autoUpload: true,
        onErrorItem: function (item, response, status, headers) {
            if (status == 413) {
                popMessage(toaster, 'error', 'File size exceeds the limit.');
            } else {
                popMessage(toaster, 'error', 'Failed to upload the file.');
            }
        },
        onSuccessItem: function (item, response, status, headers) {
            onSuccessItem && onSuccessItem(response);
        },
        onAfterAddingFile: function (fileItem) {
            var files = this.queue;
            if (files && files.length) {
                this.file = files[files.length - 1].file;
            }
        }
    });

    FileUploader.FileSelect.prototype.isEmptyAfterSelection = function () {
        return true;
    };

    return fileUploader;
}

function popMessage(toaster, type, message, timeout) {
    toaster.pop({
        type: type,
        body: 'bind-unsafe-html',
        bodyOutputType: 'directive',
        directiveData: {
            message: message
        },
        timeout: timeout? timeout: 5000
    });
}

function removeFromList(entity, entities) {
    var index = entities.indexOf(entity);
    index != -1 && entities.splice(index, 1);
}

function formatMinutes(minutes) {
    if (minutes == 0) {
        return "0";
    }

    if (minutes > 60) {
        var hours = parseInt(minutes / 60);
        minutes = minutes % 60;
        return hours + "h " + minutes + "m";
    }
    return minutes + "m";
}

function getPagedEntities(entities, itemsPerPage, currentPage) {
    if (itemsPerPage < 1) {
        itemsPerPage = 1;
    }
    if (entities.length == 0 || entities.length <= itemsPerPage) {
        return entities;
    }
    if (currentPage < 1) {
        currentPage = 1;
    }

    var startIndex = (currentPage - 1) * itemsPerPage;
    var endIndex = currentPage * itemsPerPage;

    if (startIndex < 0) {
        startIndex = 0;
    }
    if (startIndex >= entities.length) {
        startIndex = entities.length - 1;
    }
    if (endIndex > entities.length) {
        endIndex = entities.length;
    }

    return entities.slice(startIndex, endIndex);
}
