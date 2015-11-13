﻿var player = null;
var playList = null;
var playListInfo = null;

function onPlayerReady_(event)
{
	player.cuePlaylist({
		listType: "playlist",
		list: "PLebSyLoh-P6d4-cPhrQCNKJqNFTONMUPH",
	});
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
		var li = $("<li></li>").addClass("player-center-main-listitem").text(title).data("idx", i);
		ul.append(li);
	}
	// setup the display style of the play list ul and hook select event
	ul.menu({
		select: function (event, ui)
		{
			var idx = ui.item.data("idx");
			player.playVideoAt(idx);
		}
	});
}

var YouTubePlayer = function ()
{

}
YouTubePlayer.prototype =
{
	__data: null,
	__player: null,
	__createYoutubePlayer: function ()
	{
		this.__player = new YT.Player('player-container', {
			height: '390',
			width: '640',
			listType: 'playlist',
			playerVars: {
				controls: 0,
				fs: 0
			},
			events: {
				'onReady': this.__onPlayerReady.bind(this),
				'onStateChange': this.__onPlayerStateChange.bind(this),
				'onPlaybackQuanlityChange': this.__onPlaybackQuanlityChange.bind(this),
				'onError': this.__onPlayerError.bind(this)
			}
		});
	},
	__buildPlaylists: function ()
	{
		var parent = $("#playlists").empty();
		var i = 0;
		var li = null;
		$.each(this.__data.Data, function (k, v)
		{
			li = $("<li></li>").text(v.Playlist.Snippet.Title).data("PlaylistId", k);
			parent.append(li);
		});
		parent.menu({
			select: this.__onSelectPlaylist.bind(this)
		});
	},
	__buildVideoList: function (ui)
	{
		var parent = $("#video-list").empty();
		var i = 0;
		var li = null;
		$.each(this.__data.Data[$(ui.item).data("PlaylistId")].Videos, function (idx, v)
		{
			li = $("<li></li>").text(v.Snippet.Title).data("VideoId", v.Snippet.ResourceId.VideoId);
			parent.append(li);
		});
		parent.menu("refresh");
	},
	__onSelectPlaylist: function (event, ui)
	{
		//build the list
		this.__buildVideoList(ui);
		//display the title
		var listId = $(ui.item).data("PlaylistId");
		$("#span_list_title").text(this.__data.Data[listId].Playlist.Snippet.Title);
		//load and play the list
		this.__player.loadPlaylist({
			list: listId
		});
	},
	__onSelectVideo: function (event, ui)
	{

	},
	__onPlayerReady: function (event)
	{

	},
	__onPlayerStateChange: function (event)
	{
		switch (event.data)
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
				console.log(1);
				break;
		}
	},
	__onPlaybackQuanlityChange: function (event)
	{

	},
	__onPlayerError: function (event)
	{

	},
	__updateProgressBar: function ()
	{
		if (this.__player && this.__player.getPlayerState() == 1)
		{
			//1: playing
			var duration = this.__player.getDuration();
			var current = this.__player.getCurrentTime();
			if (0 != duration)
			{
				$("#progress-bar").width($("#bottom").width() * current / duration);
			}
		}
	},
	init: function ()
	{
		//get data and fill lists
		this.__data = tmpData;
		delete window.tmpData;

		this.__buildPlaylists();
		$("#video-list").menu({
			select: this.__onSelectVideo.bind(this)
		});

		//create the player
		this.__createYoutubePlayer();

		//set the position of progress-bar and control-bar
		var pos = $("#bottom").offset();
		var height = $("#bottom").height();
		var width = $("#bottom").width();
		$("#progress-bar").offset({ top: pos.top, left: pos.left }).height(height).width(0);
		$("#control-container").offset({ top: pos.top, left: pos.left }).height(height).width(width);

		//update progress-bar every 500ms
		setInterval(this.__updateProgressBar.bind(this));
	},
}