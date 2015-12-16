var player = null;
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
	__playerReady: false,
	__currentPlayStatus: null,
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
		this.__playerReady = this.__player != null;
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
			li = $("<li></li>").text(v.Snippet.Title).data("VideoIdx", /*v.Snippet.ResourceId.VideoId*/idx);
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

		//set the selected style
		$("#playlists .selected").removeClass("selected");
		$(ui.item).addClass("selected");
	},
	__onSelectVideo: function (event, ui)
	{
		//get video index in the playlist and play it
		var vidIdx = $(ui.item).data("VideoIdx");
		if (null !== vidIdx)
		{
			this.__player.playVideoAt(vidIdx);
			//set the selected style
			this.__setSelectedVideoStyle(ui.item);
		}
	},
	__setSelectedVideoStyle: function (elem)
	{
		$("#video-list .selected").removeClass("selected");
		if (elem)
		{
			$(elem).addClass("selected");
		}
		else
		{
			var newIdx = this.__player.getPlaylistIndex();
			if (null !== newIdx)
			{
				$($("#video-list li")[newIdx]).addClass("selected");
			}
		}
	},
	__onPlayerReady: function (event)
	{

	},
	__onPlayerStateChange: function (event)
	{
		switch (event.data)
		{
			case YT.PlayerState.ENDED:
				$("#play-pause-icon").attr("src", "/Content/Images/YoutubePlayer/play.png");
				break;
			case YT.PlayerState.PLAYING:
				$("#play-pause-icon").attr("src", "/Content/Images/YoutubePlayer/pause.png");
				//set the volume
				$("#volumn-slider").slider("value", this.__player.getVolume());
				//set the style 
				this.__setSelectedVideoStyle();
				break;
			case YT.PlayerState.PAUSED:
				$("#play-pause-icon").attr("src", "/Content/Images/YoutubePlayer/play.png");
				break;
			case YT.PlayerState.BUFFERING:
				break;
			case YT.PlayerState.CUED:
				$("#play-pause-icon").attr("src", "/Content/Images/YoutubePlayer/play.png");
				break;
		}
	},
	__onPlaybackQuanlityChange: function (event)
	{

	},
	__onPlayerError: function (event)
	{

	},
	__onControlBtnClicked: function (event)
	{
		if (event && event.currentTarget)
		{
			var id = event.currentTarget.id;
			switch (id)
			{
				case "btn-previous":
					this.__player.previousVideo();
					break;
				case "btn-playPause":
					switch (this.__player.getPlayerState())
					{
						case -1://unstarted
						case 0://ended
						case 2://paused
						case 5://video cued
							this.__player.playVideo();
							break;
						case 1://playing
							this.__player.pauseVideo();
							break;
					}
					break;
				case "btn-next":
					this.__player.nextVideo();
					break;
			}
		}
	},
	__updateProgressBar: function ()
	{
		if (this.__player && this.__playerReady && this.__player.getPlayerState && this.__player.getPlayerState() == 1)
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
		var that = this;
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

		//volumn slider
		$("#volumn-slider").slider({
			orientation: "horizontal",
			range: "min",
			min: 0,
			max: 100,
			value: 60,
			slide: function (event, ui)
			{
				that.__player.setVolume(ui.value);
			}
		});

		//hookup events
		$(".control-img-div").click(this.__onControlBtnClicked.bind(this));

		//update progress-bar every 500ms
		setInterval(this.__updateProgressBar.bind(this));
	},
}