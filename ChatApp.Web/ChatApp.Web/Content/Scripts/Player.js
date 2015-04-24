var player = null;
var playList = null;

function initializePlayer()
{
	// This code loads the IFrame Player API code asynchronously.
	var tag = document.createElement('script');

	tag.src = "https://www.youtube.com/iframe_api";
	var firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}
function onYouTubeIframeAPIReady()
{
	player = new YT.Player('iframe-player', {
		height: '390',
		width: '640',
		listType: 'playlist',
		list: 'PLebSyLoh-P6d4-cPhrQCNKJqNFTONMUPH',
		events: {
			'onReady': onPlayerReady,
			'onStateChange': onPlayerStateChange
		}
	});
}

function onPlayerReady(event)
{
	player.cuePlaylist({
		listType: "playlist",
		list: "PLebSyLoh-P6d4-cPhrQCNKJqNFTONMUPH",
	});
}

var done = false;
function onPlayerStateChange(event)
{
	switch(event.data)
	{
		case YT.PlayerState.ENDED:
			break;
		case YT.PlayerState.PLAYING:
			break;
		case YT.PlayerState.PAUSED:
			break;
		case YT.PlayerState.BUFFERING:
			break;
		case YT.PlayerState.CUED:
			//get list and build list
			__buildPlayList();
			break;
	}
}
function stopVideo()
{
	player.stopVideo();
}

function __buildPlayList()
{
	var lists = player.getPlaylist();
	var result = [];
	var centerDiv = $("player-center-main");
	var ul = $("<ul></ul>");
	ul.id = "player-center-main-playlist";
	for(var i=0;i<lists.length;i++)
	{
		var title = i;//TODO: get title
		result.push(title);
		var li = $("<li class='player-center-main-listitem'></li>");
		li.text(title);
		ul.append(li);
	}
	centerDiv.append(ul);
}
function __buildListItem(item)
{

}