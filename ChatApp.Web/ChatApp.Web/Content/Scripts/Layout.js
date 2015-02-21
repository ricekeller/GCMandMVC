$(function ()
{
	$("#menu").menu({
		select: function (event, ui)
		{
			var url = ui.item.attr("data-url");
			var postAction = ui.item.attr("data-postLoadAction") + "()";
			if (url && null !== url && url !== "")
			{
			    overlay();
				$.get(url, function (data)
				{
					$("#mainContentContainer").html(data);
					if (null !== postAction && postAction !== "" && postAction !== "undefined()")
					{
						eval(postAction);
					}
					overlay();
				});
			}
		}
	});
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
	el = document.getElementById("overlay");
	el.style.visibility = (el.style.visibility == "visible") ? "hidden" : "visible";
}
