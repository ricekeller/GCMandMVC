var PhotoViewer = function (setID) {
    this.__setID = setID;
    var con = $("<div id='photo-viewer-container'></div>").appendTo($("#mainContentContainer"));
    this.__mainContainer = $("#photo-viewer-container");
    this.__bindScrollEvent();
};
PhotoViewer.prototype =
{
    __masonry: null,
    __getMorePhotoUrl: "/Media/GetPhotosInSet",
    __loadAlbumInfoUrl: "/Media/GetPhotoset",
    __pageLoaded: 0,
    __glisseChangeEffects : ['bounce', 'fadeBig', 'fade', 'roll', 'rotate', 'flipX', 'flipY'],
    __getMorePhoto: function (setID, page) {
        $.ajax({
            url: this.__getMorePhotoUrl,
            data: { setID: setID, page: page },
            context: this,
        }).done(this.__getMorePhotoHandler);
    },
    __getMorePhotoHandler: function (data, status) {
        if (!data) return;
        for (var i = 0; i < data.length; i++) {
            this.__createPhotoElement(data[i]);
        }
        if (!this.__masonry) {
            this.__initializeMasonry();
        }
        else {
            this.layoutMasonry();
        }
    },
    __createPhotoElement: function (photo) {
        var div = $("<div></div>").addClass("box");
        var img = $("<img></img>").attr("src", photo.SmallUrl).addClass("photo-item-img");
        img.attr("data-glisse-big", photo.LargeUrl).attr("rel", "group-photo").attr("title",photo.Title);
        var infoDiv = $("<div></div>");
        var p = $("<p class='hidden'></p>").text(photo.Title);
        infoDiv.append(p);
        div.append(img).append(infoDiv);
        div.appendTo(this.__mainContainer);
        this.__enableGlisse();
    },
    __photoClicked: function (event, src) {
        alert("event");
    },
    __initializeMasonry: function () {
        // initialize Masonry
        this.__masonry = new Masonry('#photo-viewer-container', {
            itemSelector: '.box',
            columnWidth: 1,
            gutter: 10,
            isAnimated: true
        });
    },
    __loadAlbumInfoHandler: function (data) {
        if (!data) return;
        var dt = data.DateCreated.replace("/Date(", "").replace(")/", "");
        $("#photoset-photoCount").text(data.NumberOfPhotos);
        $("#photoset-datecreated").text(new Date(parseInt(dt)).toLocaleDateString());
        $("#photoset-description").text(data.Description);
    },
    __enableGlisse: function ()
    {
    	var $this = this;
    	$(".photo-item-img").glisse({
    		changeSpeed: 550,
    		speed: 500,
    		effect: 'bounce',
    		fullscreen: false
    	});
    	$(".photo-item-img").each(function ()
    	{
    		$(this).data('glisse').changeEffect($this.getRandomGlisseEffect());
    	});
    },
    __bindScrollEvent:function()
    {
    	$("#mainContentContainer").unbind('scroll');
    	$("#mainContentContainer").scroll(function (eventObj)
    	{
    		if ($(this).scrollTop() + $(this).innerHeight() > $(this)[0].scrollHeight)
    		{
    			alert('end reached');
    		}
    	});
    },
    cleanUp: function () {
        this.__mainContainer.empty();
        this.__mainContainer.remove();
    },
    loadMorePhoto: function () {
        this.__getMorePhoto(this.__setID, ++this.__pageLoaded);
    },
    layoutMasonry: function () {
        if (!this.__masonry) {
            this.__initializeMasonry();
        }
        this.__masonry.layout();
    },
    loadAlbumInfo: function () {
        $.ajax({
            url: this.__loadAlbumInfoUrl,
            data: { setID: this.__setID },
            context: this,
        }).done(this.__loadAlbumInfoHandler);
    },
    getRandomGlisseEffect:function()
    {
    	return this.__glisseChangeEffects[parseInt(Math.random()*this.__glisseChangeEffects.length)];
    }
};