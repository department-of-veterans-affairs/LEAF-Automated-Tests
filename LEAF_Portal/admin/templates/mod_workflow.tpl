<div id="sideBar" style="float: left; width: 150px">
    <div id="btn_createStep" class="buttonNorm" onclick="createStep();" style="font-size: 120%; display: none"><img src="../../libs/dynicons/?img=list-add.svg&w=32" alt="Add Step" /> Add Step</div><br />
    Workflows: <br />
    <div id="workflowList"></div>
    <br />
    <div class="buttonNorm" onclick="newWorkflow();" style="font-size: 120%"><img src="../../libs/dynicons/?img=list-add.svg&w=32" alt="New Workflow" /> New Workflow</div><br />
    <br />
    <div id="btn_deleteWorkflow" class="buttonNorm" onclick="deleteWorkflow();" style="font-size: 100%; display: none"><img src="../../libs/dynicons/?img=list-remove.svg&w=16" alt="Delete workflow" /> Delete workflow</div><br />
</div>
<div id="workflow" style="margin-left: 154px; background-color: #444444"></div>

<!--{include file="site_elements/generic_xhrDialog.tpl"}-->
<!--{include file="site_elements/generic_confirm_xhrDialog.tpl"}-->

<script type="text/javascript">
var CSRFToken = '<!--{$CSRFToken}-->';

function newWorkflow() {
    $('.workflowStepInfo').css('display', 'none');
    
    dialog.setTitle('Create new workflow');
    dialog.setContent('<br />Workflow Title: <input type="text" id="description"></input>');
    dialog.setSaveHandler(function() {
        $.ajax({
            type: 'POST',
            url: '../api/workflow/new',
            data: {description: $('#description').val(),
                   CSRFToken: CSRFToken},
            success: function(res) {
                loadWorkflowList(res);
            	dialog.hide();
            }
        });
    });
    dialog.show();
}

function deleteWorkflow() {
    if(currentWorkflow == 0) {
        return;
    }

    dialog_confirm.setTitle('Confirmation required');
    dialog_confirm.setContent('Are you sure you want to delete this workflow?');
    dialog_confirm.setSaveHandler(function() {
        $.ajax({
            type: 'DELETE',
            url: '../api/?a=workflow/'+ currentWorkflow + '&CSRFToken=' + CSRFToken,
            success: function(res) {
            	if(res != true) {
            		alert("Prerequisite action needed:\n\n" + res);
            		dialog_confirm.hide();
            	}
            	else {
            		window.location.reload();
            	}
            }
        });
    });
    dialog_confirm.show();
}

function unlinkEvent(workflowID, stepID, actionType, eventID) {
    $('.workflowStepInfo').css('display', 'none');
    dialog_confirm.setTitle('Confirmation required');
    dialog_confirm.setContent('Are you sure you want to remove this event?');
    dialog_confirm.setSaveHandler(function() {
        $.ajax({
            type: 'DELETE',
            url: '../api/?a=workflow/'+ workflowID +'/step/'+ stepID +'/_'+ actionType +'/events&eventID=' + eventID + '&CSRFToken=' + CSRFToken,
            success: function() {
                $('.workflowStepInfo').css('display', 'none');
                loadWorkflow(workflowID);
                dialog_confirm.hide();
            }
        });
    });
    dialog_confirm.show();
}

function addEventDialog(workflowID, stepID, actionType) {
    $('.workflowStepInfo').css('display', 'none');
    dialog.setTitle('Add Event');
    dialog.setContent('<div id="addEventDialog"></div>');
    dialog.indicateBusy();
    dialog.show();
    $.ajax({
    	type: 'GET',
    	url: '../api/?a=workflow/events',
    	success: function(res) {
    		dialog.indicateIdle();
            var buffer = '';
            buffer = 'Add an event: ';
            buffer += '<br /><div><select id="eventID" name="eventID">';
            
            for(var i in res) {
                buffer += '<option value="'+ res[i].eventID +'">'+ res[i].eventDescription +'</option>';
            }
            
            buffer += '</select></div>';
            $('#addEventDialog').html(buffer);
            $('#eventID').chosen({disable_search_threshold: 5});
            
            dialog.setSaveHandler(function() {
            	$.ajax({
            		type: 'POST',
            		url: '../api/?a=workflow/'+ workflowID +'/step/'+ stepID +'/_'+ actionType +'/events',
            		data: {eventID: $('#eventID').val(),
            			   CSRFToken: CSRFToken},
            		success: function() {
            			loadWorkflow(workflowID);
            		}
            	});
            	dialog.hide();
            });
    	},
    	cache: false
    });
}

function removeStep(stepID) {
    $('.workflowStepInfo').css('display', 'none');
    dialog_confirm.setTitle('Confirmation required');
    dialog_confirm.setContent('Are you sure you want to remove this step?');
    dialog_confirm.setSaveHandler(function() {
        $.ajax({
            type: 'DELETE',
            url: '../api/?a=workflow/step/' + stepID + '&CSRFToken=' + CSRFToken,
            success: function(res) {
            	if(res == 1) {
            		loadWorkflow(currentWorkflow);
            		dialog_confirm.hide();
            	}
            	else {
            		alert(res);
            	}
            }
        });
    });
    dialog_confirm.show();
}

