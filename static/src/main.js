// list of tokenized previous dialogue turns 
let msg_list = [] 
// decoding parameters
let top_k = 20 
let mmi_temp = 0.7
let forward_temp = 1.0
let asked = false 

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

$(document).ready(function () {

    if (iniFrame()){
        removeContentsForiFrame(); 
    }

    $("#userID").css("display", "none")
    // refresh dialogue history 
    $("#restart").click(reset_dialogue); 

    $("#instructions").click(function(e){
        e.stopPropagation(); 
    })

    $("#close-button").click(function(e){
        $("#instructions").fadeOut(100); 
    })

    $("#info-button").click(function(e){
        e.stopPropagation(); 
        $("#instructions").fadeIn(100); 
    })

    $("#submission-div").hover(function(){
        $("#submission-info").fadeIn(500); 
    }, function(){
        $("#submission-info").fadeOut(500); 
    })

    // $("#user-input").focus(); 

    $("#submit-button").click(async function(){
        save_to_db(); 
        $(this).prop("disabled", "true");

        await sleep(5000); 

        $(this).removeAttr("disabled");

    })

    // send request when enter key is pressed
    $("#user-input").on("keyup", function(event){
        // console.log(event.keyCode); 
        // e.stopPropagation(); 
        if ($(this).val() != ""){
            $("#sendbutton").removeAttr("disabled")
        }
        else{
            $("#sendbutton").prop("disabled", "true");
        }

        if (event.keyCode == 13 && $(this).val() != ""){
            send_request(); 
            $("#first-turn").prop("disabled", "true");
        }
    })

    $("body").on("keydown", function(event){
        if(document.activeElement.id=="user_id" || document.activeElement.id=="myModel"){
            //$("#myModal").focus()
            $("#user_id").focus()
        }
        else{
            $("#user-input").focus(); 
            if ($("#submit-message").css("display") != 'none'){
                $("#submit-message").fadeOut(300); 
            }

            if ($("#submit-notify").css("display") != "none"){
                $("#submit-notify").fadeOut(100); 
                $("#red-arrow").fadeOut(100);
                $("#submission-div").removeClass("highlight"); 
                $(".panel-container").css({"opacity": "1"})
                $(".header").css({"opacity": "1"})
            }
        }
    })

    $(".prompt-select").click(function(e){
        e.stopPropagation(); 
        // $(".prompt-dropdown").toggleClass("hide");
        $(".prompt-dropdown").fadeToggle(100); 
        // update_scroll(); 
    }); 

    $(document).click(function(){
        if ($(".prompt-dropdown").css('display') != 'none'){
            // $(".prompt-dropdown").toggleClass("hide");
            $(".prompt-dropdown").fadeOut(100); 
        }

        if ($(".dropdown").css('display') != 'none'){
            // $(".dropdown").toggleClass("hide");
            $(".dropdown").fadeOut(100); 
            $(".selected-message").toggleClass("select-toggled"); 
        }

        if ($("#instructions").css("display") != 'none'){
            $("#instructions").fadeOut(100); 
        }

        if ($("#submit-message").css("display") != 'none'){
            $("#submit-message").fadeOut(300); 
        }

        if ($("#submit-notify").css("display") != "none"){
            $("#submit-notify").fadeOut(100);
            $("#red-arrow").fadeOut(100);
            $(".panel-container").css({"opacity": "1"})
            $(".header").css({"opacity": "1"})
        }
    })

    

    $(".prompt-choice").click(function(e){
        e.stopPropagation(); 

        first_msg = $(this).html(); 
        if (first_msg != $(".prompt-chosen").html()){
            $("#user-input").val(first_msg); 
            send_request();  
        }
        else{
            $("#user-input").focus(); 
        }
        
        // $(".prompt-dropdown").toggleClass("hide");
        $(".prompt-dropdown") .fadeToggle(100); 

    });

    $(".form-control-range").mousemove(function(){

        $(this).parent().find('.decoder-parameter-value').text($(this).val()); 
    }); 

    // send on click of send button 
    $("#sendbutton").click(send_request);

    // set which elements to toggle 
    set_toggle_functions(); 

    // actions to take while ajax request takes place 
    $(document).ajaxStart(function () {
        $("#sendbutton").prop("disabled", "true");
        $("#restart").prop("disabled", "true");
        $("#data-check-box").prop("disabled", "true");
    }).ajaxStop(function () {
        set_toggle_functions(); 
        $("#restart").removeAttr("disabled");
    });

});

