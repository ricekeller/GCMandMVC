$(function ()
{
	$("#test").dialog({
		autoOpen: false,
		resizable: false,
		modal: true,
		position: { my: "center", at: "center", of: window },
		show: "slide",
		hide:"puff"
	});
	$(".iconDiv").click(function ()
	{
		$("#test").dialog("open");
	});
	$("#accordion").accordion();
	$(".accHeader").hoverIntent({
		over: function (a, b)
		{
			var idx = parseInt($(this).attr("data-acc-index"));
			$("#accordion").accordion("option", "active", idx);
		},
		out: function () { }
	});
	$("#mytabs").tabs();
});