function editStep(stepID) {
    $('.workflowStepInfo').css('display', 'none');
    dialog.setTitle('Edit Step');
    dialog.setContent('Title: <input type="text" id="title"></input>');
    dialog.setSaveHandler(function() {
        $.ajax({
            type: 'POST',
            data: {CSRFToken: CSRFToken,
            	   title: $('#title').val()},
            url: '../api/?a=workflow/step/' + stepID,
            success: function(res) {
                if(res == 1) {
                    loadWorkflow(currentWorkflow);
                    dialog.hide();
                }
                else {
                    alert(res);
                }
            }
        });
    });
    dialog.show();
}

function editRequirement(dependencyID) {
    $('.workflowStepInfo').css('display', 'none');
    dialog.setTitle('Edit Requirement');
    dialog.setContent('Label: <input type="text" id="description"></input>');
    dialog.setSaveHandler(function() {
        $.ajax({
            type: 'POST',
            data: {CSRFToken: CSRFToken,
            	   description: $('#description').val()},
            url: '../api/?a=workflow/dependency/' + dependencyID,
            success: function() {
                $('.workflowStepInfo').css('display', 'none');
                loadWorkflow(currentWorkflow);
                dialog.hide();
            }
        });
    });
    dialog.show();
}

function unlinkDependency(stepID, dependencyID) {
	$('.workflowStepInfo').css('display', 'none');
	dialog_confirm.setTitle('Confirmation required');
	dialog_confirm.setContent('Are you sure you want to remove this requirement?');
	dialog_confirm.setSaveHandler(function() {
		dialog_confirm.indicateBusy();
	    $.ajax({
	        type: 'DELETE',
	        url: '../api/?a=workflow/step/' + stepID + '/dependencies&dependencyID=' + dependencyID + '&CSRFToken=' + CSRFToken,
	        success: function() {
	            $('.workflowStepInfo').css('display', 'none');
	            showStepInfo(stepID);
	            dialog_confirm.hide();
	        }
	    });
	});
	dialog_confirm.show();
}

function linkDependency(stepID, dependencyID) {
	dialog.indicateBusy();
    $.ajax({
        type: 'POST',
        url: '../api/?a=workflow/step/' + stepID + '/dependencies',
        data: {dependencyID: dependencyID,
               CSRFToken: CSRFToken},
        success: function() {
            dialog.hide();
            showStepInfo(stepID);
        }
    });
}

function dependencyRevokeAccess(dependencyID, groupID) {
    $('.workflowStepInfo').css('display', 'none');
    dialog_confirm.setTitle('Confirmation required');
    dialog_confirm.setContent('Are you sure you want to revoke these privileges?');
    dialog_confirm.setSaveHandler(function() {
        $.ajax({
            type: 'DELETE',
            url: '../api/?a=workflow/dependency/' + dependencyID + '/privileges&groupID='+ groupID +'&CSRFToken=' + CSRFToken,
            success: function() {
                $('.workflowStepInfo').css('display', 'none');
                loadWorkflow(currentWorkflow);
                dialog_confirm.hide();
            }
        });
    });
    dialog_confirm.show();
}

// stepID optional
function dependencyGrantAccess(dependencyID, stepID) {
	$('.workflowStepInfo').css('display', 'none');
    dialog.setTitle('What group should have access to this requirement?');
    dialog.indicateBusy();

    $.ajax({
    	type: 'GET',
    	url: '../api/?a=system/groups',
    	success: function(res) {
    		var buffer = 'Grant Privileges to Group:<br /><select id="groupID">';
    		for(var i in res) {
    			buffer += '<option value="'+ res[i].groupID +'">'+ res[i].name +'</option>';
    		}
    		buffer += '</select>';
    		dialog.setContent(buffer);
    		dialog.indicateIdle();
    	},
    	cache: false
    });
    
    var groupSel = new groupSelector('groupSearch');
    groupSel.basePath = '<!--{$orgchartPath}-->/';
    groupSel.apiPath = '<!--{$orgchartPath}-->/api/?a=';
    groupSel.tag = '<!--{$orgchartImportTags[0]}-->';
    groupSel.initialize();
    
    dialog.setSaveHandler(function() {
        $.ajax({
            type: 'POST',
            url: '../api/?a=workflow/dependency/' + dependencyID + '/privileges',
            data: {groupID: $('#groupID').val(),
            	   CSRFToken: CSRFToken},
            success: function(res) {
                dialog.hide();
                loadWorkflow(currentWorkflow);
                if(stepID != undefined) {
                	linkDependency(stepID, dependencyID);
                }
            }
        });
    });
    dialog.show();
}

