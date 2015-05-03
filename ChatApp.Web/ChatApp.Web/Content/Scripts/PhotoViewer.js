var PhotoViewer = function (setID) {
    this.__setID = setID;
    var con = $("<div id='photo-viewer-container'></div>").appendTo($("#mainContentContainer"));
    this.__mainContainer = $("#photo-viewer-container");
};
PhotoViewer.prototype =
{
    __masonry: null,
    __getMorePhotoUrl: "/Media/GetPhotosInSet",
    __loadAlbumInfoUrl: "/Media/GetPhotoset",
    __pageLoaded: 0,
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
        img.click(this.__photoClicked);
        var infoDiv = $("<div></div>");
        var p = $("<p class='hidden'></p>").text(photo.Title);
        infoDiv.append(p);
        div.append(img).append(infoDiv);
        div.appendTo(this.__mainContainer);
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
    }
};