//var pv = new PhotoViewer("72157649853753763");
$('#photoset-selection').selectmenu({
    change: function (event, ui) {
        var setID = ui.item.value;
        console.log(setID);
    }
});
var imgLoad = imagesLoaded($("#photo-viewer-container"));
var pv = new PhotoViewer("72157651794085640");
$('#photo-viewer-container').imagesLoaded()
    .always(function (instance) {
        pv.layoutMasonry();
    });
pv.loadMorePhoto();