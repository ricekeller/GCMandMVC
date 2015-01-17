$($("#upperToolBarContainer").mouseleave(function ()
{
	$("#upperToolBarContent").animate({ opacity: 0 }, 2000);
}).mouseenter(function ()
{
	$("#upperToolBarContent").animate({ opacity: 1 }, 500);
}));
