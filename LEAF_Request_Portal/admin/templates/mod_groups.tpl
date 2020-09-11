<div class="leaf-center-content">

    <!--{assign var=right_nav_content value="
        <h3 class='navhead'>Access groups</h3>
        <button class='usa-button leaf-btn-green leaf-btn-med leaf-side-btn' onclick='createGroup();'>
            + Create group
        </button>
        <button class='usa-button usa-button--outline leaf-btn-med leaf-side-btn' onclick='importGroup();'>
            Import group
        </button>
        <button class='usa-button usa-button--outline leaf-btn-med leaf-side-btn' onclick='showAllGroupHistory();'>
            Show group history
        </button>
    "}-->
    <!--{include file="partial_layouts/right_side_nav.tpl" contentRight="$right_nav_content"}-->

    <!--{assign var=left_nav_content value="
        <h3 class='navhead'>Access categories</h3>
        <ul class='usa-sidenav'>
            <li class='usa-sidenav__item'><a href='javascript:void(0)' class='usa-current' id='sysAdminsLink'>System administrators</a></li>
            <li class='usa-sidenav__item'><a href='javascript:void(0)' id='userGroupsLink'>User groups</a></li>
        </ul>
    "}-->
    <!--{include file="partial_layouts/left_side_nav.tpl" contentLeft="$left_nav_content"}-->

    <main class="main-content">

        <h2><a href="/LEAF_Request_Portal/admin" class="leaf-crumb-link">Admin</a><i class="fas fa-caret-right leaf-crumb-caret"></i>User access</h2>

        <div id="sysAdmins">
            <h3 role="heading" tabindex="-1">System administrators</h3>
            <div class="leaf-displayFlexRow">
                <span id="adminList" class="leaf-sysadmin-cards"></span>
                <span id="primaryAdmin" class="leaf-sysadmin-cards"></span>
            </div>
        </div>

        <div id="userGroups">
            <div class="leaf-clear-both">
                <h3 role="heading" tabindex="-1">User groups</h3>
                <div id="groupList" class="leaf-displayFlexRow"></div>
            </div>
        </div>
    </main>

</div>

<!--{include file="site_elements/generic_xhrDialog.tpl"}-->
<!--{include file="site_elements/generic_simple_xhrDialog.tpl"}-->

<script>
$(document).ready(function() {
    $('#userGroups').hide();
    $('#userGroupsLink').click(function() {
        $('#sysAdmins').hide();
        $('#sysAdminsLink').removeClass('usa-current');
        $('#userGroups').show();
        $(this).addClass('usa-current');
    });
    $('#sysAdminsLink').click(function() {
        $('#userGroups').hide();
        $('#userGroupsLink').removeClass('usa-current');
        $('#sysAdmins').show();
        $(this).addClass('usa-current');
    });
});
</script>

<script type="text/javascript">
var tz = '<!--{$timeZone}-->';
/* <![CDATA[ */

function getMembers(groupID) {
    $.ajax({
        url: "ajaxJSON.php?a=mod_groups_getMembers&groupID=" + groupID,
        dataType: "json",
        success: function(response) {
            $('#members' + groupID).fadeOut();
            populateMembers(groupID, response);
            $('#members' + groupID).fadeIn();
        },
        cache: false
    });
}

function updateAndGetMembers(groupID) {
    $.ajax({
        type: 'GET',
        url: '../api/?a=system/updateGroup/' + groupID,
        success: function() {
            $.ajax({
                url: "ajaxJSON.php?a=mod_groups_getMembers&groupID=" + groupID,
                dataType: "json",
                success: function(response) {
                    $('#members' + groupID).fadeOut();
                    populateMembers(groupID, response);
                    $('#members' + groupID).fadeIn();
                },
                cache: false
            });
        },
        cache: false
    });
}

function getPrimaryAdmin() {
    $.ajax({
        url: "ajaxJSON.php?a=mod_groups_getMembers&groupID=1",
        dataType: "json",
        success: function(response) {
            $('#membersPrimaryAdmin').fadeOut();
            $('#membersPrimaryAdmin').html('');
            var foundPrimary = false;
            for(var i in response) {
                if(response[i].primary_admin == 1)
                {
                    foundPrimary = true;
                    $('#membersPrimaryAdmin').append(toTitleCase(response[i].Fname) + ' ' + toTitleCase(response[i].Lname) + '<br />');
                }
            }
            if(!foundPrimary)
            {
                $('#membersPrimaryAdmin').append("Primary Administrator has not been set");
            }
            $('#membersPrimaryAdmin').fadeIn();
        },
        cache: false
    });
}

function populateMembers(groupID, members) {
    $('#members' + groupID).html('');
    var memberCt = (members.length - 1);
    var countTxt = (memberCt > 0) ? (' + ' + memberCt + ' others') : '';
    for(var i in members) {

        if(members[i].active == 1 || groupID == 1) {
            if (i == 0) {
               $('#members' + groupID).append('<span>' + toTitleCase(members[i].Fname) + ' ' + toTitleCase(members[i].Lname) + countTxt + '</span>'); 
            } 
        }
    }
}

function removeMember(groupID, userID) {
    $.ajax({
        type: 'DELETE',
        url: "../api/group/" + groupID + "/members/_" + userID + '&CSRFToken=<!--{$CSRFToken}-->',
        success: function(response) {
            updateAndGetMembers(groupID);
        },
        cache: false
    });
}

function addMember(groupID, userID) {
    $.ajax({
        type: 'POST',
        url: "../api/group/" + groupID + "/members",
        data: {'userID': userID,
               'CSRFToken': '<!--{$CSRFToken}-->'},
        success: function(response) {
            updateAndGetMembers(groupID);
        },
        cache: false
    });
}

function addAdmin(userID) {
    $.ajax({
        type: 'POST',
        url: "ajaxIndex.php?a=add_user",
        data: {'userID': userID,
               'groupID': 1,
               'CSRFToken': '<!--{$CSRFToken}-->'},
        success: function(response) {
        	getMembers(1);
        },
        cache: false
    });
}

function removeAdmin(userID) {
    $.ajax({
    	type: 'POST',
        url: "ajaxIndex.php?a=remove_user",
        data: {'userID': userID,
        	   'groupID': 1,
        	   'CSRFToken': '<!--{$CSRFToken}-->'},
        success: function(response) {
        	getMembers(1);
            getPrimaryAdmin();
        },
        cache: false
    });
}

function unsetPrimaryAdmin() {
    $.ajax({
    	type: 'POST',
        url: "../api/system/unsetPrimaryadmin",
        data: {'CSRFToken': '<!--{$CSRFToken}-->'},
        success: function(response) {
        	getPrimaryAdmin();
        },
        cache: false
    });
}

function setPrimaryAdmin(userID) {
        $.ajax({
    	type: 'POST',
        url: "../api/system/setPrimaryadmin",
        data: {'userID': userID, 'CSRFToken': '<!--{$CSRFToken}-->'},
        success: function(response) {
        	getPrimaryAdmin();
        },
        cache: false
    });
}

function getGroupList() {
    $('#groupList').html('<div style="text-align: center; width: 95%">Loading... <img src="../images/largespinner.gif" alt="loading..." /></div>');

    $.ajax({
        type: 'GET',
        url: "../api/group/members",
        dataType: "json",
        success: function(res) {
            $('#groupList').html('');
            for(var i in res) {

            	// only show explicit groups, not ELTs
            	if(res[i].parentGroupID == null
            		&& res[i].groupID != 1) {
                    $('#groupList').append('<div tabindex="0" id="'+ res[i].groupID +'" title="groupID: '+ res[i].groupID +'" class="groupBlockWhite">\
                            <h2 id="groupTitle'+ res[i].groupID +'">'+ res[i].name +'</h2>\
                            <div id="members'+ res[i].groupID +'"></div>\
                            </div>');
            	}
            	else if(res[i].groupID == 1) {
                    $('#adminList').append('<div tabindex="0" id="'+ res[i].groupID +'" title="groupID: '+ res[i].groupID +'" class="groupBlock">\
                            <h2 id="groupTitle'+ res[i].groupID +'">'+ res[i].name +'</h2>\
                            <div id="members'+ res[i].groupID +'"></div>\
                            </div>');
            	}

                if(res[i].groupID != 1) { // if not admin
                    function openGroup(groupID, parentGroupID) {
                        $.ajax({
                            type: 'GET',
                            url: '../api/group/' + groupID + '/members',
                            success: function(res) {
                                dialog.clear();
                                dialog.setContent(
                                    '<button style="float:right" class="buttonNorm" onclick="viewHistory('+groupID+')"><img src="../../libs/dynicons/?img=appointment.svg&amp;w=16" alt="View History" title="View History" style="vertical-align: middle"> View History</button>'+
                                    '<div id="employees"></div><br /><h3>Add Employee:</h3><div id="employeeSelector"></div><br /><br />');
                                $('#employees').html('<table id="employee_table" class="table"></table>');
                                var counter = 0;
                                for(var i in res) {
                                    var removeButton = '<span class="buttonNorm" id="removeMember_'+ counter +'">Remove</span>';
                                    var managedBy = '';
                                    if(res[i].locallyManaged != 1) {
                                        managedBy += '<br /> * Managed in Org. Chart';
                                    }
                                    if(res[i].active != 1) {
                                        managedBy += '<br /> * Managed in Org. Chart';
                                        managedBy += '<br /> * Override set, and they do not have access';
                                        removeButton = '<span class="buttonNorm" id="removeMember_'+ counter +'">Remove Override</span>';
                                    }
                                    $('#employee_table').append('<tr><td>'+ res[i].Lname + ', ' + res[i].Fname + managedBy +'</td><td>'+ removeButton +'</td></tr>');
                                    $('#removeMember_' + counter).on('click', function(userID) {
                                        return function() {
                                            removeMember(groupID, userID);
                                            dialog.hide();
                                        };
                                    }(res[i].userName));
                                    counter++;
                                }
                                empSel = new nationalEmployeeSelector('employeeSelector');
                                empSel.apiPath = '<!--{$orgchartPath}-->/api/?a=';
                                empSel.rootPath = '<!--{$orgchartPath}-->/';
                                empSel.outputStyle = 'micro';
                                empSel.initialize();

                                dialog.setSaveHandler(function() {
                                    if(empSel.selection != '') {
                                        var selectedUserName = empSel.selectionData[empSel.selection].userName;
                                        $.ajax({
                                            type: 'POST',
                                            url: '<!--{$orgchartPath}-->/api/employee/import/_' + selectedUserName,
                                            data: {CSRFToken: '<!--{$CSRFToken}-->'},
                                            success: function(res) {
                                                if(!isNaN(res)) {
                                                    addMember(groupID, selectedUserName);
                                                }
                                                else {
                                                    alert(res);
                                                }
                                            },
                                            cache: false
                                        });
                                    }
                                    dialog.hide();
                                });
                                //508 fix
                                setTimeout(function () {
                                    $("#simplebutton_cancelchange").remove();
                                    $("#simplebutton_save").remove();
                                    dialog.show();
                                }, 0);
                            },
                            cache: false
                        });
                    }

                    //508 fix
                    $('#' + res[i].groupID).on('click', function(groupID, parentGroupID) {
                        return function() {
                            openGroup(groupID, parentGroupID);
                        };
                    }(res[i].groupID, res[i].parentGroupID));
                    $('#' + res[i].groupID).on('keydown', function(groupID, parentGroupID) {
                        return function(event) {
                            if(event.keyCode === 13 || event.keyCode === 32) {
                                openGroup(groupID, parentGroupID);
                            }
                        };
                    }(res[i].groupID, res[i].parentGroupID));
                }
                else { // if is admin
                    function openAdminGroup(){
                        dialog.setContent(
                            '<button class="usa-button usa-button--secondary leaf-btn-small leaf-float-right" onclick="viewHistory(1)">View History</button>'+
                            '<h3 role="heading" tabindex="-1">System Administrators</h3><div id="adminSummary"></div><div class="leaf-marginTop-2rem"><label class="usa-label" role="heading" tabindex="-1" >Add Administrator</label></div><div id="employeeSelector" class="leaf-marginTop-1rem"></div>');

                        empSel = new nationalEmployeeSelector('employeeSelector');
                        empSel.apiPath = '<!--{$orgchartPath}-->/api/?a=';
                        empSel.rootPath = '<!--{$orgchartPath}-->/';
                        empSel.outputStyle = 'micro';
                        empSel.initialize();

                        dialog.setSaveHandler(function() {
                            if(empSel.selection != '') {
                                var selectedUserName = empSel.selectionData[empSel.selection].userName;
                                $.ajax({
                                    type: 'POST',
                                    url: '<!--{$orgchartPath}-->/api/employee/import/_' + selectedUserName,
                                    data: {CSRFToken: '<!--{$CSRFToken}-->'},
                                    success: function(res) {
                                        if(!isNaN(res)) {
                                            addAdmin(selectedUserName);
                                        }
                                        else {
                                            alert(res);
                                        }
                                    },
                                    cache: false
                                });
                            }
                            dialog.hide();
                        });
                        $.ajax({
                            url: "ajaxJSON.php?a=mod_groups_getMembers&groupID=1",
                            dataType: "json",
                            success: function(res) {
                                $('#adminSummary').html('');
                                var counter = 0;
                                for(var i in res) {
                                    $('#adminSummary').append('<div>&bull; '+ res[i].Lname  + ', ' + res[i].Fname +' [ <a tabindex="0" aria-label="Remove '+ res[i].Lname  + ', ' + res[i].Fname +'" href="#" id="removeAdmin_'+ counter +'">Remove</a> ]</div>');
                                    $('#removeAdmin_' + counter).on('click', function(userID) {
                                        return function() {
                                            removeAdmin(userID);
                                            dialog.hide();
                                        };
                                    }(res[i].userName));
                                    counter++;
                                }
                            },
                            cache: false
                        });
                        setTimeout(function () {
                            dialog.show();
                        }, 0);
                    }
                	$('#' + res[i].groupID).on('click', function() {
                		openAdminGroup();
                	});

                    //508 fix
                    $('#' + res[i].groupID).on('keydown', function(event) {
                        if(event.keyCode === 13 || event.keyCode === 32) {
                            openAdminGroup();
                        }
                    });
                }
                populateMembers(res[i].groupID, res[i].members);

                //Primary Admin Section
                if(res[i].groupID == 1) {
                    $('#primaryAdmin').append('<div tabindex="0" class="groupBlock">\
                        <h3 id="groupTitlePrimaryAdmin">Primary Admin</h3>\
                        <div id="membersPrimaryAdmin"></div>\
                        </div>');

                    function openPrimaryAdminGroup(){
                      dialog.setContent('<button class="usa-button usa-button--secondary leaf-btn-small leaf-float-right" onclick="viewHistory()"> View History</button>'+
                            '<h2 role="heading" tabindex="-1">Primary Administrator</h2><div id="primaryAdminSummary"></div><br /><h3 role="heading" tabindex="-1" >Set Primary Administrator:</h3><div id="employeeSelector"></div>');

                        empSel = new nationalEmployeeSelector('employeeSelector');
                        empSel.apiPath = '<!--{$orgchartPath}-->/api/?a=';
                        empSel.rootPath = '<!--{$orgchartPath}-->/';
                        empSel.outputStyle = 'micro';
                        empSel.initialize();

                        dialog.setSaveHandler(function() {
                            if(empSel.selection != '') {
                                var selectedUserName = empSel.selectionData[empSel.selection].userName;
                                $.ajax({
                                    url: 'ajaxJSON.php?a=mod_groups_getMembers&groupID=1',
                                    dataType: "json",
                                    data: {CSRFToken: '<!--{$CSRFToken}-->'},
                                    success: function(res) {
                                        var selectedUserIsAdmin = false;
                                        for(var i in res)
                                        {
                                            selectedUserIsAdmin = res[i].userName == selectedUserName;
                                            if(selectedUserIsAdmin){break;}
                                        }
                                        if(selectedUserIsAdmin)
                                        {
                                            setPrimaryAdmin(selectedUserName);
                                        }
                                        else
                                        {
                                            alert('Primary Admin must be a member of the Sysadmin group');
                                        }
                                    },
                                    cache: false
                                });
                            }
                            dialog.hide();
                        });
                        $.ajax({
                            url: "ajaxJSON.php?a=mod_groups_getMembers&groupID=1",
                            dataType: "json",
                            success: function(res) {
                                $('#primaryAdminSummary').html('');
                                var foundPrimary = false;
                                for(var i in res) {
                                    if(res[i].primary_admin == 1)
                                    {
                                        foundPrimary = true;
                                        $('#primaryAdminSummary').append('<div>&bull; '+ res[i].Lname  + ', ' + res[i].Fname +' [ <a tabindex="0" aria-label="Unset '+ res[i].Lname  + ', ' + res[i].Fname +'" href="#" id="unsetPrimaryAdmin">Unset</a> ]</div>');
                                        $('#unsetPrimaryAdmin').on('click', function() {
                                                unsetPrimaryAdmin();
                                                dialog.hide();
                                        });
                                    }
                                }
                                if(!foundPrimary)
                                {
                                   $('#primaryAdminSummary').append("Primary Admin has not been set.");
                                }

                            },
                            cache: false
                        });
                        setTimeout(function () {
                            dialog.show();
                        }, 0);
                    }
                    $('#primaryAdmin').on('click', function() {
                		openPrimaryAdminGroup();
                	});

                    //508 fix
                    $('#primaryAdmin').on('keydown', function(event) {
                        if(event.keyCode === 13 || event.keyCode === 32) {
                            openPrimaryAdminGroup();
                        }
                    });
                    $('#membersPrimaryAdmin').html('');
                    primaryAdminName = "Primary Admin has not been set.";
                    for(var j in res[i].members) {
                        if(res[i].members[j].primary_admin == 1)
                        {
                             primaryAdminName = toTitleCase(res[i].members[j].Fname) + ' ' + toTitleCase(res[i].members[j].Lname);
                        }
                    }
                    $('#membersPrimaryAdmin').append(primaryAdminName + '<br />');
                }
            }
        },
        cache: false
    });
}

function viewHistory(groupID){
  dialog_simple.setContent('');
  dialog_simple.setTitle('Group History');
	dialog_simple.indicateBusy();

  var type = (groupID)? "group": "primaryAdmin";

    $.ajax({
        type: 'GET',
        url: 'ajaxIndex.php?a=gethistory&type='+type+'&id='+groupID+'&tz='+tz,
        dataType: 'text',
        success: function(res) {
            dialog_simple.setContent(res);
            dialog_simple.indicateIdle();
            dialog_simple.show();
        },
        cache: false
    });

}

function viewPrimaryAdminHistory(){
    dialog_simple.setContent('');
    dialog_simple.setTitle('Primary Admin History');
	dialog_simple.indicateBusy();

    $.ajax({
        type: 'GET',
        url: 'ajaxIndex.php?a=gethistory&type=primaryAdmin&tz='+tz,
        dataType: 'text',
        success: function(res) {
            dialog_simple.setContent(res);
            dialog_simple.indicateIdle();
            dialog_simple.show();
        },
        cache: false
    });
}

// used to import and add groups
function tagAndUpdate(groupID, callback) {
    $.when(
            $.ajax({
                type: 'POST',
                url: '<!--{$orgchartPath}-->/api/?a=group/'+ groupID + '/tag',
                data: {
                    tag: '<!--{$orgchartImportTag}-->',
                    CSRFToken: '<!--{$CSRFToken}-->'
                },
                success: function() {
                },
                cache: false
            }),
            $.ajax({
                type: 'GET',
                url: '../api/?a=system/updateGroup/' + groupID,
                success: function() {
                },
                cache: false
            })
        ).then(function() {
        	if(callback != undefined) {
        		callback();
        	}
            window.location.reload();
    });
}

function importGroup() {
    dialog.setTitle('Import Group');
    dialog.setContent('<p role="heading" tabindex="-1">Import a group from another LEAF site:</p><div class="leaf-marginTop-1rem"><label>Group Title</label><div id="groupSel_container"></div></div>');

    var groupSel = new groupSelector('groupSel_container');
    groupSel.apiPath = '<!--{$orgchartPath}-->/api/?a=';
    groupSel.basePath = '../';
    groupSel.setResultHandler(function() {
        if(groupSel.numResults == 0) {
            groupSel.hideResults();
        }
        else {
            groupSel.showResults();
        }

        // prevent services from showing up as search results
        for(var i in groupSel.jsonResponse) {
            $('#' + groupSel.prefixID + 'grp' + groupSel.jsonResponse[i].groupID).attr('tabindex', '0');
            if(groupSel.jsonResponse[i].tags.service != undefined) {
                $('#' + groupSel.prefixID + 'grp' + groupSel.jsonResponse[i].groupID).css('display', 'none');
            }
        }
    });
    groupSel.initialize();

    dialog.setSaveHandler(function() {
        if(groupSel.selection != '') {
        	tagAndUpdate(groupSel.selection);
        }
    });
    dialog.show();
}

function createGroup() {
    dialog.setTitle('Create a new group');
    dialog.setContent('<div><label role="heading">Group Title</label><div class="leaf-marginTop-halfRem"><input aria-label="Enter group name" id="groupName" class="usa-input" size="36"></input></div></div>');

    dialog.setSaveHandler(function() {
    	dialog.indicateBusy();
        //list of possible errors returned by the api call
        possibleErrors = [
            "Group title must not be blank",
            "Group title already exists",
            "invalid parent group"
        ];
        $.ajax({
            type: 'POST',
            url: '<!--{$orgchartPath}-->/api/?a=group',
            data: {title: $('#groupName').val(),
                   CSRFToken: '<!--{$CSRFToken}-->'},
            success: function(res) {
                if(possibleErrors.indexOf(res) != -1) {
                    alert(res);
                    dialog.hide();
                }
                else {
                    tagAndUpdate(res, function() {
                        dialog.indicateIdle();
                    });
                }
            },
            cache: false
        });
    });
    dialog.show();
    $('input:visible:first, select:visible:first').focus();
}

// convert to title case
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function showAllGroupHistory() {
    dialog.setTitle('All Group History');
    $.ajax({
        type: 'GET',
        url: 'ajaxIndex.php?a=gethistoryall&type=group&tz='+tz,
        dataType: 'text',
        success: function(res) {
            dialog.setContent(res);
            dialog.indicateIdle();
            dialog.show();
        },
        cache: false
    });

}

var dialog;
$(function() {
	dialog = new dialogController('xhrDialog', 'xhr', 'loadIndicator', 'button_save', 'button_cancelchange');
	dialog_simple = new dialogController('simplexhrDialog', 'simplexhr', 'simpleloadIndicator', 'simplebutton_save', 'simplebutton_cancelchange');

	$('#simpleloadIndicator').css({width: $(window).width() * .78, height: $(window).height() * .78});
	$('#simplexhr').css({width: $(window).width() * .8, height: $(window).height() * .8});

    getGroupList();
});

/* ]]> */
</script>
