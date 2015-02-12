$(function () {
    $("#menu").menu({
        select: function (event, ui) {
            var url = ui.item.attr("data-url");
            var postAction = ui.item.attr("data-postLoadAction") + "()";
            if (null !== url && url !== "") {
                $.get(url, function (data) {
                    $("#mainContentContainer").html(data);
                    if (null !== postAction && postAction !== "" && postAction !== "undefined()") {
                        eval(postAction);
                    }
                });
            }
        }
    });
});
function _postFormData(formid, url) {
    var form = $("#" + formid);
    $.ajax({
        type: "POST",
        url: url,
        data: form.serialize(),
        cache: false,
        success: function (data) {
            $("#mainContentContainer").html(data);
        }
    });
}
