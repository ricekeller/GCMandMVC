var player = null;
var playList = null;
var playListInfo = null;

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
	__getPlayListInfo("PLebSyLoh-P6d4-cPhrQCNKJqNFTONMUPH");
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
			break;
	}
}
function stopVideo()
{
	player.stopVideo();
}

function __buildPlayList()
{
	var ul = $("#player-center-main-playlist");
	ul.empty();
	for (var i = 0; i < playListInfo.items.length; i++)
	{
	    var title = playListInfo.items[i].snippet.title;
	    var li = $("<li></li>").addClass("player-center-main-listitem").text(title).data("idx",i);
		ul.append(li);
	}
    // setup the display style of the play list ul and hook select event
	ul.menu({
	    select: function (event, ui) {
	        var idx = ui.item.data("idx");
	        player.playVideoAt(idx);
	    }
	});
}
function __buildListItem(item)
{

}

function __getPlayListInfo(listId)
{
    var url = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=" + listId + "&key=" + "AIzaSyCo-q1vlh3Koh9g8cauTwE_x4Va68bMelo";
    $.get(url, function (data) {
        playListInfo = data;
        //get list and build list
        __buildPlayList();
    });
}