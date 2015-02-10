$(function()
{
    $("#menu").menu({
        select:function(event,ui)
        {
            window.location = ui.item.attr("data-url");
        }
    });
});
