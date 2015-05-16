//var pv = new PhotoViewer("72157649853753763");
//var imgLoad = imagesLoaded($("#photo-viewer-container"));
var pv = new PhotoViewer("72157651794085640");
$('#photoset-selection').selectmenu({
    change: function (event, ui) {
        var setID = ui.item.value;
        pv.cleanUp();
        pv = new PhotoViewer(setID);
        bindImageLoaded();
        pv.loadAlbumInfo();
        pv.loadMorePhoto();
    }
});
function bindImageLoaded()
{
    $('#photo-viewer-container').imagesLoaded()
    .always(function (instance) {
    	pv.layoutMasonry();
    });
}
bindImageLoaded();
pv.loadMorePhoto();