function newDependency(stepID) {
	dialog.setTitle('Create a new requirement');
    dialog.setContent('<br />Requirement Label: <input type="text" id="description"></input><div id="groupSearch"></div>');
    
    dialog.setSaveHandler(function() {
    	$.ajax({
    		type: 'POST',
    		url: '../api/?a=workflow/dependencies',
    		data: {description: $('#description').val(),
    			   CSRFToken: CSRFToken},
    		success: function(res) {
    			dialog.hide();
    			dependencyGrantAccess(res, stepID);
    		}
    	});
    });
    dialog.show();
}

function linkDependencyDialog(stepID) {
	$('.workflowStepInfo').css('display', 'none');
    dialog.setTitle('Add requirement to a workflow step');
    dialog.setContent('<br /><div id="dependencyList"></div>');	
    dialog.show();

    $.ajax({
    	type: 'GET',
    	url: '../api/?a=workflow/dependencies',
    	success: function(res) {
            var buffer = '';
            buffer = 'Select an existing requirement ';
            buffer += '<br /><div><select id="dependencyID" name="dependencyID">';
            
            var reservedDependencies = ['-3', '-2', '-1', '1', '8'];
            
            buffer += '<optgroup label="Custom Requirements">';
            for(var i in res) {
            	if(reservedDependencies.indexOf(res[i].dependencyID) == -1) {
            		buffer += '<option value="'+ res[i].dependencyID +'">'+ res[i].description +'</option>';
            	}
            }
            buffer += '</optgroup>';

            buffer += '<optgroup label="&quot;Smart&quot; Requirements">';
            for(var i in res) {
                if(reservedDependencies.indexOf(res[i].dependencyID) != -1) {
                    buffer += '<option value="'+ res[i].dependencyID +'">'+ res[i].description +'</option>';
                }
            }
            buffer += '</optgroup>';
            
            buffer += '</select></div>';
            buffer += '<br /><br /><br /><br /><div>If a requirement does not exist: <span class="buttonNorm" onclick="newDependency('+ stepID +')">Create a new requirement</span></div>';
            $('#dependencyList').html(buffer);
            $('#dependencyID').chosen({disable_search_threshold: 5});
            
            dialog.setSaveHandler(function() {
            	linkDependency(stepID, $('#dependencyID').val());
            });
    	},
    	cache: false
    });
}

function createStep() {
	$('.workflowStepInfo').css('display', 'none');
	if(currentWorkflow == 0) {
		return;
	}
	
	dialog.setTitle('Create new Step');
	dialog.setContent('<br />Step Title: <input type="text" id="stepTitle"></input><br /><br />Example: "Service Chief"');
	dialog.setSaveHandler(function() {
		$.ajax({
			type: 'POST',
			url: '../api/?a=workflow/' + currentWorkflow + '/step',
			data: {stepTitle: $('#stepTitle').val(),
				   CSRFToken: CSRFToken},
			success: function(res) {
				loadWorkflow(currentWorkflow);
				dialog.hide();
			}
		});
	});
	dialog.show();
}

function setInitialStep(stepID) {
    $.ajax({
        type: 'POST',
        url: '../api/?a=workflow/' + currentWorkflow + '/initialStep',
        data: {stepID: stepID,
               CSRFToken: CSRFToken},
        success: function() {
        	workflows = {};
            $.ajax({
                type: 'GET',
                url: '../api/?a=workflow',
                success: function(res) {
                    for(var i in res) {
                        workflows[res[i].workflowID] = res[i];
                    }
                    loadWorkflow(currentWorkflow);
                },
                cache: false
            });
        }
    });
}

// create a brand new action
function newAction() {
	dialog.hide();
	dialog.setTitle('Create New Action Type');
	dialog.show();
	
	var buffer = '<table>\
		              <tr>\
		                  <td>Action <span style="color: red">*Required</span></td>\
		                  <td><input id="actionText" type="text" maxlength="50" style="border: 1px solid red"></input></td>\
		                  <td>eg: Approve</td>\
		              </tr>\
		              <tr>\
                          <td>Action Past Tense <span style="color: red">*Required</span></td>\
                          <td><input id="actionTextPasttense" type="text" maxlength="50" style="border: 1px solid red"></input></td>\
                          <td>eg: Approved</td>\
                      </tr>\
                      <tr>\
                          <td>Icon</td>\
                          <td><input id="actionIcon" type="text" maxlength="50" value="go-next.svg"></input></td>\
                          <td>eg: go-next.svg <a href="../../libs/dynicons/gallery.php" target="_blank">List of available icons</a></td>\
                      </tr>\
		          </table>\
		          <br /><br />Does this action represent moving forwards or backwards in the process? <select id="fillDependency"><option value="1">Forwards</option><option value="-1">Backwards</option></select><br />';

    dialog.setSaveHandler(function() {
    	if($('#actionText').val() == ''
    		|| $('#actionTextPasttense').val() == '') {
    		alert('Please fill out required fields.');
    	}
    	else {
            $.ajax({
                type: 'POST',
                url: '../api/?a=system/actions',
                data: {actionText: $('#actionText').val(),
                       actionTextPasttense: $('#actionTextPasttense').val(),
                       actionIcon: $('#actionIcon').val(),
                       fillDependency: $('#fillDependency').val(),
                       CSRFToken: CSRFToken},
                success: function() {
                    alert('Your action type has been created, and is now available as an option.');
                    loadWorkflow(currentWorkflow);
                }
            });
            dialog.hide();
    	}
    });

	dialog.setContent(buffer);
}

