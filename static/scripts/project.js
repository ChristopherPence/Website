//Christopher Pence 2019

//Global variable (I KNOW, it's bad) to store the projects after reading
var projects;

//Once the document is ready, read in the json file and populate the HTML
$(document).ready(function(){
	//load the projects json file
	$.ajax({
		type: "GET",
		cache: false,
		url: "static/res/projects.json",
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
			//load the modals that sit at the bottom of the page
			loadModals(response.projectData);
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

		output = "<div class=\"col-md-6 col-lg-4\"><h3 class=\"portfolio-item-label\">"+item.title+"</h3>";
   		output += "<div class=\"portfolio-item mx-auto\" data-toggle=\"modal\" data-target=\"#portfolioModal"+i+"\">";
    	output += "<div class=\"portfolio-item-caption d-flex align-items-center justify-content-center h-100 w-100\">";
    	output += "<div class=\"portfolio-item-caption-content text-center text-white\">";
    	output += "<i class=\"fas fa-plus fa-3x\"></i></div></div>"
    	output += "<img class=\"img-fluid portfolio-img\" src=\""+item.icon+"\" alt=\"Image of "+item.title+"\"></div></div>"

		// Check to see if display is enabled
		for(j = 0; j < item.tags.length; j++){
			if(filters.length == 0) display = true;
			else{
				if(existsIn(filters, item.tags[j])) display = true;
			}
		}

		//print if display is true
		if(display)$("#projectList").append(output);
	});
}

function loadModals(data){
	$.each(data, function(i, item){
		output = "<div class=\"portfolio-modal modal fade\" id=\"portfolioModal"+i+"\" tabindex=\"-1\" role=\"dialog\"";
		output += "aria-labelledby=\"portfolioModal"+i+"Label\" aria-hidden=\"true\">";
		output += "<div class=\"modal-dialog modal-xl\" role=\"document\"><div class=\"modal-content\"><button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\">";
		output += "<span aria-hidden=\"true\"><i class=\"fas fa-times\"></i></span></button><div class=\"modal-body text-center\"><div class=\"container\"><div class=\"row justify-content-center\">";
        output += "<div class=\"col-lg-8\"><h2 class=\"portfolio-modal-title text-secondary text-uppercase mb-0\">"+item.title+"</h2>";
        output += "<div class=\"divider-custom\"><div class=\"divider-custom-line\"></div><div class=\"divider-custom-icon\"><p>"+item.date+"</p></div>";
        output += "<div class=\"divider-custom-line\"></div></div><img class=\"img-fluid rounded mb-5\" src=\""+item.icon+"\" alt=\"Image of "+item.title+"\">";
        output += '<h4>Technologies Used</h4><p class=\"mb-5\"">';
		$.each(projects[i].tags, function(j, jtem){
			if(j == projects[i].tags.length - 1) output += jtem;
			else output += jtem + ', ';
		});
		output += "</p>";
		$.each(projects[i].modalContent, function(j, jtem){
			output += "<h4>" + jtem.header + "</h4>";
			output += "<p class=\"mb-5\">" + jtem.body + "</p>";
		});
		output += "<button class=\"btn btn-primary\" onclick=\"window.open('"+item.link+"');\">";
        output += "<i class=\"fas fa-external-link-alt\"></i>Visit Project</button></div></div></div></div></div></div></div>";

        $("#modalContainer").append(output);
	});
}

//populate the modal after a project is clicked
/*function loadModal(prj){
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
}*/

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

				output += '<div class="checkbox-wrapper"><input type=\"checkbox\" class=\"filter\" id=\"';
				output += item.tags[j];
				output += '\" name=\"';
				output += item.tags[j];
				output += '\" value=\"';
				output += item.tags[j];
				output += '\"><label for=\"';
				output += item.tags[j];
				output += '\">';
				output += item.tags[j];
				output += '</label></div>';

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