function add_userID(){
    var value2 = {"user_id":"123456","username":"coolcooldool"};
    //var obj2 = eval(value2);
    value2.user_id=$("#user_id").val();
    $("#act").val("edit");
    $('#user_id').attr("readonly","readonly");
    //$("#user-input").removeAttr('disabled');
    var h = document.createElement("div")
    h.setAttribute("id", "userID");
    h.setAttribute("value", $("#user_id").val())
    $("#myModal-close").click();
    $("#user-input").focus();
}

function userId_focus(){
    //$("#user-input").prop('disabled');
    //$("#myModal").focus()
    $("#user_id").focus()
}

function set_toggle_functions(){

    $(".selected-message").click(function(e){
        e.stopPropagation(); 
        // $(".dropdown").toggleClass("hide");
        $(".dropdown").fadeToggle(100); 
        $(".selected-message").toggleClass("select-toggled");
        update_scroll(); 
    }); 

    $(".choice").click(function(e){
        e.stopPropagation(); 

        // if retry was chosen, automatically send new request 
        if ($(this).text().trim() == "Retry"){
            $("li.clearfix").last().remove(); 
            send_request(); 
        }
        else{
            $(".choice").removeClass("chosen"); 
            $(".selected-option").html($(this).html()); 
            $(this).addClass("chosen"); 
            // $(".dropdown").toggleClass("hide");
            $(".dropdown").fadeToggle(100); 
            $(".selected-message").toggleClass("select-toggled");

        }
    });
};


function create_message(turn, text){

    msg_class = (turn=="left") ? "selected-message" : ""; 
    choice_class = (turn=="left") ? "selected-option" : ""; 
    
    down_button_elem = `
    <div class="drop-down-button-wrapper btn-group pull-right">
        <div class="btn-group pull-right">
            <button type="button" class="btn btn-default btn-xs" id="down-button">
                <span class="glyphicon glyphicon-chevron-down"></span>
            </button>
        </div>
    </div>`

    down_button = (turn=="left") ? down_button_elem : ''; 

    message_html = `
    <li class="${turn} clearfix">
        <div class="chat-body pull-${turn}">
            <div class="message pull-${turn} ${msg_class}"> 
                <div class="pull-${turn} ${choice_class}">
                    ${text}
                </div>
                ${down_button}
            </div> 
        </div>
    </li>`

    return $(message_html);
}

function make_ajax_call(endpoint_type, url, request_data){

    $.ajax({
        url: url,
        type: 'POST',
        dataType: 'json',
        contentType: '/generate/',
        data: request_data,
        timeout: 0, 
        crossDomain:true,
        success: function(data) {
            console.log("Received API response.");
        },
        error: function(jqxhr, status, exception) {
            console.log('Exception:', JSON.stringify(exception, null, 2));
            if (endpoint_type == "gpu"){
                console.log("try with cpu url: ", cpu_url)
                make_ajax_call("cpu", cpu_url, request_data);
            }
            else{
                console.log("failed with cpu url")
                $("#loading-text").remove(); 
                $("#loading").html("ERROR, check console.")
                $("#loading").css({"color": "red"}); 
            }
        }


    }).done(function(data){

        if (typeof data === 'string'){
            data = JSON.parse(data); 
        }

        console.log("Response:", data);
        
        // create dropdown and attach to chat 
        // let dropdown = $("<div />", {id: "dropdown"}); 
        let dropdown_select = $("<div />", {class: "dropdown"}); 

        for (let i = 0; i < data["responses"].length; i++){
            candidate = data["responses"][i][0]

            if (candidate.replace(/[^a-zA-Z]/g, "") != ""){
                option = (i==0) ? $("<div />", {class: "choice chosen choice-top", text: candidate}) : $("<div />", {class: "choice choice-border", text: candidate}) ; 
                // if (i == data["responses"].length -1 ){
                //     option.removeClass("choice-border");
                //     option.addClass("choice-bottom"); 
                // }
                option.appendTo(dropdown_select)
            }
        }

        // Add retry option
        option = $("<div class=\"choice choice-bottom\"> <span class=\"glyphicon glyphicon-repeat\"></span> Retry </div>")
        option.appendTo(dropdown_select)

        // remove loading sign 
        $("#loading").remove() 

        // create the message object append 
        system_msg = create_message("left", data["responses"][0][0]);
        dropdown_select.appendTo(system_msg.find(".chat-body")); 
        system_msg.appendTo(".chat");
        

        msg_list = data["tokenized_message_list"];
        
        update_scroll(); 
        enable_input(); 
        $(".chat-body").last().focus();
        $("#data-check-box").removeAttr("disabled") 

        if (!iniFrame()){
            ask_submission(); 
        }
    });;
}