// connect 2 steps with an action
function createAction(params) {
	$('.workflowStepInfo').css('display', 'none');
	source = parseFloat(params.sourceId.substr(5));
	sourceTitle = '';
	target = parseFloat(params.targetId.substr(5));
	targetTitle = '';
	if(source == 0) {
		sourceTitle = 'End';
		alert('Ending step cannot be set as a triggering step.');
		loadWorkflow(currentWorkflow);
		return;
	}
	if(target == 0) {
		targetTitle = 'End';
	}
	if(source == -1) {
		source = 0;
		sourceTitle = 'Requestor';
		// handle intial step separately
		setInitialStep(target);
		return;
	}
	if(target == -1) {
		target = 0;
		targetTitle = 'Requestor';

        // automatically select "return to requestor" if the user links a step to the requestor's step
        if(source > 0) {
            $.ajax({
                type: 'POST',
                url: '../api/?a=workflow/' + currentWorkflow + '/action',
                data: {stepID: source,
                       nextStepID: target,
                       action: 'sendback',
                       CSRFToken: CSRFToken},
                success: function() {
                    loadWorkflow(currentWorkflow);
                }
            });
            return;
        }
    }
	if(source > 0) {
		sourceTitle = steps[source].stepTitle;
	}
	if(target > 0) {
        targetTitle = steps[target].stepTitle;
    }

	dialog.setTitle('Create New Workflow Action');
	dialog.indicateBusy();
	dialog.show();

	$.ajax({
		type: 'GET',
		url: '../api/?a=workflow/actions',
		success: function(res) {
			var buffer = '';
			buffer = 'Select action for ';
			buffer += '<b>' + sourceTitle + '</b> to <b>' + targetTitle + '</b>:';
			buffer += '<br /><br /><br />Use an existing action type: <select id="actionType" name="actionType">';
			
			for(var i in res) {
				buffer += '<option value="'+ res[i].actionType +'">'+ res[i].actionText +'</option>';
			}
			
			buffer += '</select>';
			buffer += '<br />- OR -<br /><br /><span class="buttonNorm" onclick="newAction();">Create a new Action Type</span>';

			dialog.indicateIdle();
			dialog.setContent(buffer);
			$('#actionType').chosen({disable_search_threshold: 5});
			dialog.setSaveHandler(function() {
				$.ajax({
					type: 'POST',
					url: '../api/?a=workflow/' + currentWorkflow + '/action',
					data: {stepID: source,
						   nextStepID: target,
						   action: $('#actionType').val(),
						   CSRFToken: CSRFToken},
					success: function() {
						loadWorkflow(currentWorkflow);
					}
				});
				dialog.hide();
			});
		},
		cache: false
	});
}

function removeAction(workflowID, stepID, nextStepID, action) {
    $('.workflowStepInfo').css('display', 'none');
    dialog_confirm.setTitle('Confirm action removal');
	dialog_confirm.setContent('Confirm removal of:<br /><br />' + stepID + ' -> ' + action + ' -> ' + nextStepID);
	dialog_confirm.setSaveHandler(function() {
		$.ajax({
			type: 'DELETE',
			url: '../api/?a=workflow/' + workflowID + '/step/' + stepID + '/_' + action + '/' + nextStepID + '&CSRFToken=' + CSRFToken,
			success: function() {
		        loadWorkflow(workflowID);
			}
		});
	    dialog_confirm.hide();
	});
	
	dialog_confirm.show();
}

