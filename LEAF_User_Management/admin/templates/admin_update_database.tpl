<div id="toolbar" class="toolbar_right toolbar noprint" style="position: absolute; right: 2px"></div>

<div style="width: 85%">
    <span style="font-size: 18px; font-weight: bold">Database Update</span>
    <br /><br />

    <div id="groupList"></div>
</div>

<div id="editdialog1" style="visibility: hidden">
    <div>
        <div id="editxhr" style="width: 500px; height: 400px; overflow: auto">
            <div style="position: absolute; left: 10px"><button id="button_cancelchange"><img src="../../libs/dynicons/?img=process-stop.svg&amp;w=16" alt="cancel" /> Cancel</button></div>
            <div style="border-bottom: 2px solid black; text-align: right"><br /><br />&nbsp;<!--<button id="button_save"><img src="../../libs/dynicons/?img=list-add.svg&amp;w=16" alt="save" /> Add user</button>--></div><br />            
            <span>Search: </span><input id="query" type="text" /><div id="loadIndicator" style="visibility: hidden; float: right"><img src="../images/indicator.gif" alt="loading..." /></div>
            <br /><div id="results"></div>        
        </div>
    </div>
</div>

<script type="text/javascript">
/* <![CDATA[ */

$(function() {
    $('#groupList').html('<div style="border: 2px solid black; text-align: center; font-size: 24px; font-weight: bold; background: white; padding: 16px; width: 95%">Loading... <img src="../images/largespinner.gif" alt="loading..." /></div>');

    $.ajax({
        url: "../scripts/updateDatabase.php",
        dataType: "text",
        success: function(response) {
            $('#groupList').html('<pre>' + response + '</pre>');
        },
        cache: false
    });
});

/* ]]> */
</script>