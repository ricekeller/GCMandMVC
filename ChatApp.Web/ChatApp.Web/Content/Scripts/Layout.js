$(function ()
{
	$("#menu").menu({
		select: function (event, ui)
		{
		    //do action
		    var wholepage = ui.item.attr("data-wholepage");
		    var url = ui.item.attr("data-url");
		    var postAction = ui.item.attr("data-postLoadAction") + "()";
		    if (wholepage)
		    {
		        if (null !== postAction && postAction !== "" && postAction !== "undefined()") {
		            eval(postAction);
		        }
		    }
		    else
		    {
		        if (url && null !== url && url !== "") {
		            overlay();
		            $.get(url, function (data) {
		                $("#mainContentContainer").html(data);
		                if (null !== postAction && postAction !== "" && postAction !== "undefined()") {
		                    eval(postAction);
		                }
		                overlay();
		            });
		        }
		    }
		}
	});
	loadNews();
});
function _postFormData(formid, url)
{
	var form = $("#" + formid);
	$.ajax({
		type: "POST",
		url: url,
		data: form.serialize(),
		cache: false,
		success: function (data)
		{
			$("#mainContentContainer").html(data);
		}
	});
}
function _showLoadingDiv()
{
	$("#overlay").dialog({

	}).show();
}

function _hideLoadingDiv()
{
	$("#overlay").hide();
}

function overlay()
{
	var el = document.getElementById("overlay");
	el.style.visibility = (el.style.visibility == "visible") ? "hidden" : "visible";
}

function switchBusyOverlay(toOpen)
{
	var el = document.getElementById("overlay");
	el.style.visibility = toOpen?"visible":"hidden";
}

function loadNews()
{
	$.ajax({
		url: '/home/getnews',
		context: this,
	}).done(function (data)
	{
		$("#mainContentContainer").html(data);
	});
}