//cpu_url = "https://spolin.isi.edu/ya_back/api";
db_url = "/database/"//"https://spolin.isi.edu/ya_back/db/";
generate_url = "/generate/"
//  Jon's AWS cluster with g4dn.xlarge spot instance endpoint's proxy url
//gpu_url = "https://g4irmlqhtd.execute-api.us-east-1.amazonaws.com/dev/ya-bot";
console.log("cpu_url: ", cpu_url);
console.log("db_url: ", db_url);
console.log("gpu_url: ", gpu_url);


function save_to_db(){

    
    db_endpoint = db_url + "insert"

    // console.log(db_endpoint)

    let now = new Date().toUTCString();

    dialogue = [] 
    chat_messages = $('.message > div')
    // console.log(chat_messages)

    //  - 1 is to ignore the drop down button attached to the last message 
    for (let i = 0; i < chat_messages.length - 1; i++){
        dialogue.push(chat_messages[i].innerText.trim())
    }

    // console.log(dialogue)

    request_data= {
        datetime: now, 
        dialogue: dialogue, 
    }

    // console.log(request_data); 

    request_data = JSON.stringify(request_data)

    $.ajax({
        url: db_endpoint,
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: request_data,
        timeout: 0, 
        crossDomain:true,
        success: function(data) {
            console.log("Successfully saved to DB.");
        },
        error: function(jqxhr, status, exception) {
            console.log('Exception:', JSON.stringify(exception, null, 2));
        }
    }).done(function(data){
        // console.log("Save to DB request done.")
        $("#submit-message").fadeIn(300); 
        $("#data-check-box").prop("checked", false); 
    });;
}

function send_request(){

    $(".prompt-select").hide();   
    $("#user-input").attr("disabled", "true"); 

    // reset new messages to be added 
    let new_msg = []; 

    // use decoding parameters that are set 
    top_k = $("#top-k-value").text();
    forward_temp = $("#forward-temp-value").text();
    mmi_temp = $("#mmi-temp-value").text();

    // first append chosen text generated by model from drop down after first turn 
    if ($(".selected-message").length) {
        chosen_candidate = $(".selected-option").text().replace("\n","").trim(); 
        $("#chosen-turn").removeClass(".selected-option"); 
        new_msg.push(chosen_candidate);
        // remove selector 
        $(".message-drop-down").remove(); 
        $(".dropdown").remove(); 
        $(".selected-option").removeClass("selected-option");
        $(".selected-message").removeClass("selected-message"); 
    }

    // add new response from user 
    let user_response = $("#user-input").val()
    if (user_response.trim() != ""){
        msg_element = create_message("right", user_response); 
        if (iniFrame()){
            msg_element.find('.message').css({"background-color": "#ce5c5c"})
        }
        // console.log(msg_element)
        msg_element.appendTo($(".chat")); 
        new_msg.push(user_response);
    }
    
    request_data = {
        message_list: msg_list, 
        new_message: new_msg, 
        forward_temp: forward_temp, 
        mmi_temp: mmi_temp, 
        top_k: top_k
    };

    // remove recent user input 
    $("#user-input").val("")

    request_data = JSON.stringify(request_data)

    console.log(request_data)

    // add loading sign
    $('<div id="loading" class="pull-left">\
        <span id="loading-text">   · · ·   </span>\
    </div>').appendTo(".panel-body"); 
    update_scroll(); 

    make_ajax_call("gpu", generate_url, request_data)

}

function ask_submission(){

    chat_messages = $('.message > div')
    if (chat_messages.length >= 6 && asked == false){
        $(".panel-container").css({"opacity": "0.3"})
        $(".header").css({"opacity": "0.3"})
        $("#submit-notify").fadeIn(200); 
        $("#red-arrow").fadeIn(200); 
        asked = true; 
    }
}


function update_scroll(){
    $(".panel-body").animate({scrollTop: $(".panel-body")[0].scrollHeight}, 100); 
};

function reset_dialogue(){
    $(".chat").empty(); 
    enable_input(); 
    $("#first-turn").removeAttr("disabled");
    $('#first-turn').prop('selectedIndex',0);
    msg_list = []; 
    $(".prompt-select").show();
};

function enable_input(){
    $("#user-input").removeAttr('disabled');
    // $("#user-input").focus();
};

function iniFrame(){
    return window.location !== window.parent.location; 
}

// removing and editing contents for iframe in project page
function removeContentsForiFrame(){
    $("#info-button").remove(); 
    $("#submission-div").remove(); 
    $(".header").remove(); 
    $(".footer-wrapper").remove(); 
    $("#decode-parameter-box").css({"display": "none"}); 
    $(".panel-container").removeClass("col-lg-6");
    $(".panel-container").addClass("col-md-7");
    $(".panel-body").css({"height": "70vh"}); 

    $(".panel-heading").css({"background-color": "#a32121"})
    $("#sendbutton").css({"background-color": "#a32121"})
}