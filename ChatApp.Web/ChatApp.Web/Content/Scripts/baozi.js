$(document).ready(
	function()
	{
		$("#div_addBaozi").dialog({
			autoOpen: false,
			resizable: false,
			height: 400,
			width:600,
			modal: true,
			buttons: {
				"Delete all items": function() {
					$( this ).dialog( "close" );
				},
				Cancel: function() {
					$( this ).dialog( "close" );
				}
			}
		});

		//hook up events
		$("#btn_addNewBaozi").click(function ()
		{
			$("#div_addBaozi").dialog("open");
		});
		$(".baoziRow,.rowCommands").hover(
			function () //in
			{
				$(this).children(".rowCommands").fadeTo(200,1);
			},
			function () //out
			{
				$(this).children(".rowCommands").fadeTo(200, 0);
			}
		);
	}
);