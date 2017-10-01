var story = {
    "story1id": [
        {
            "storyTitle": "Story 1",
            "section1": {
                "title": "",
                "text": "",
                "objects": [

                ]
            }
        }
    ]
}

var sectionId, sectionTitle, sectionText;
var sectionTemplate = '<div id="'+sectionId+'" class="card w-100">'
    + '<div class="card-header text-right">'
    + '<a href="#" data-toggle="modal" data-target="#sectionModal" data-section="'+sectionId+'">...</a>'
    + '</div>'
    + '<div class="card-body">'
    + '<h4 class="card-title">'+sectionTitle+'</h4>'
    + '<p class="card-text">'+sectionText+'</p>'
    + '<div id="'+sectionId+'Options"'
    + '</div>'
    + '</div>'
    + '</div>'

$(document).ready(function(){
    $.each(story["story1id"], function(key, value){
        $("h1").text(value["storyTitle"]);
        var sectionNumber = key + 1;
        $.each(value["section"+sectionNumber], function(k, v){
            if (k == 'title') {
                sectionTitle = v ? v : "Section "+sectionNumber;
            }
            if (k == 'text') {
                sectionText = v ? v : "";
            }

            sectionId = "section"+sectionNumber;
        });
        $("#sectionContainer").append(sectionTemplate);
    })
})







$('#sectionModal').on('shown.bs.modal', function (event) {
    var edit = $(event.relatedTarget); // Button that triggered the modal
    var recipient = edit.data('section'); // Extract info from data-* attributes
     // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    var section = $('#'+recipient)[0];
    var modal = $(this);
    modal.find('#title').val($(section).find('.card-title').text());
    modal.find('#storyFraction').val($(section).find('.card-text').text())
    $('#title').focus()
});