function showActionInfo(params, evt) {
    $('.workflowStepInfo').css('display', 'none');
    $('#stepInfo_' + params.stepID).html('Loading...');

    $.ajax({
        type: 'GET',
        url: '../api/?a=workflow/'+ currentWorkflow +'/step/' + params.stepID + '/_' + params.action + '/events',
        success: function(res) {
            var output = '';
            stepTitle = steps[params.stepID] != undefined ? steps[params.stepID].stepTitle : 'Requestor';
            output = '<h2>'+ stepTitle +' -> '+ params.action +'</h2>';
            output += '<br /><div>Events:<ul>';
            // the sendback action always notifies the requestor
            if(params.action == 'sendback') {
            	output += '<li><b>Notify the requestor via email</b></li>';
            }
            for(var i in res) {
                output += '<li><b title="'+ res[i].eventID +'">'+ res[i].eventDescription +'</b> <img src="../../libs/dynicons/?img=dialog-error.svg&w=16" style="cursor: pointer" onclick="unlinkEvent('+ currentWorkflow +', '+ params.stepID +', \''+ params.action +'\', \''+ res[i].eventID +'\')" alt="Remove Action" title="Remove Action" /></li>';
            }
            output += '<li style="padding-top: 8px"><span class="buttonNorm" id="event_'+ currentWorkflow + '_' + params.stepID + '_'+ params.action +'">Add Event</span>';
            output += '</ul></div>';
            output += '<hr /><div style="padding: 4px"><span class="buttonNorm" onclick="removeAction('+ currentWorkflow +', '+ params.stepID +', '+ params.nextStepID +', \''+ params.action +'\')">Remove Action</span></div>';
            $('#stepInfo_' + params.stepID).html(output);
            $('#event_'+ currentWorkflow + '_' + params.stepID + '_'+ params.action).on('click', function() {
            	addEventDialog(currentWorkflow, params.stepID, params.action);
            });
        },
        cache: false
    });
    
    $('#stepInfo_' + params.stepID).css({
        left: evt.pageX + 'px',
        top: evt.pageY + 'px'
    });
    $('#stepInfo_' + params.stepID).show('slide', null, 200);
}

function setDynamicApprover(stepID) {
	$('.workflowStepInfo').css('display', 'none');
    dialog.setTitle('Set Indicator ID');
    dialog.setContent('Loading...');
    
    $.ajax({
    	type: 'GET',
    	url: '../api/form/indicator/list',
    	success: function(res) {
    		var indicatorList = '';
    		for(var i in res) {
    			if(res[i]['format'] == 'orgchart_employee') {
    				indicatorList += '<option value="'+ res[i].indicatorID +'">'+ res[i].categoryName +': '+ res[i].name +' (id: '+ res[i].indicatorID +')</option>';
    			}
    		}
    		dialog.setContent('<br />Select a field that the requestor fills out. The workflow will route to the person they select.<br /><select id="indicatorID">' + indicatorList + '</select><br /><br />\
    			    * Your form must have a field with the "Orgchart Employee" input format');
    	},
    	cache: false
    });
    
    
    dialog.setSaveHandler(function() {
        $.ajax({
            type: 'POST',
            url: '../api/?a=workflow/step/' + stepID + '/indicatorID_for_assigned_empUID',
            data: {indicatorID: $('#indicatorID').val(),
                   CSRFToken: CSRFToken},
            success: function(res) {
                loadWorkflow(currentWorkflow);
                dialog.hide();
            }
        });
    });
    dialog.show();
}

function setDynamicGroupApprover(stepID) {
    $('.workflowStepInfo').css('display', 'none');
    dialog.setTitle('Set Indicator ID');
    dialog.setContent('Loading...');
    
    $.ajax({
        type: 'GET',
        url: '../api/form/indicator/list',
        success: function(res) {
            var indicatorList = '';
            for(var i in res) {
                if(res[i]['format'] == 'orgchart_group') {
                    indicatorList += '<option value="'+ res[i].indicatorID +'">'+ res[i].categoryName +': '+ res[i].name +' (id: '+ res[i].indicatorID +')</option>';
                }
            }
            dialog.setContent('<br />Select a field that the requestor fills out. The workflow will route to the group they select.<br /><select id="indicatorID">' + indicatorList + '</select><br /><br />\
                    * Your form must have a field with the "Orgchart Group" input format');
        },
        cache: false
    });
    
    
    dialog.setSaveHandler(function() {
        $.ajax({
            type: 'POST',
            url: '../api/?a=workflow/step/' + stepID + '/indicatorID_for_assigned_groupID',
            data: {indicatorID: $('#indicatorID').val(),
                   CSRFToken: CSRFToken},
            success: function(res) {
                loadWorkflow(currentWorkflow);
                dialog.hide();
            }
        });
    });
    dialog.show();
}

