var clientId;
$(document).ready(function ()
{
	$("#pushbtn").click(function ()
	{
		var obj = { "MessageContent": $("#push").val(), "Sender": $("#username").val(), "ClientId": clientId };
		var data = JSON.stringify(obj);
		$.ajax({
			url: "/api/chatapi/",
			data: data,
			cache: false,
			type: 'POST',
			dataType: "json",
			contentType: 'application/json; charset=utf-8'
		});
		$("#push").val('');
	});
	if (!!window.EventSource)
	{
		var source = new EventSource('/api/chatapi/');
		source.addEventListener("clientid", function (e)
		{
			clientId = JSON.parse(e.data);
		});
		source.onmessage = function (e)
		{
			var json = JSON.parse(e.data);
			console.log(json);
		};
		source.onopen = function (e)
		{
			console.log("open!");
		};
		source.onerror = function (e)
		{
			if (e.readyState == EventSource.CLOSED)
			{
				console.log("error!");
			}
		};
	} else
	{
		// not supported!
		//fallback to something else
	}
});