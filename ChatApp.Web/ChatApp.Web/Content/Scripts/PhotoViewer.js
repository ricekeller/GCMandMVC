var PhotoViewer = function (setID) {
    this.__setID = setID;
    this.__mainContainer = $("#photo-viewer-container");
};
PhotoViewer.prototype =
{
    __masonry:null,
    __getMorePhotoUrl: "/Media/GetPhotosInSet",
    __pageLoaded: 0,
    __getMorePhoto: function (setID, page) {
        $.ajax({
            url: this.__getMorePhotoUrl,
            data:{ setID: setID, page: page },
            context:this,
        }).done(this.__getMorePhotoHandler);
    },
    __getMorePhotoHandler: function (data,status) {
        if (!data) return;
        for (var i = 0; i < data.length; i++) {
            this.__createPhotoElement(data[i]);
        }
        if (!this.__masonry)
        {
            this.__initializeMasonry();
        }
        else
        {
            this.__masonry.layout();
        }
    },
    __createPhotoElement: function (photo) {
        var div = $("<div></div>").addClass("box");
        var img = $("<img></img>").attr("src",photo.ThumbnailUrl);
        img.click(this.__photoClicked);
        var infoDiv = $("<div></div>");
        var p = $("<p class='hidden'></p>").text(photo.Title);
        infoDiv.append(p);
        div.append(img).append(infoDiv);
        div.appendTo(this.__mainContainer);
    },
    __photoClicked: function (event,src) {
        alert("event");
    },
    loadMorePhoto: function () {
        this.__getMorePhoto(this.__setID, this.__pageLoaded + 1);
    },
    __initializeMasonry: function () {
        // initialize Masonry
        this.__masonry = new Masonry('#photo-viewer-container', {
            itemSelector: '.box',
            columnWidth: 1,
            gutter:10,
            isAnimated: true
        });
    }
};