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
/*var sectionTemplate = '<div id="'+sectionId+'" class="card w-100">'
    + '<div class="card-header text-right">'
    + '<a href="#" data-toggle="modal" data-target="#sectionModal" data-section="'+sectionId+'">...</a>'
    + '</div>'
    + '<div class="card-body">'
    + '<h4 class="card-title">'+sectionTitle+'</h4>'
    + '<p class="card-text">'+sectionText+'</p>'
    + '<div id="'+sectionId+'Options"</div>'
    + '</div>'
    + '</div>'
*/

$(document).ready(function(){
    $.each(story["story1id"], function(key, value){
        $("h1").text(value["styTitle"]);
        var sectionNumber = key + 1;
        $.each(value["section"+sectionNumber], function(k, v){
            if (k == 'title') {
                sectionTitle = v != "" ? v : "Section "+sectionNumber;
            }
            if (k == 'text') {
                sectionText = v != "" ? v : "";
            }
        });

        sectionId = "section"+sectionNumber;

            var sectionTemplate = '<div id="'+sectionId+'" class="card w-100">'
            + '<div class="card-header text-right">'
            + '<a href="#" data-toggle="modal" data-target="#sectionModal" data-section="'+sectionId+'">...</a>'
            + '</div>'
            + '<div class="card-body">'
            + '<h4 class="card-title">'+sectionTitle+'</h4>'
            + '<p class="card-text">'+sectionText+'</p>'
            + '<div id="'+sectionId+'Options"</div>'
            + '</div>'
            + '</div>';
        
            $("#sectionContainer").append(sectionTemplate);
    })
})

$( '#sectionForm' ).submit(function( event ) {
    event.preventDefault();
    console.log( $( this ).serializeArray() );
    var formData = $( this ).serializeArray();
    var dataObject = {
        "optionSelect": []
    };
    $.each(formData, function(key, value){
        if (value["name"] == "optionSelect") {
            dataObject[value["name"]].push(value["value"]);
        } else {
            dataObject[value["name"]] = value["value"];
        }
    })
    console.log(dataObject)
    story["story1id"][0][dataObject["sectionId"]]["title"] = dataObject["title"];
    story["story1id"][0][dataObject["sectionId"]]["text"] = dataObject["storyFraction"];
    $.each(dataObject["optionSelect"], function(k, v){
        story["story1id"][0][dataObject["sectionId"]]["objects"].push(dataObject["optionSelect"][k]);
        var secNum = k + 2;
        story["story1id"][0]["section"+secNum] = {
                "title": "",
                "text": "",
                "objects": [

                ]
            }
    })
    console.log(story);
    updateSections();
    return false;
});

$('#sectionModal').on('shown.bs.modal', function (event) {
    var edit = $(event.relatedTarget); // Button that triggered the modal
    var recipient = edit.data('section'); // Extract info from data-* attributes
     // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    var section = $('#'+recipient)[0];
    var modal = $(this);
    modal.find('#title').val($(section).find('.card-title').text());
    modal.find('#storyFraction').val($(section).find('.card-text').text());
    modal.find('#sectionId').val(recipient);
    $('#title').focus()
});

function updateSections() {
     $("#sectionContainer").empty();
    $.each(story["story1id"][0], function(k, v){
        if (k != 'storyTitle') {
            $.each(v, function (l, w){
                if (l == 'title') {
                    sectionTitle = w != "" ? w : k;
                }
                if (l == 'text') {
                    sectionText = w != "" ? w : "";
                }
            })

            sectionId = k;

            var sectionTemplate = '<div id="'+sectionId+'" class="card w-100">'
            + '<div class="card-header text-right">'
            + '<a href="#" data-toggle="modal" data-target="#sectionModal" data-section="'+sectionId+'">...</a>'
            + '</div>'
            + '<div class="card-body">'
            + '<h4 class="card-title">'+sectionTitle+'</h4>'
            + '<p class="card-text">'+sectionText+'</p>'
            + '<div id="'+sectionId+'Options"</div>'
            + '</div>'
            + '</div>';
        
            $("#sectionContainer").append(sectionTemplate);
            
        }
    });
}