function showStepInfo(stepID) {
	if($('#stepInfo_' + stepID).css('display') != 'none') { // hide info window on second click
		$('.workflowStepInfo').css('display', 'none');
		return;
	}
	$('.workflowStepInfo').css('display', 'none');
    $('#stepInfo_' + stepID).html('Loading...');
	
    switch(stepID) {
        case -1:
        	$('#stepInfo_' + stepID).html('Request initiator (stepID #: -1)');
        	break;
        case 0:
        	$('#stepInfo_' + stepID).html('The End.  (stepID #: 0)');
            break;
        default:
            $.ajax({
                type: 'GET',
                url: '../api/?a=workflow/step/' + stepID + '/dependencies',
                success: function(res) {
                    var output = '';
                    var control_removeStep = '<img style="cursor: pointer" src="../../libs/dynicons/?img=dialog-error.svg&w=16" onclick="removeStep('+ stepID +')" alt="Remove" />'; 
                    output = '<h2>stepID: #'+ stepID +' '+ control_removeStep +'</h2><br />Step: <b>' + steps[stepID].stepTitle + '</b> <img style="cursor: pointer" src="../../libs/dynicons/?img=accessories-text-editor.svg&w=16" onclick="editStep('+ stepID +')" alt="Edit Step" /><br />';
                    output += '<br /><div>Requirements:<ul>';
                    var tDeps = {};
                    for(var i in res) {
                    	control_editDependency = '<img style="cursor: pointer" src="../../libs/dynicons/?img=accessories-text-editor.svg&w=16" onclick="editRequirement('+ res[i].dependencyID +')" alt="Edit Requirement" />';
                    	control_unlinkDependency = '<img style="cursor: pointer" src="../../libs/dynicons/?img=dialog-error.svg&w=16" onclick="unlinkDependency('+ stepID +', '+ res[i].dependencyID +')" alt="Remove" />';
                        if(res[i].dependencyID == 1) { // special case for service chief and quadrad
                            output += '<li><b style="color: green">'+ res[i].description +'</b> '+ control_editDependency + ' ' + control_unlinkDependency + ' (depID: '+ res[i].dependencyID +')</li>';
                        }
                        else if(res[i].dependencyID == 8) { // special case for service chief and quadrad
                            output += '<li><b style="color: green">'+ res[i].description +'</b> '+ control_editDependency + ' ' + control_unlinkDependency +' (depID: '+ res[i].dependencyID +')</li>';
                        }
                        else if(res[i].dependencyID == -1) { // dependencyID -1 : special case for person designated by the requestor
                        	var indicatorWarning = '';
                        	if(res[i].indicatorID_for_assigned_empUID == null || res[i].indicatorID_for_assigned_empUID == 0) {
                        		indicatorWarning = '<li><span style="color: red; font-weight: bold">A data field (indicatorID) must be set.</span></li>';
                        	}
                            output += '<li><b style="color: green">'+ res[i].description +'</b> '+ control_unlinkDependency +' (depID: '+ res[i].dependencyID +')<ul>'+ indicatorWarning +'<li>indicatorID: '+ res[i].indicatorID_for_assigned_empUID +'<br /><div class="buttonNorm" onclick="setDynamicApprover('+ res[i].stepID +')">Set Data Field</div></li></ul></li>';
                        }
                        else if(res[i].dependencyID == -2) { // dependencyID -2 : requestor followup
                        	output += '<li><b style="color: green">'+ res[i].description +'</b> '+ control_unlinkDependency +' (depID: '+ res[i].dependencyID +')</li>';
                        }
                        else if(res[i].dependencyID == -3) { // dependencyID -3 : special case for group designated by the requestor
                            var indicatorWarning = '';
                            if(res[i].indicatorID_for_assigned_groupID == null || res[i].indicatorID_for_assigned_groupID == 0) {
                                indicatorWarning = '<li><span style="color: red; font-weight: bold">A data field (indicatorID) must be set.</span></li>';
                            }
                            output += '<li><b style="color: green">'+ res[i].description +'</b> '+ control_unlinkDependency +' (depID: '+ res[i].dependencyID +')<ul>'+ indicatorWarning +'<li>indicatorID: '+ res[i].indicatorID_for_assigned_groupID +'<br /><div class="buttonNorm" onclick="setDynamicGroupApprover('+ res[i].stepID +')">Set Data Field</div></li></ul></li>';
                        }
                        else {
                        	if(tDeps[res[i].dependencyID] == undefined) { // 
                        		tDeps[res[i].dependencyID] = 1;
                                output += '<li style="padding-bottom: 8px"><b title="depID: '+ res[i].dependencyID +'" onclick="dependencyGrantAccess('+ res[i].dependencyID +')">'+ res[i].description +'</b> ' + control_editDependency + ' ' + control_unlinkDependency
                                + '<ul id="step_'+ stepID +'_dep'+ res[i].dependencyID +'"><li style="padding-top: 8px"><span class="buttonNorm" onclick="dependencyGrantAccess('+ res[i].dependencyID +')"><img src="../../libs/dynicons/?img=list-add.svg&w=16" alt="Add" /> Add Group</span></li>\
                                </ul></li>';
                        	}
                        }
                    }
                    if(res.length == 0) {
                    	output += '<li><span style="color: red; font-weight: bold">A requirement must be added.</span></li>';
                    }
                    output += '</ul><div>';
                    output += '<hr /><div style="padding: 4px"><span class="buttonNorm" onclick="linkDependencyDialog('+ stepID +')">Add Requirement</span></div>';
                    $('#stepInfo_' + stepID).html(output);

                    // TODO: clean everything here up
                    var counter = 0;
                    for(var i in res) {
                        group = '';
                        if(res[i].groupID != null) {
                            $('#step_'+ stepID +'_dep' + res[i].dependencyID).prepend('<li><span style="white-space: nowrap"><b title="groupID: '+ res[i].groupID +'">'+ res[i].name +'</b> <img style="cursor: pointer" src="../../libs/dynicons/?img=dialog-error.svg&w=16" onclick="dependencyRevokeAccess('+ res[i].dependencyID +', '+ res[i].groupID +')" alt="Remove" /></span></li>');
                            counter++;
                        }
                    }
                    if(counter == 0
                        && res[i] != undefined) {
                    	$('#step_'+ stepID +'_dep' + res[i].dependencyID).prepend('<li><span style="color: red; font-weight: bold">A group must be added.</span></li>');
                    }
                },
                cache: false
            });
        	break;
    }

	position = $('#step_' + stepID).offset();
	width = $('#step_' + stepID).width();

	$('#stepInfo_' + stepID).css({
		left: position.left + width + 'px',
		top: position.top + 'px'
	});
	$('#stepInfo_' + stepID).show('slide', null, 200);
}

