var index = -1; // current question index (from 1 to 10), initialized with 0.
var qstr = "";
var answer = "";
var count = 0;

var interval;
var minutes = 0;
var seconds = 0;
var duration = 0;
var timer_running = false;

function initialize_time () {
    minutes = duration / 60;
    seconds = 0;
}

function initialize () {
    initialize_time();
    document.getElementById("question_content").innerHTML = "You've solved " + count + " questions.";
    if (count < 5) {
        document.getElementById("choices_box").innerHTML = "<div class='alert alert-danger'>You should work harder!</div>";
    }
    else if (count >= 5 && count < 8){
        document.getElementById("choices_box").innerHTML = "<div class='alert alert-warning'>Decent work!</div>";
    }
    else {
        document.getElementById("choices_box").innerHTML = "<div class='alert alert-success'>Excellent!</div>";
    }

    document.getElementById("submit_answer_btn").innerHTML = "Try Again";

    index = -1;
    count = 0;
    clearInterval(interval);
    timer_running = false;
}

function countdown(element) {
    timer_running = true;
    interval = setInterval(function() {
        if (!timer_running) {
            clearInterval(interval);
            return;
        }
        var el = document.getElementById(element);
        if(seconds == 0) {
            if(minutes == 0) {
                if (confirm("Time runs out, try again?")) {
                    el.innerHTML = "Time runs out!";
                    initialize();
                    return; 
                }
                else {
                    el.innerHTML = "Time runs out!";
                    initialize();
                    return;
                }
            } else {
                minutes--;
                seconds = 60;
            }
        }
        if(minutes > 0) {
            var minute_text = minutes + (minutes > 1 ? ' minutes' : ' minute');
        } else {
            var minute_text = '';
        }
        var second_text = seconds > 1 ? 'seconds' : 'second';
        el.innerHTML = minute_text + ' ' + seconds + ' ' + second_text + ' remaining';
        seconds--;
    }, 1000);
}

function set_duration () {
	$.ajax({
	    url: 'get_duration.php',
	    success: function(data) {
	        duration = parseInt(data);
	        var minutes = duration / 60;
	        $("#countdown").text("You have " + minutes.toString() + " minutes to finish the test.");
	    }
    }); // end ajax call
}

$(document).ready(function(){
	// set duration
	set_duration();
    
    $("#submit_answer_btn").click(function(){
        index ++;
        if (index == 0) {
           $("#submit_answer_btn").text("Next");
           // start counting down
           initialize_time();
           countdown("countdown");
        }

        // send request to server side to get the question object at index
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                 // check the answer of last question
                 answer = "";
                 $("#choices_box").children('input').each(function(){
                    if (this.checked) {
                       answer += this.value;
                       answer += "_";
                    }
                 });

                 if (answer.length > 0) answer = answer.substring(0, answer.length - 1);
                 
                 if (index > 0) {
                    var last_question = JSON.parse(qstr);
                    var correct_answer = last_question.answers;
                    var user_answer = answer.split("_");

                    var is_same = (correct_answer.length == user_answer.length) && correct_answer.every(function(element, index) {
                        return element === user_answer[index]; 
                    });

                    if (is_same) count++;
                 }

                 //get current question from the server side
                 qstr = xmlhttp.responseText;
                 $("#choices_box").empty();

                 // no more question
                 if (qstr.length > 0 && qstr.charAt(0) != '{') {
                    qstr = qstr + "You've solved " + count + " questions.";
                    $("#question_content").text(qstr);
                    if (count < 5) {
                        $("#choices_box").html("<div class='alert alert-danger'>You should work harder!</div>");
                    }
                    else if (count >= 5 && count < 8){
                        $("#choices_box").html("<div class='alert alert-warning'>Decent work!</div>");
                    }
                    else {
                        $("#choices_box").html("<div class='alert alert-success'>Excellent!</div>");
                    }
                    
                    $("#submit_answer_btn").text("Try Again");
                    index = -1;
                    count = 0;
                    timer_running = false;
                 }
                 else {
                    var question = JSON.parse(qstr);
                    document.getElementById("question_content").innerHTML = (index + 1).toString() + ". " + question.content;
                    for(var i = 0; i < question.choices.length; i++) {
                        $("<input type='checkbox'></input>").attr("id", "checkbox_" + i.toString()).attr("value", i.toString()).appendTo("#choices_box");

                        var choice_id = "#checkbox_" + i.toString();
                        var choice = '&nbsp&nbsp&nbsp<label>' + question.choices[i] + '</label></br>';
                        $(choice_id).after(choice);
                    }
                 }
            }
        };

        xmlhttp.open("GET", "processor.php?index=" + index + "&answer=" + answer, true);
        xmlhttp.send();
    });
});