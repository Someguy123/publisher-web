var mediaFiles = [];
var extraFiles = [];

$("#posterFile").change(function(input){
    var files = input.files ? input.files : input.currentTarget.files;
    if (files) {
        var reader = new FileReader();

        reader.onload = function (e) {
            document.getElementById('poster').style.backgroundImage =  "url('" + e.target.result + "')";
            document.getElementById('posterText').innerHTML = '';
        }

        reader.readAsDataURL(files[0]);
    }
})

// getElementById
function $id(id) {
    return document.getElementById(id);
}

//
// output information
function Output(msg) {
    console.log(msg)
}
// call initialization file
if (window.File && window.FileList && window.FileReader) {
    Init();
}

//
// initialize
function Init() {

    var mediaselect = $id("mediaFiles"),
        extraselect = $id("extraFiles"),
        mediadrag = $id("mediaDrop"),
        extradrag = $id("extraDrop");

    // file select
    mediaselect.addEventListener("change", FileSelectHandler, false);
    extraselect.addEventListener("change", FileSelectHandler, false);

    // is XHR2 available?
    var xhr = new XMLHttpRequest();
    if (xhr.upload) {
    
        // media drop
        mediadrag.addEventListener("dragover", FileDragHover, false);
        mediadrag.addEventListener("dragleave", FileDragHover, false);
        mediadrag.addEventListener("drop", FileSelectHandler, false);
        mediadrag.style.display = "block";

        // extra drop
        extradrag.addEventListener("dragover", FileDragHover, false);
        extradrag.addEventListener("dragleave", FileDragHover, false);
        extradrag.addEventListener("drop", FileSelectHandler, false);
        extradrag.style.display = "block";
        
        // hide file select button
        //fileselect.style.height = 0;
        //fileselect.style.width = 0;
        //$('#mediaFiles').trigger('click');
    }

}

// file selection
function FileSelectHandler(e) {
    console.log(e);

    // cancel event and hover styling
    FileDragHover(e);

    // fetch FileList object
    var files = e.target.files || e.dataTransfer.files;

    // process all File objects
    for (var i = 0, f; f = files[i]; i++) {
        if (e.srcElement.id == "mediaDrop" || e.srcElement.id == "mediaFiles"){
            if (f.type.indexOf('video') > -1)
                ParseMedia(f);
            else
                swal('Error', 'You can only select video files for the media browser', 'error');
        }
        else
            ParseExtra(f);
    }

}


// file drag hover
function FileDragHover(e) {
    e.stopPropagation();
    e.preventDefault();
    if (e.target.id == 'mediaDrop')
        e.target.className = (e.type == "dragover" ? "upload-area hover" : "upload-area");
    else if (e.target.id == 'extraDrop')
        e.target.className = (e.type == "dragover" ? "upload-area hover" : "upload-area");
}

function ParseExtra(file) {
    // Show the two tables by default now that we have a file.
    $('#pricing').show();
    $('#extraTable').show();

    // Add file to array
    extraFiles.push(file);

    console.log(file);
    var tableLength = $('#extraTable tr').length-1;

    $('#extraTable tr:last').after(
        '<tr id="' + file.name.split('.').join('') + '">' +
            '<td>' + tableLength + '</td>' +
            '<td>' + file.name + '</td>' +
            '<td>' +
                '<select class="form-control" id="type">' +
                    '<option>Artwork</option>' +
                    '<option>Zip File</option>' +
                '</select>' +
            '</td>' +
            '<td><input type="text" class="form-control" id="name" value="' + file.name + '"></td>' +
            '<td><button type="button" class="btn btn-danger btn-sm" onclick="removeRow(\'' + sanitizeID(file.name) + '\')">x</button></td>' +
       '</tr>');
    AddPricingRow(file);
    
}

function ParseMedia(file) {
    // Show the two tables by default now that we have some media.
    $('#pricing').show();
    $('#mediaFilesTable').show();

    // Add file to array
    mediaFiles.push(file);

    console.log(file);
    var tableLength = $('#mediaFilesTable tr').length-1;

    // Get length if video
    var video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = function() {
        console.log('hi');
        window.URL.revokeObjectURL(this.src)
        duration = video.duration;
        console.log(duration);
        $('#' + file.name + ' td:eq(3)').html(video.duration);
    }
    video.src = URL.createObjectURL(file);
    $('#mediaFilesTable tr:last').after(
        '<tr id="' + sanitizeID(file.name) + '">' +
            '<td>' + tableLength + '</td>' +
            '<td>' + file.name + '</td>' +
            '<td>' + humanFileSize(file.size, true) + '</td>' +
            '<td>...</td>' +
            '<td><input type="text" class="form-control" id="name" value="' + file.name + '"></td>' +
            '<td><button type="button" class="btn btn-danger btn-sm" onclick="removeRow(\'' + sanitizeID(file.name) + '\')">x</button></td>' +
        '</tr>');
    AddPricingRow(file);
}

