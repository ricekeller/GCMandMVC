var clientId;
$(document).ready(function ()
{
	$("#pushbtn").click(function ()
	{
		var obj = { "MessageContent": $("#push").val(), "Sender": $("#username").val(), "ClientId": clientId };
		var data = JSON.stringify(obj);
		$.ajax({
			type: "POST",
			url: "/api/chatapi/",
			data: data,
			success: function (e)
			{
				console.log("success:" + e);
			},
			dataType: "json",
			contentType: "application/json;charset=utf-8",
		});
		$("#push").val('');
	});
	//if (!!window.EventSource)
	//{
	//	var source = new EventSource('/api/chatapi/');
	//	source.addEventListener("clientid", function (e)
	//	{
	//		clientId = JSON.parse(e.data);
	//	});
	//	source.onmessage = function (e)
	//	{
	//		var json = JSON.parse(e.data);
	//		console.log(json);
	//	};
	//	source.onopen = function (e)
	//	{
	//		console.log("open!");
	//	};
	//	source.onerror = function (e)
	//	{
	//		if (e.readyState == EventSource.CLOSED)
	//		{
	//			console.log("error!");
	//		}
	//	};
	//} else
	//{
	//	// not supported!
	//	//fallback to something else
	//}

	$.get("/Chat/GetDashboardInfo", function (data)
	{
		$("#general-info").text("Total # of rooms:" + data.NumofRooms + "\r\n" + "Total # of users:" + data.NumofUsers);
	});
	$("#create_room").click(function (e)
	{
		$("#create_room_popup").dialog({
			resizable: false,
			modal: true,
			show: {
				effect: "blind",
				duration: 1000
			},
			hide: {
				effect: "explode",
				duration: 1000
			},
			buttons: {
				"Accept": function ()
				{
					var isPrivate = $("#is_private").is(":checked");
					var pwd = isPrivate ? $("#room_pwd").val() : "";
					var data = { IsPrivate: isPrivate, Password: pwd };
					var $this = $(this);
					$.post("/Chat/CreateRoom", data, function (data)
					{
						if(data)
						{
							window.location.href = "/Chat/JoinRoom/?rId=" + data;
							$this.dialog("close");
						}
					});
				},
				Cancel: function ()
				{
					$(this).dialog("close");
				}
			}
		});
	});
	$("#join_room").click(function (e)
	{
		console.log("join clicked");
	});
	$("#is_private").click(function ()
	{
		var $this = $(this);
		// $this will contain a reference to the checkbox   
		if ($this.is(':checked'))
		{
			// the checkbox was checked 
			$("#room_pwd").prop("disabled", false);
		} else
		{
			// the checkbox was unchecked
			$("#room_pwd").prop("disabled", true);
		}
	});
});