var endPoints = [];
function drawRoutes(workflowID) {
    $.ajax({
        type: 'GET',
        url: '../api/?a=workflow/' + workflowID + '/route',
        success: function(res) {
            if(endPoints[-1] == undefined) {
                endPoints[-1] = jsPlumb.addEndpoint('step_-1', {anchor: 'Continuous'}, endpointOptions);
                jsPlumb.draggable('step_-1');
            }
            if(endPoints[0] == undefined) {
                endPoints[0] = jsPlumb.addEndpoint('step_0', {anchor: 'Continuous'}, endpointOptions);
                jsPlumb.draggable('step_0');
            }

            // draw connector
            for(var i in res) {
                var loc = 0.5;
                switch(res[i].actionType) {
                    case 'sendback':
                        loc = 0.30;
                        break;
                    case 'approve':
                        loc = 0.5;
                        break;
                    case 'concur':
                        loc = 0.5;
                        break;
                    case 'defer':
                        loc = 0.25;
                        break;
                    case 'disapprove':
                        loc = 0.75;
                        break;
                }
            	if(res[i].nextStepID == 0
            		&& res[i].actionType == 'sendback') {
            		jsPlumb.connect({
                        source: 'step_' + res[i].stepID,
                        target: 'step_-1',
                        paintStyle: {stroke: 'red'},
                        overlays: [["Label", {
                        	id: 'stepLabel_' + res[i].stepID + '_0_' + res[i].actionType,
                            cssClass:"workflowAction",
                            label: res[i].actionText,
                            location: loc,
                            parameters: {'stepID': res[i].stepID,
                                         'nextStepID': 0,
                                         'action': res[i].actionType},
                            events: {
                                click: function(overlay, evt) {
                                    params = overlay.getParameters();
                                    showActionInfo(params, evt);
                                }
                            }
                        }]]
                    });
            	}
            	else {
            		lineOptions = {
                            source: 'step_' + res[i].stepID,
                            target: 'step_' + res[i].nextStepID,
                            connector: ["StateMachine", {curviness: 10}],
                            anchor: "Continuous",
                            overlays: [["Label", {
                                    id: 'stepLabel_' + res[i].stepID + '_' + res[i].nextStepID + '_' + res[i].actionType,
                                    cssClass:"workflowAction",
                                    label: res[i].actionText,
                                    location: loc,
                                    parameters: {'stepID': res[i].stepID,
                                                 'nextStepID': res[i].nextStepID,
                                                 'action': res[i].actionType},
                                    events: {
                                        click: function(overlay, evt) {
                                            params = overlay.getParameters();
                                            showActionInfo(params, evt);
                                        }
                                    }
                                }]]
                    };
            		if(res[i].actionType == 'sendback') {
            			lineOptions.paintStyle = {stroke: 'red'};
            		}
            		jsPlumb.connect(lineOptions);
            	}
            }

            // connect the initial step if it exists
            if(workflows[workflowID].initialStepID != 0) {
                jsPlumb.connect({
                    source: endPoints[-1],
                    target: endPoints[workflows[workflowID].initialStepID],
                    connector: ["StateMachine", {curviness: 10}],
                    anchor: "Continuous",
                    overlays: [["Label", {
                    	id: 'stepLabel_0_' + workflows[workflowID].initialStepID + '_submit',
                        cssClass:"workflowAction",
                        label: 'Submit',
                        location: loc,
                        parameters: {'stepID': 0,
                                     'nextStepID': workflows[workflowID].initialStepID,
                                     'action': 'submit'},
                        events: {
                            click: function(overlay, evt) {
                                params = overlay.getParameters();
                                showActionInfo(params, evt);
                            }
                        }
                    }]]
                });
            }
            
            // bind connection events
            jsPlumb.bind("connection", function(info) {
            	createAction(info);
            });
            jsPlumb.setSuspendDrawing(false, true);
        },
        cache: false
    });
}