function AddPricingRow(file){
    $('#pricingTable tr:last').after(
    '<tr id="' + sanitizeID(file.name) + 'price">' +
        '<td style="width:20%">' + file.name + '</td>' +
        '<td>' +
            '<div class="input-group">' +
                '<div class="input-group-addon">$</div>' +
                '<input type="text" class="form-control" id="sugPlay" onblur="validatePricing(\'' + sanitizeID(file.name) + '\')" placeholder="0.000">' +
            '</div>' +
        '</td>' +
        '<td>' +
            '<div class="input-group">' +
                '<div class="input-group-addon">$</div>' +
                '<input type="text" class="form-control" id="minPlay" onblur="validatePricing(\'' + sanitizeID(file.name) + '\')" placeholder="0.000">' +
            '</div>' +
       '</td>' +
        '<td>' +
            '<div class="input-group">' +
                '<div class="input-group-addon">$</div>' +
                '<input type="text" class="form-control" id="sugBuy" onblur="validatePricing(\'' + sanitizeID(file.name) + '\')" placeholder="0.000">' +
            '</div>' +
        '</td>' +
        '<td>' +
            '<div class="input-group">' +
                '<div class="input-group-addon">$</div>' +
                '<input type="text" class="form-control" id="minBuy" onblur="validatePricing(\'' + sanitizeID(file.name) + '\')" placeholder="0.000">' +
            '</div>' +
        '</td>' +
        '<td style="width:15%"><input type="checkbox" id="disPlay" onclick="checkboxToggle(\'' + sanitizeID(file.name) + '\', \'play\')"> Disallow Play' +
        '<br><input type="checkbox" id="disBuy" onclick="checkboxToggle(\'' + sanitizeID(file.name) + '\', \'buy\')"> Disallow Buy</td>' +
    '</tr>');
}

function humanFileSize(bytes, si) {
    var thresh = si ? 1000 : 1024;
    if(Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }
    var units = si
        ? ['kB','MB','GB','TB','PB','EB','ZB','YB']
        : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
    var u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while(Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1)+' '+units[u];
}

function removeRow(name){
    $('#' + name).remove();
    $('#' + name + 'price').remove();

    for (var i = 0; i < mediaFiles.length; i++) {
        if (sanitizeID(mediaFiles[i].name) == name)
            mediaFiles.splice(i, 1);
    }

    for (var i = 0; i < extraFiles.length; i++) {
        if (sanitizeID(extraFiles[i].name) == name)
            extraFiles.splice(i, 1);
    }

    if (mediaFiles.length == 0)
        $('#mediaFilesTable').hide();

    if (extraFiles.length == 0)
        $('#extraTable').hide();

    if (extraFiles.length == 0 && mediaFiles.length == 0)
        $('#pricing').hide();
}

function sanitizeID(name){
    return name.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\s]/gi, '');
}

function validatePricing(id){
    // Round to 3 digits
    $('#' + id + 'price #sugPlay').val(parseFloat($('#' + id + 'price #sugPlay').val()).toFixed(3));
    // If it was empty, just replace it to be empty again
    if($('#' + id + 'price #sugPlay').val() == "NaN" || $('#' + id + 'price #sugPlay').val() == 0)
        $('#' + id + 'price #sugPlay').val("");
    // If it was just filled, uncheck the checkbox
    else
        $('#' + id + 'price #disPlay').prop("checked", false);

    $('#' + id + 'price #minPlay').val(parseFloat($('#' + id + 'price #minPlay').val()).toFixed(3));
    if($('#' + id + 'price #minPlay').val() == "NaN" || $('#' + id + 'price #minPlay').val() == 0)
        $('#' + id + 'price #minPlay').val("");
    else
        $('#' + id + 'price #disPlay').prop("checked", false);

    $('#' + id + 'price #sugBuy').val(parseFloat($('#' + id + 'price #sugBuy').val()).toFixed(3));
    if($('#' + id + 'price #sugBuy').val() == "NaN" || $('#' + id + 'price #sugBuy').val() == 0)
        $('#' + id + 'price #sugBuy').val("");
    else
        $('#' + id + 'price #disBuy').prop("checked", false);

    $('#' + id + 'price #minBuy').val(parseFloat($('#' + id + 'price #minBuy').val()).toFixed(3));
    if($('#' + id + 'price #minBuy').val() == "NaN" || $('#' + id + 'price #minBuy').val() == 0)
        $('#' + id + 'price #minBuy').val("");
    else
        $('#' + id + 'price #disBuy').prop("checked", false);
}

function checkboxToggle(id, checkbox){
    // Check if the play button was just toggled, if it was check to make sure that it was toggled on.
    if (checkbox == 'play' && $('#' + id + 'price #disPlay').is(':checked')){
        // Clear the play pricing, this shortens the publisher JSON
        $('#' + id + 'price #sugPlay').val("");
        $('#' + id + 'price #minPlay').val("");
        // Uncheck the buy if it is checked, one of them must be unchecked
        if ($('#' + id + 'price #disBuy').is(':checked'))
            $('#' + id + 'price #disBuy').prop("checked", false);
    }

    // Check if the buy button was just toggled, check to make sure that it was toggled on.
    if (checkbox == 'buy' && $('#' + id + 'price #disBuy').is(':checked')){
        // Clear the play pricing, this shortens the publisher JSON
        $('#' + id + 'price #sugBuy').val("");
        $('#' + id + 'price #minBuy').val("");
        // Uncheck the buy if it is checked, one of them must be unchecked
        if ($('#' + id + 'price #disPlay').is(':checked'))
            $('#' + id + 'price #disPlay').prop("checked", false);
    }
}