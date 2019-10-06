//Christopher Pence 2019

//Global variable (I KNOW, it's bad) to store the projects after reading
var projects;

//Once the document is ready, read in the json file and populate the HTML
$(document).ready(function(){
	//load the projects json file
	$.ajax({
		type: "GET",
		cache: false,
		url: "files/projects.json",
		dataType: "json",
		success: function(response, status){
			//Update the last modified tag
			$('#lastModified').html(response.lastModified);
			//save the data for filtering
			projects = response.projectData;
			//load the page with the project boxes
			loadPage(response.projectData, []);
			//load the radio button for filter options
			loadTags(response.projectData);	
		}, error: function(msg) {
			alert("There was a problem loading the projects: " + msg.status + " " + msg.statusText);
		}
	});
	//Load the last modified text
	$('[data-toggle="tooltip"]').tooltip();
});

//Loda the projects onto the page
//Will remove existing projects if called again
//An array of tags can be passed in the filter the output
function loadPage(data, filters){
	$('#projectList').empty();
	var display = false;
	var j;
	var output = '';
	$.each(data, function(i, item){
		display = false;
		output = '<a onclick=\"loadModal(';
		output += i;
		output += ');\" href=\"#mainModal\" data-toggle=\"modal\" data-target=\"#mainModal\">'
		output += '<div class=\"container-fluid projectBox\"><div class=\"row mh\"><div class=\"col col-xs-9 mh\"><div class=\"projectInfo\">';
		//Title
		output += '<h2 class=\"projectTitle\">';
		output += item.title;
		output += '</h2>';
		//Description
		output += '<p class=\"projectDesc\">';
		output += item.desc
		output += '</p>';
		output += '</div><div class=\"projectMeta\"><div class=\"row\"><div class=\"col col-xs-3\">';
		//Date
		output += '<p class=\"projectDate\">';
		output += item.date;
		output += '</p>';
		output += '</div><div class=\"col col-xs-9\">';
		//tags
		output += '<p class=\"projectTags\">';
		for(j = 0; j < item.tags.length; j++){
			if(j == item.tags.length - 1) output += item.tags[j];
			else output += item.tags[j] + ', ';

			//check to see if we should print
			if(filters.length == 0) display = true;
			else{
				if(existsIn(filters, item.tags[j])) display = true;
			}
		}
		output += '</p>';
		output += '</div></div></div></div><div class=\"col col-xs-3 mh\">';
		//Icon
		output += '<img class=\"projectIcon\" src=\"';
		output += item.icon;
		output += '\" alt=\"';
		output += 'Image of ' + item.title;
		output += '\"></div></div></div></a>'; 

		//print if display is true
		if(display)$("#projectList").append(output);
	});
}

//populate the modal after a project is clicked
function loadModal(prj){
	var output = '';
	//update the modal title
	$("#modalTitle").text(projects[prj].title);
	//update the technologies used (tags)
	output += '<h4>Technologies Used</h4><p>';
	$.each(projects[prj].tags, function(i, item){
		if(i == projects[prj].tags.length - 1) output += item;
		else output += item + ', ';
	});
	output += '</p>';
	//Update the modal body content
	$.each(projects[prj].modalContent, function(i, item){
		output += '<h4>' + item.header + '</h4>';
		output += '<p>' + item.body + '</p>';
	});
	$("#modalBody").html(output);
	//update the modal link
	$("#modalLink").attr("onclick", 'location.href = \"' + projects[prj].link + '\"');
	$("#modalTitle").attr("href", projects[prj].link);
}

//load the form that allows the user to select what tags they want
function loadTags(data){
	var filters = [];
	var output = '';
	var j = 0;
	var count = 1;
	//loop through the projects
	$.each(data, function(i, item){
		//loop through the tags
		for(j = 0; j < item.tags.length; j++){
			//check to see if the tag already exists
			if(!existsIn(filters, item.tags[j])){
				if(count == 1) output += '<tr><td>';
				else output += '<td>';

				output += '<input type=\"checkbox\" class=\"filter\" id=\"';
				output += item.tags[j];
				output += '\" name=\"';
				output += item.tags[j];
				output += '\" value=\"';
				output += item.tags[j];
				output += '\"><label for=\"';
				output += item.tags[j];
				output += '\">';
				output += item.tags[j];
				output += '</label>';

				if(count % 4 == 0) output += '</td></tr>';
				else output += '</td>';

				filters.push(item.tags[j]);
				count++;
			}
		}
	});
	if((count % 4)-1 == 0) output += '</tr>';
	$('#filterTable').append(output);
}

//Returns true if tag in arr
//Returns false is tag NOT in arr
function existsIn(arr, tag){
	var i = 0;
	for(; i < arr.length; i++){
		if(arr[i] == tag) return true;
	}
	return false;
}

//filter out the projects with specified tags
function filter(){
	var i;
	var filters = [];
	var options = document.getElementsByClassName('filter');
	//figure out which radio is selected
	for(i = 0; i < options.length; i++){
		if(options[i].checked) filters.push(options[i].value);
	}
	loadPage(projects, filters);
}