var currentWorkflow = 0;
function loadWorkflow(workflowID) {
    $('#btn_createStep').css('display', 'block');
    $('#btn_deleteWorkflow').css('display', 'block');

	currentWorkflow = workflowID;
	jsPlumb.reset();
	endPoints = [];
	steps = {};
	jsPlumb.setSuspendDrawing(true);

	$('.workflows');
    $('.workflows').removeClass('buttonNormSelected');
    $('#workflow_' + workflowID).addClass('buttonNormSelected');

	$('#workflow').html('');
	$('#workflow').append('<div class="workflowStep" id="step_-1">Requestor</div><div class="workflowStepInfo" id="stepInfo_-1"></div>');
    $('#step_-1').css({
        'left': 150 + 40 + 'px',
        'top': 80 + 40 + 'px',
        'background-color': '#e0e0e0'
    });
    $('#workflow').append('<div class="workflowStep" id="step_0">End</div><div class="workflowStepInfo" id="stepInfo_0"></div>');
    $('#step_0').css({
        'left': 150 + 40 + 'px',
        'top': 80 + 40 + 'px',
        'background-color': '#ff8181'
    });

    $.ajax({
        type: 'GET',
        url: '../api/?a=workflow/' + workflowID,
        success: function(res) {
        	var maxY = 80;
            for(var i in res) {
            	steps[res[i].stepID] = res[i];
            	posY = parseFloat(res[i].posY)
            	$('#workflow').append('<div class="workflowStep" id="step_'+ res[i].stepID +'">'+ res[i].stepTitle +'</div><div class="workflowStepInfo" id="stepInfo_'+ res[i].stepID +'"></div>');
            	$('#step_' + res[i].stepID).css({
            		'left': parseFloat(res[i].posX) + 'px',
            		'top': posY + 'px',
            		'background-color': res[i].stepBgColor
            	});

                if(endPoints[res[i].stepID] == undefined) {
                    endPoints[res[i].stepID] = jsPlumb.addEndpoint('step_' + res[i].stepID, {anchor: 'Continuous'}, endpointOptions);
                    jsPlumb.draggable('step_' + res[i].stepID, {
                        // save position of the box when moved
                        stop: function (stepID) {
                            return function() {
                                var position = $('#step_' + stepID).offset();
                                $.ajax({
                                    type: 'POST',
                                    url: '../api/?a=workflow/'+workflowID+'/editorPosition',
                                    data: {stepID: stepID,
                                           x: position.left,
                                           y: position.top,
                                           CSRFToken: CSRFToken
                                    },
                                    success: function() {
                                        
                                    }
                                });
                            }
                        }(res[i].stepID)
                    });
                }

            	// attach click event
            	$('#step_' + res[i].stepID).on('click', null, res[i].stepID, function(e) {
            		showStepInfo(e.data);
            	});
            	
            	if(maxY < posY) {
            		maxY = posY;
            	}
            }
            // draw the last step
            $('#step_0').css({
                'left': 150 + 400 + 'px',
                'top': 160 + maxY + 'px',
                'background-color': '#ff8181'
            });
            // attach click events for first and last step
            $('#step_-1').on('click', null, -1, function(e) {
                showStepInfo(e.data);
            });
            $('#step_0').on('click', null, 0, function(e) {
                showStepInfo(e.data);
            });

            $('#workflow').css('height', 300 + maxY + 'px');
            drawRoutes(workflowID);
        },
        cache: false
    });
}

function loadWorkflowList(workflowID)
{
    $.ajax({
        type: 'GET',
        url: '../api/?a=workflow',
        success: function(res) {
            var output = '';
            var count = 0;
            var firstWorkflowID = 0;
            for(var i in res) {
                if(count == 0) {
                    firstWorkflowID = res[i].workflowID;
                }
                workflows[res[i].workflowID] = res[i];
                output += '<div class="buttonNorm workflows" id="workflow_'+ res[i].workflowID +'" onclick="loadWorkflow('+ res[i].workflowID +')"><b>' + res[i].description + '</b> (ID: #'+ res[i].workflowID +')</div>';
                count++;
            }
            if(count == 0) {
                return;
            }
            $('#workflowList').html(output);
            if(workflowID == undefined) {
            	workflowID = firstWorkflowID;
            }
            loadWorkflow(workflowID);
        },
        cache: false
    });
}

var dialog, dialog_confirm;
var workflows = {};
var steps = {};
var endpointOptions = {
	    isSource: true,
	    isTarget: true,
	    endpoint: ["Rectangle", {cssClass: "workflowEndpoint"}],
	    paintStyle: {width: 48, height: 48},
	    maxConnections: -1
	};
$(function() {
	dialog = new dialogController('xhrDialog', 'xhr', 'loadIndicator', 'button_save', 'button_cancelchange');
    dialog_confirm = new dialogController('confirm_xhrDialog', 'confirm_xhr', 'confirm_loadIndicator', 'confirm_button_save', 'confirm_button_cancelchange');

	jsPlumb.Defaults.Container = "workflow";
    jsPlumb.Defaults.ConnectionOverlays = [["PlainArrow", {location:0.9, width:20, length:12}]];
    jsPlumb.Defaults.PaintStyle = {stroke: 'lime', lineWidth: 1};
    jsPlumb.Defaults.Connector = ["StateMachine", {curviness: 10}];
    jsPlumb.Defaults.Anchor = "Continuous";
    jsPlumb.Defaults.Endpoint = "Blank";

    loadWorkflowList();
});

</script>
