$(function()
{
    $("#menu").menu({
        select:function(event,ui)
        {
        	var url = ui.item.attr("data-url");
        	var postAction = ui.item.attr("data-postLoadAction")+"()";
        	if (null !== url && url !== "")
        	{
        		$.get(url, function (data)
        		{
        			$("#mainContentContainer").html(data);
        			if(null!==postAction&&postAction!=="")
        			{
        				eval(postAction);
        			}
        		});
        	}
        }
    });
});
